/** Per-interface request budgets (requests per minute) published in the Bot API manifest */
export const DEFAULT_RATE_LIMITS: Readonly<Record<string, number>> = {
  IArchetypes: 30,
  IBotSelf: 15,
  ICalls: 20,
  IChannels: 60,
  ICommands: 60,
  IEvents: 5,
  IExpressions: 60,
  IFiles: 30,
  IInteractions: 120,
  IMembers: 30,
  IMessages: 120,
  IReactions: 60,
  ISpaces: 30,
  ITyping: 60,
  IVoice: 20,
  IVoiceEgress: 10,
}

/** The server allows 10 in-flight requests per bot, and the open event stream holds one of them */
export const DEFAULT_MAX_CONCURRENT = 9

const WINDOW_MS = 60_000

/** Rate limiter options */
export interface RateLimiterOptions {
  /** Requests per minute per interface; unknown interfaces are not throttled locally */
  limits?: Record<string, number>
  /** Maximum in-flight requests; matches the server's per-bot concurrency limit by default */
  maxConcurrent?: number
}

/**
 * Client-side limiter that keeps requests inside the server's budgets so bots rarely see a 429:
 * a sliding one-minute window per interface, a global in-flight cap, and `Retry-After` back-off.
 */
export class RateLimiter {
  private readonly limits: Record<string, number>
  private readonly maxConcurrent: number
  private readonly sent = new Map<string, number[]>()
  private readonly blockedUntil = new Map<string, number>()
  private readonly waiters: Array<() => void> = []
  private inFlight = 0

  constructor(options: RateLimiterOptions = {}) {
    this.limits = { ...DEFAULT_RATE_LIMITS, ...options.limits }
    this.maxConcurrent = options.maxConcurrent ?? DEFAULT_MAX_CONCURRENT
  }

  /** Waits for a slot on `interfaceName` and returns a release callback to call when the request settles */
  async acquire(interfaceName: string): Promise<() => void> {
    await this.waitForWindow(interfaceName)
    await this.waitForSlot()

    let released = false

    return () => {
      if (released) {
        return
      }

      released = true

      const next = this.waiters.shift()

      if (next) {
        next()
      } else {
        this.inFlight--
      }
    }
  }

  recordRetryAfter(interfaceName: string, seconds: number): void {
    const ms = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 1000
    this.blockedUntil.set(interfaceName, Date.now() + ms)
  }

  private async waitForWindow(interfaceName: string): Promise<void> {
    while (true) {
      const now = Date.now()
      const blocked = this.blockedUntil.get(interfaceName)

      if (blocked !== undefined && blocked > now) {
        await sleep(blocked - now)
        continue
      }

      this.blockedUntil.delete(interfaceName)

      const limit = this.limits[interfaceName]

      if (limit === undefined) {
        return
      }

      const stamps = (this.sent.get(interfaceName) ?? []).filter((t) => now - t < WINDOW_MS)

      if (stamps.length < limit) {
        stamps.push(now)
        this.sent.set(interfaceName, stamps)
        return
      }

      this.sent.set(interfaceName, stamps)
      await sleep(stamps[0]! + WINDOW_MS - now)
    }
  }

  private async waitForSlot(): Promise<void> {
    if (this.inFlight < this.maxConcurrent) {
      this.inFlight++
      return
    }

    // The releasing request hands its slot over, so the counter stays as is
    await new Promise<void>((resolve) => this.waiters.push(resolve))
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)))
}
