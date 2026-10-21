import type { RateLimiterOptions } from './rate-limiter'
import type { Row } from '../controls'

import { RateLimiter } from './rate-limiter'
import { parseJson } from './json'
import { ArgonError, HttpError } from '../errors'

export const DEFAULT_BASE_URL = 'https://gateway.argon.zone'

const DEFAULT_MAX_RETRIES = 3
const RETRYABLE_STATUSES = new Set([502, 503, 504])

/** Options shared by the low-level and high-level API clients */
export interface ApiClientOptions {
  baseUrl?: string
  debug?: boolean
  /** Attempts per request for 429s and (for idempotent requests) network errors and 502/503/504 */
  maxRetries?: number
  rateLimits?: RateLimiterOptions
  /** Custom fetch implementation (proxies, tests) */
  fetch?: FetchLike
}

/** The subset of `fetch` the client uses */
export type FetchLike = (input: string, init: RequestInit) => Promise<Response>

/** Query string values; arrays are sent as repeated keys */
export type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>

/** Per-request options for {@link BaseApiClient.call} */
export interface CallOptions {
  body?: unknown
  /** Sent as multipart/form-data instead of JSON */
  form?: FormData
  query?: Record<string, QueryValue>
  /** Safe to repeat after a network error; GET requests always are */
  idempotent?: boolean
  signal?: AbortSignal
}

/** Callback receiving every controls payload the bot sends, used to wire up button/select handlers */
export type ControlSink = (rows: Row[]) => void

export class BaseApiClient {
  private readonly token: string
  readonly baseUrl: string
  private readonly debug: boolean
  private readonly maxRetries: number
  private readonly fetchImpl: FetchLike
  private readonly rateLimiter: RateLimiter

  /** @internal Set by `Bot` so controls sent through any API path get their handlers registered */
  controlSink: ControlSink | null = null

  constructor(token: string, options: ApiClientOptions = {}) {
    if (!token) {
      throw new ArgonError('Bot token is empty. Pass the token from the Argon developer portal.')
    }

    this.token = token
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.debug = options.debug ?? false
    this.maxRetries = Math.max(1, options.maxRetries ?? DEFAULT_MAX_RETRIES)
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init))
    this.rateLimiter = new RateLimiter(options.rateLimits)
  }

  /** @internal Hands sent controls to the registered sink */
  sinkControls(rows: Row[] | undefined): void {
    if (rows && rows.length > 0) {
      this.controlSink?.(rows)
    }
  }

  async call<T>(
    iface: string,
    version: number | string,
    method: string,
    httpMethod: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    options: CallOptions = {},
  ): Promise<T> {
    const endpoint = `${iface}/v${version}/${method}`
    const url = new URL(`${this.baseUrl}/${endpoint}`)

    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null) {
        continue
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item))
        }
      } else {
        url.searchParams.set(key, String(value))
      }
    }

    const idempotent = options.idempotent ?? httpMethod === 'GET'
    const hasJson = options.body !== undefined && options.form === undefined

    for (let attempt = 1; ; attempt++) {
      const release = await this.rateLimiter.acquire(iface)
      const startedAt = Date.now()
      let response: Response

      if (this.debug) {
        console.log(`[argon:http] → ${httpMethod} ${url.pathname}${url.search}`)

        if (hasJson) {
          console.log('[argon:http]   body:', options.body)
        }
      }

      try {
        response = await this.fetchImpl(url.toString(), {
          method: httpMethod,
          headers: {
            Authorization: `Bot ${this.token}`,
            Accept: 'application/json',
            ...(hasJson ? { 'Content-Type': 'application/json' } : {}),
          },
          body: options.form ?? (hasJson ? JSON.stringify(options.body) : undefined),
          signal: options.signal,
        })
      } catch (error) {
        release()

        if (idempotent && attempt < this.maxRetries && !options.signal?.aborted) {
          if (this.debug) {
            console.log(`[argon:http] ✗ ${httpMethod} ${url.pathname}: ${String(error)} — retrying`)
          }

          await backoff(attempt)
          continue
        }

        throw new ArgonError(`Request to ${endpoint} failed: ${error instanceof Error ? error.message : error}`, {
          cause: error,
        })
      }

      const data = await readBody(response)
      release()

      if (this.debug) {
        console.log(
          `[argon:http] ← ${response.status} ${httpMethod} ${url.pathname} (${Date.now() - startedAt}ms)`,
          data ?? '',
        )
      }

      // slow_mode has no Retry-After and lasts as long as the channel's slow mode, so retrying blindly won't help
      if (response.status === 429 && attempt < this.maxRetries && errorCode(data) !== 'slow_mode') {
        this.rateLimiter.recordRetryAfter(iface, Number(response.headers.get('Retry-After') ?? '1'))
        continue
      }

      if (RETRYABLE_STATUSES.has(response.status) && idempotent && attempt < this.maxRetries) {
        await backoff(attempt)
        continue
      }

      if (!response.ok) {
        // 401s come with an empty body; say what they mean
        const body = response.status === 401 && data === undefined ? 'The bot token is missing or invalid.' : data
        throw new HttpError(response.status, body, endpoint)
      }

      return data as T
    }
  }
}

function errorCode(data: unknown): unknown {
  return data !== null && typeof data === 'object' ? (data as { error?: unknown }).error : undefined
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '')

  if (text.length === 0) {
    return undefined
  }

  try {
    return parseJson(text)
  } catch {
    return text
  }
}

function backoff(attempt: number): Promise<void> {
  const ms = Math.min(250 * 2 ** (attempt - 1), 4_000)
  return new Promise((resolve) => setTimeout(resolve, ms))
}
