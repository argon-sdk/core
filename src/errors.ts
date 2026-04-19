/** Base error class for all Argon SDK errors */
export class ArgonError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ArgonError'
  }
}

/** Error thrown when an API request returns a non-OK HTTP status */
export class HttpError extends ArgonError {
  readonly statusCode: number
  readonly body: unknown

  constructor(statusCode: number, body: unknown) {
    super(`HTTP ${statusCode}`)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.body = body
  }
}

/** Error thrown when the SSE transport connection fails or encounters an issue */
export class TransportError extends ArgonError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'TransportError'
  }
}
