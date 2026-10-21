/** Base error class for all Argon SDK errors */
export class ArgonError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ArgonError'
  }
}

/** Machine-readable error codes returned by the Bot API in `{ error, message }` bodies */
export type ApiErrorCode =
  | 'unauthorized'
  | 'insufficient_permissions'
  | 'cannot_send'
  | 'not_found'
  | 'validation_error'
  | 'invalid_format'
  | 'invalid_request'
  | 'too_large'
  | 'quota_exceeded'
  | 'content_rejected'
  | 'name_taken'
  | 'rate_limited'
  | 'space_rate_limited'
  | 'render_unavailable'
  | 'ARCHETYPE_REQUIRED'
  | (string & {})

/**
 * Error thrown when an API request returns a non-OK HTTP status.
 *
 * `code` carries the API's machine-readable error (e.g. `insufficient_permissions`)
 * when the body had one, `null` otherwise (e.g. an HTML page from a proxy).
 */
export class HttpError extends ArgonError {
  readonly statusCode: number
  readonly code: ApiErrorCode | null
  readonly body: unknown
  /** `Interface/vN/Method` that failed */
  readonly endpoint: string | null

  constructor(statusCode: number, body: unknown, endpoint: string | null = null) {
    const code = extractCode(body)
    const detail = extractMessage(body)
    const where = endpoint ? ` ${endpoint}` : ''
    const what = [code, detail].filter(Boolean).join(': ')

    super(`HTTP ${statusCode}${where}${what ? ` — ${what}` : ''}`)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.code = code
    this.body = body
    this.endpoint = endpoint
  }

  /** True when the request was rejected by a rate limit (429) */
  get isRateLimited(): boolean {
    return this.statusCode === 429
  }
}

/** Alias of {@link HttpError}; the preferred name for API-level failures */
export const ApiError = HttpError
/** Alias of {@link HttpError}; the preferred name for API-level failures */
export type ApiError = HttpError

/** Error thrown when the SSE transport connection fails or encounters an issue */
export class TransportError extends ArgonError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'TransportError'
  }
}

function extractCode(body: unknown): string | null {
  if (body !== null && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string') {
    return (body as { error: string }).error
  }

  return null
}

function extractMessage(body: unknown): string | null {
  if (body !== null && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string') {
    return (body as { message: string }).message
  }

  if (typeof body === 'string' && body.length > 0) {
    return body.length > 200 ? `${body.slice(0, 200)}…` : body
  }

  return null
}
