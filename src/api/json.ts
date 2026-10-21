/**
 * The Bot API writes 64-bit integers (message ids, entitlement masks) as bare JSON numbers. Message ids are
 * snowflakes above 2^53, so `JSON.parse` would silently corrupt them. {@link parseJson} turns those values
 * into strings before parsing: every integer under one of {@link INT64_KEYS}, and any other integer too large
 * to be represented exactly. The API accepts numeric strings wherever it takes such numbers.
 */
export const INT64_KEYS: ReadonlySet<string> = new Set([
  'messageId',
  'messageIds',
  'replyId',
  'replyTo',
  'sourceMessageId',
  'randomId',
  'permissions',
  'grantedEntitlements',
  'requiredEntitlements',
])

interface Frame {
  array: boolean
  /** For arrays: the key the array is stored under. For objects: the key being read */
  key: string | null
  expectingKey: boolean
}

/** `JSON.parse` that keeps 64-bit integers exact by reading them as strings */
export function parseJson(text: string): unknown {
  return JSON.parse(quoteInt64(text))
}

function quoteInt64(text: string): string {
  const stack: Frame[] = []
  let out = ''
  let copied = 0
  let i = 0

  const contextKey = (): string | null => stack[stack.length - 1]?.key ?? null

  while (i < text.length) {
    const c = text.charCodeAt(i)

    // "
    if (c === 34) {
      const start = i
      i++

      while (i < text.length) {
        const d = text.charCodeAt(i)

        if (d === 92) {
          i += 2
          continue
        }

        i++

        if (d === 34) {
          break
        }
      }

      const top = stack[stack.length - 1]

      if (top && !top.array && top.expectingKey) {
        top.key = JSON.parse(text.slice(start, i)) as string
        top.expectingKey = false
      }

      continue
    }

    // { [
    if (c === 123 || c === 91) {
      const parentKey = contextKey()
      stack.push({ array: c === 91, key: c === 91 ? parentKey : null, expectingKey: c === 123 })
      i++
      continue
    }

    // } ]
    if (c === 125 || c === 93) {
      stack.pop()
      i++
      continue
    }

    // ,
    if (c === 44) {
      const top = stack[stack.length - 1]

      if (top && !top.array) {
        top.expectingKey = true
      }

      i++
      continue
    }

    // - or digit
    if (c === 45 || (c >= 48 && c <= 57)) {
      const start = i
      let integer = true
      i++

      while (i < text.length) {
        const d = text.charCodeAt(i)

        if (d >= 48 && d <= 57) {
          i++
        } else if (d === 46 || d === 101 || d === 69 || d === 43 || d === 45) {
          integer = false
          i++
        } else {
          break
        }
      }

      if (integer) {
        const literal = text.slice(start, i)
        const key = contextKey()

        if ((key !== null && INT64_KEYS.has(key)) || !Number.isSafeInteger(Number(literal))) {
          out += `${text.slice(copied, start)}"${literal}"`
          copied = i
        }
      }

      continue
    }

    i++
  }

  return copied === 0 ? text : out + text.slice(copied)
}
