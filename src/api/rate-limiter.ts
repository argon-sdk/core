export class RateLimiter {
  private readonly retryAfter = new Map<string, number>()

  async waitIfNeeded(interfaceName: string): Promise<void> {
    const allowedAt = this.retryAfter.get(interfaceName)

    if (allowedAt === undefined) {
      return
    }

    const now = Date.now()

    if (now >= allowedAt) {
      this.retryAfter.delete(interfaceName)
      return
    }

    await new Promise<void>((resolve) => setTimeout(resolve, allowedAt - now))

    this.retryAfter.delete(interfaceName)
  }

  recordRetryAfter(interfaceName: string, seconds: number): void {
    this.retryAfter.set(interfaceName, Date.now() + seconds * 1000)
  }
}
