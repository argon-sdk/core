import type { MessageCreateContext } from '../contexts/message-create'
import type { Snowflake } from '../types'

/** Matches a value exactly (string) or by pattern (RegExp) */
export function matches(value: string, match: string | RegExp): boolean {
  if (typeof match === 'string') {
    return value === match
  }

  match.lastIndex = 0
  return match.test(value)
}

/** Matches a control id equal to `prefix` or starting with `prefix:` (e.g. `vote` matches `vote:42`) */
export function matchesPrefix(value: string, prefix: string): boolean {
  return value === prefix || value.startsWith(`${prefix}:`)
}

/** Returns a predicate that matches message text against a string or regex */
export function text(match?: string | RegExp): (ctx: MessageCreateContext) => boolean {
  return (ctx) => match === undefined || matches(ctx.text, match)
}

/** Returns a predicate that matches events from the given space(s) */
export function inSpace<C extends { spaceId: Snowflake }>(...spaceIds: Snowflake[]): (ctx: C) => boolean {
  return (ctx) => spaceIds.includes(ctx.spaceId)
}

/** Returns a predicate that matches events from the given channel(s) */
export function inChannel<C extends { channelId: Snowflake }>(...channelIds: Snowflake[]): (ctx: C) => boolean {
  return (ctx) => channelIds.includes(ctx.channelId)
}

/** Returns a predicate that matches events caused by the given user(s) */
export function fromUser<C extends { userId: Snowflake }>(...userIds: Snowflake[]): (ctx: C) => boolean {
  return (ctx) => userIds.includes(ctx.userId)
}
