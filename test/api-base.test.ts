import { describe, expect, test } from 'bun:test'

import { BaseApiClient } from '../src/api/base'
import { HttpError } from '../src/errors'

function client(responses: Array<Response | Error>, calls: Request[] = []) {
  const fetchImpl = async (input: string, init: RequestInit) => {
    calls.push(new Request(input, init))
    const next = responses.shift()

    if (next instanceof Error) {
      throw next
    }

    return next ?? new Response('{}')
  }

  return new BaseApiClient('token', { fetch: fetchImpl, rateLimits: { limits: {} } })
}

describe('BaseApiClient', () => {
  test('surfaces the API error code on HttpError', async () => {
    const api = client([
      Response.json({ error: 'insufficient_permissions', message: 'no AttachFiles' }, { status: 403 }),
    ])
    const error = await api
      .call<never>('IMessages', 1, 'Send', 'POST', { body: {} })
      .catch((e: unknown) => e as HttpError)

    expect(error).toBeInstanceOf(HttpError)
    expect(error.code).toBe('insufficient_permissions')
    expect(error.statusCode).toBe(403)
    expect(error.message).toContain('IMessages/v1/Send')
    expect(error.message).toContain('insufficient_permissions')
  })

  test('tolerates non-JSON and empty bodies', async () => {
    const api = client([new Response('<html>bad gateway</html>', { status: 400 }), new Response(null, { status: 200 })])

    const error = await api.call<never>('ISpaces', 1, 'Get', 'POST').catch((e: unknown) => e as HttpError)
    expect(error).toBeInstanceOf(HttpError)
    expect(error.code).toBeNull()

    expect(await api.call<unknown>('ITyping', 1, 'Stop', 'POST', { body: {} })).toBeUndefined()
  })

  test('retries idempotent requests after network errors and 503s', async () => {
    const calls: Request[] = []
    const api = client(
      [new TypeError('socket hang up'), new Response('', { status: 503 }), Response.json({ ok: 1 })],
      calls,
    )

    expect(await api.call<{ ok: number }>('ISpaces', 1, 'Get', 'GET')).toEqual({ ok: 1 })
    expect(calls).toHaveLength(3)
  })

  test('does not retry non-idempotent requests after a network error', async () => {
    const calls: Request[] = []
    const api = client([new TypeError('socket hang up'), Response.json({})], calls)

    await expect(api.call('IMembers', 1, 'Kick', 'POST')).rejects.toThrow('IMembers/v1/Kick')
    expect(calls).toHaveLength(1)
  })

  test('keeps snowflake ids exact in responses', async () => {
    const api = client([new Response('{"messageId":7351234567890123456,"attachments":[]}')])
    expect(await api.call<unknown>('IMessages', 1, 'Send', 'POST', { body: {} })).toEqual({
      messageId: '7351234567890123456',
      attachments: [],
    })
  })

  test('does not retry slow_mode 429s', async () => {
    const calls: Request[] = []
    const api = client([Response.json({ error: 'slow_mode' }, { status: 429 }), Response.json({})], calls)

    await expect(api.call('IMessages', 1, 'Send', 'POST', { body: {} })).rejects.toThrow('slow_mode')
    expect(calls).toHaveLength(1)
  })

  test('explains empty 401s', async () => {
    const api = client([new Response(null, { status: 401 })])
    await expect(api.call('IBotSelf', 1, 'GetMe', 'GET')).rejects.toThrow('token')
  })

  test('retries 429 responses', async () => {
    const calls: Request[] = []
    const limited = new Response('{"error":"rate_limited"}', { status: 429, headers: { 'Retry-After': '0' } })
    const api = client([limited, Response.json({ ok: true })], calls)

    expect(await api.call<unknown>('IMessages', 1, 'Send', 'POST', { body: {} })).toEqual({ ok: true })
    expect(calls).toHaveLength(2)
  })

  test('encodes query arrays and skips nullish values', async () => {
    const calls: Request[] = []
    const api = client([Response.json({})], calls)

    await api.call('IReactions', 1, 'List', 'GET', { query: { a: ['1', '2'], b: undefined, c: null, d: 5 } })
    expect(new URL(calls[0]!.url).search).toBe('?a=1&a=2&d=5')
    expect(calls[0]!.headers.get('Authorization')).toBe('Bot token')
  })
})
