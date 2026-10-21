import type { SseEvent, SseEventType, SseEventMap } from '../events'
import type { Transport } from './transport'

import { TransportError } from '../errors'
import { parseJson } from '../api/json'

/** Configuration for SSE transport reconnection behavior */
export interface SseOptions {
  retryDelay?: number
  maxRetryDelay?: number
}

const DEFAULT_RETRY_DELAY = 1_000
const DEFAULT_MAX_RETRY_DELAY = 30_000
const HEARTBEAT_TIMEOUT_MS = 45_000
const FATAL_STATUSES = new Set([400, 401, 403])

/** Server-Sent Events transport with automatic reconnection and heartbeat monitoring */
export class SseTransport implements Transport {
  private readonly token: string
  private readonly baseUrl: string
  private readonly intents: () => number
  private readonly retryDelay: number
  private readonly maxRetryDelay: number
  private readonly debug: boolean

  /** `intents` may be a getter so the bot can add intents for handlers registered before `start()` */
  constructor(
    token: string,
    baseUrl: string,
    intents: number | (() => number),
    options: SseOptions = {},
    debug: boolean = false,
  ) {
    this.token = token
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.intents = typeof intents === 'function' ? intents : () => intents
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY
    this.maxRetryDelay = options.maxRetryDelay ?? DEFAULT_MAX_RETRY_DELAY
    this.debug = debug
  }

  async *start(signal: AbortSignal): AsyncIterable<SseEvent> {
    let lastEventId: string | null = null
    let currentRetryDelay = this.retryDelay
    let fatal: TransportError | null = null

    while (!signal.aborted) {
      try {
        const url = new URL(`${this.baseUrl}/IEvents/v1/Stream`)
        url.searchParams.set('intents', String(this.intents()))

        if (lastEventId !== null) {
          url.searchParams.set('lastEventId', lastEventId)
        }

        const headers: Record<string, string> = {
          Authorization: `Bot ${this.token}`,
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        }

        if (lastEventId !== null) {
          headers['Last-Event-ID'] = lastEventId
        }

        if (this.debug) {
          console.log(
            `[argon:sse] → connecting ${url.pathname}${url.search}${lastEventId !== null ? ` (resume after ${lastEventId})` : ''}`,
          )
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          signal,
        })

        if (!response.ok) {
          const body = await response.text().catch(() => '')
          const error = new TransportError(`SSE connection failed: HTTP ${response.status} ${body}`.trim(), {
            cause: body,
          })

          // A bad token or invalid intents will not fix itself by reconnecting
          if (FATAL_STATUSES.has(response.status)) {
            fatal = error
          }

          throw error
        }

        if (!response.body) {
          throw new TransportError('SSE response body is null')
        }

        if (this.debug) {
          console.log(`[argon:sse] ← connected ${response.status}`)
        }

        currentRetryDelay = this.retryDelay

        for await (const event of this.parseStream(response.body, signal)) {
          if (event.id) {
            lastEventId = event.id
          }

          if (this.debug) {
            console.log(`[argon:sse] ⇐ ${event.type}${event.id ? ` #${event.id}` : ''}`, event.data)
          }

          yield event as SseEvent
        }
      } catch (error) {
        if (signal.aborted) {
          break
        }

        if (fatal) {
          throw fatal
        }

        if (!(error instanceof Error)) {
          throw new TransportError('Unknown SSE error', { cause: error })
        }

        if (error.name === 'AbortError') {
          break
        }

        if (this.debug) {
          console.log(`[argon:sse] ✗ ${error.name}: ${error.message} — retry in ${currentRetryDelay}ms`)
        }

        await this.sleep(currentRetryDelay, signal)
        currentRetryDelay = Math.min(currentRetryDelay * 2, this.maxRetryDelay)
      }
    }
  }

  private async *parseStream(body: ReadableStream<Uint8Array>, signal: AbortSignal): AsyncIterable<RawSseEvent> {
    const reader = body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''
    let currentEvent: Partial<RawSseEvent> = {}
    let dataLines: string[] = []
    let heartbeatTimer: ReturnType<typeof setTimeout> | null = null

    const resetHeartbeat = () => {
      if (heartbeatTimer !== null) {
        clearTimeout(heartbeatTimer)
      }

      heartbeatTimer = setTimeout(() => {
        reader.cancel()
      }, HEARTBEAT_TIMEOUT_MS)
    }

    signal.addEventListener(
      'abort',
      () => {
        if (heartbeatTimer !== null) {
          clearTimeout(heartbeatTimer)
        }

        reader.cancel()
      },
      { once: true },
    )

    try {
      resetHeartbeat()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        resetHeartbeat()
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trimEnd()

          if (trimmed === '') {
            if (currentEvent.type !== undefined) {
              // Per the SSE spec, multiple `data:` lines form one payload joined by newlines
              currentEvent.data = parseData(dataLines.join('\n'))
              yield currentEvent as RawSseEvent
            }

            currentEvent = {}
            dataLines = []
            continue
          }

          if (trimmed.startsWith(':')) {
            continue
          }

          const colonIndex = trimmed.indexOf(':')

          if (colonIndex === -1) {
            continue
          }

          const field = trimmed.slice(0, colonIndex)
          const value = trimmed.slice(colonIndex + 1).trimStart()

          if (field === 'event') {
            currentEvent.type = value as SseEventType
          } else if (field === 'data') {
            dataLines.push(value)
          } else if (field === 'id') {
            currentEvent.id = value
          }
        }
      }
    } finally {
      if (heartbeatTimer !== null) {
        clearTimeout(heartbeatTimer)
      }

      reader.releaseLock()
    }
  }

  private sleep(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms)

      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          resolve()
        },
        { once: true },
      )
    })
  }
}

function parseData(raw: string): SseEventMap[SseEventType] {
  if (raw.length === 0) {
    return null as unknown as SseEventMap[SseEventType]
  }

  try {
    return parseJson(raw) as SseEventMap[SseEventType]
  } catch {
    return raw as unknown as SseEventMap[SseEventType]
  }
}

interface RawSseEvent {
  id: string
  type: SseEventType
  data: SseEventMap[SseEventType]
}
