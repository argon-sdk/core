import type { MessageCreateContext } from '../contexts/message-create'

function matchesText(content: string, match: string | RegExp): boolean {
  if (typeof match === 'string') {
    return content === match
  }

  return match.test(content)
}

/** Returns a predicate that matches message text against a string or regex */
export function text(match?: string | RegExp): (ctx: MessageCreateContext) => boolean {
  return (ctx) => {
    if (match === undefined) {
      return true
    }

    return matchesText(ctx.message.text, match)
  }
}
