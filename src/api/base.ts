import { RateLimiter } from './rate-limiter'
import { HttpError } from '../errors'

const MAX_RETRIES = 3

export class BaseApiClient {
  private readonly token: string
  private readonly baseUrl: string
  private readonly debug: boolean
  private readonly rateLimiter = new RateLimiter()

  constructor(token: string, baseUrl: string, debug: boolean) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.token = token
    this.debug = debug
  }

  async call<T>(
    iface: string,
    version: number | string,
    method: string,
    httpMethod: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    options: {
      body?: unknown
      query?: Record<string, string | undefined>
    } = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${iface}/v${version}/${method}`)

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value)
        }
      }
    }

    const hasBody = options.body !== undefined

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      await this.rateLimiter.waitIfNeeded(iface)

      const startedAt = this.debug ? Date.now() : 0

      if (this.debug) {
        console.log(`[argon:http] → ${httpMethod} ${url.pathname}${url.search}`)

        if (hasBody) {
          console.log(`[argon:http]   body:`, options.body)
        }
      }

      const response = await fetch(url.toString(), {
        method: httpMethod,
        headers: {
          Authorization: `Bot ${this.token}`,
          ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        },
        body: hasBody ? JSON.stringify(options.body) : undefined,
      })

      if (this.debug) {
        const ms = Date.now() - startedAt
        console.log(`[argon:http] ← ${response.status} ${httpMethod} ${url.pathname} (${ms}ms)`)
      }

      if (response.status === 429 && attempt < MAX_RETRIES - 1) {
        const retryAfter = Number(response.headers.get('Retry-After') ?? '1')
        this.rateLimiter.recordRetryAfter(iface, retryAfter)
        continue
      }

      const data = (await response.json()) as Record<string, unknown>

      if (this.debug) {
        console.log(`[argon:http]   data:`, data)
      }

      if (!response.ok) {
        throw new HttpError(response.status, data)
      }

      return data as T
    }

    throw new HttpError(429, { error: 'rate_limited', message: 'Max retries exceeded' })
  }
}
