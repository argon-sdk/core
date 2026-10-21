import type { MessageCreateContext } from '../contexts/message-create'
import type { Snowflake } from '../types'
import type { Filter } from './base'

import { extendFilter, makeFilter } from './base'
import { matches } from './predicates'
import { EventType } from '../events/types'

/** Extended filter for message creation events */
export interface MessageCreateFilter extends Filter<MessageCreateContext> {
  and(predicate: (ctx: MessageCreateContext) => boolean): MessageCreateFilter
  /** Matches the whole message text exactly (string) or by pattern (RegExp) */
  text(match?: string | RegExp): MessageCreateFilter
  /** Matches messages whose text starts with `prefix`, e.g. `!ping` */
  startsWith(prefix: string): MessageCreateFilter
  /** Matches messages sent by the given user(s) */
  from(...userIds: Snowflake[]): MessageCreateFilter
  /** Matches messages in the given channel(s) */
  inChannel(...channelIds: Snowflake[]): MessageCreateFilter
  /** Matches messages in the given space(s) */
  inSpace(...spaceIds: Snowflake[]): MessageCreateFilter
  /** Matches messages that mention the given user, or the bot itself when called without one */
  mentions(userId?: Snowflake): MessageCreateFilter
  /** Matches messages sent by people, skipping bots, webhooks and system messages */
  fromHumans(): MessageCreateFilter
}

/** Default message creation filter that matches all messages */
export const create: MessageCreateFilter = extendFilter<MessageCreateContext, MessageCreateFilter>(
  makeFilter<MessageCreateContext>(EventType.MessageCreate, () => true),
  (narrow) => ({
    text: (match) => narrow((ctx) => match === undefined || matches(ctx.text, match)),
    startsWith: (prefix) => narrow((ctx) => ctx.text.startsWith(prefix)),
    from: (...userIds) => narrow((ctx) => ctx.userId !== null && userIds.includes(ctx.userId)),
    inChannel: (...channelIds) => narrow((ctx) => channelIds.includes(ctx.channelId)),
    inSpace: (...spaceIds) => narrow((ctx) => spaceIds.includes(ctx.spaceId)),
    mentions: (userId) => narrow((ctx) => ctx.mentions(userId)),
    fromHumans: () => narrow((ctx) => !ctx.isFromBot),
  }),
)
