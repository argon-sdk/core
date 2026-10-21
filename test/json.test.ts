import { describe, expect, test } from 'bun:test'

import { parseJson } from '../src/api/json'

describe('parseJson', () => {
  test('keeps snowflake ids exact', () => {
    const parsed = parseJson('{"messageId":7351234567890123456,"replyId":null,"text":"hi"}') as Record<string, unknown>
    expect(parsed.messageId).toBe('7351234567890123456')
    expect(parsed.replyId).toBeNull()
  })

  test('quotes int64 keys even when small, and arrays under them', () => {
    expect(parseJson('{"messageIds":[1,2],"other":[1,2]}')).toEqual({ messageIds: ['1', '2'], other: [1, 2] })
    expect(parseJson('{"grantedEntitlements":288230376151711743}')).toEqual({
      grantedEntitlements: '288230376151711743',
    })
  })

  test('quotes any unsafe integer and leaves floats and safe numbers alone', () => {
    expect(parseJson('{"value":9007199254740993,"n":1.5e3,"m":-12,"size":1024}')).toEqual({
      value: '9007199254740993',
      n: 1500,
      m: -12,
      size: 1024,
    })
  })

  test('ignores digits and keys inside strings', () => {
    const text = '{"text":"messageId: 12345678901234567890 \\" ,","nested":{"messageId":1}}'
    expect(parseJson(text)).toEqual({ text: 'messageId: 12345678901234567890 " ,', nested: { messageId: '1' } })
  })

  test('tracks keys through nested objects and arrays', () => {
    const text = '{"messages":[{"messageId":5,"reactions":[{"count":2}]}],"replyTo":7}'
    expect(parseJson(text)).toEqual({ messages: [{ messageId: '5', reactions: [{ count: 2 }] }], replyTo: '7' })
  })
})
