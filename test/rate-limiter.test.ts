import { describe, expect, test } from 'bun:test'

import { RateLimiter } from '../src/api/rate-limiter'

describe('RateLimiter', () => {
  test('caps in-flight requests and hands slots over on release', async () => {
    const limiter = new RateLimiter({ maxConcurrent: 2, limits: {} })
    const first = await limiter.acquire('IMessages')
    await limiter.acquire('IMessages')

    let thirdAcquired = false
    const third = limiter.acquire('IMessages').then((release) => {
      thirdAcquired = true
      return release
    })

    await Bun.sleep(5)
    expect(thirdAcquired).toBe(false)

    first()
    await third
    expect(thirdAcquired).toBe(true)
  })

  test('delays requests beyond the per-minute budget of an interface', async () => {
    const limiter = new RateLimiter({ limits: { ITyping: 1 } })
    ;(await limiter.acquire('ITyping'))()

    let second = false
    limiter.acquire('ITyping').then(() => {
      second = true
    })

    await Bun.sleep(5)
    expect(second).toBe(false)
  })

  test('waits out Retry-After', async () => {
    const limiter = new RateLimiter({ limits: {} })
    limiter.recordRetryAfter('IReactions', 0.05)

    const startedAt = Date.now()
    ;(await limiter.acquire('IReactions'))()
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(40)
  })
})
