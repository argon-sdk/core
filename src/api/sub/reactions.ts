import type { BaseApiClient } from '../base'
import type { Snowflake, Reaction } from '../../types'

/** Reactions attached to a specific message */
export interface MessageReactions {
  messageId: Snowflake
  reactions: Reaction[]
}

/** Response containing reactions for multiple messages */
export interface BatchGetReactionsResponse {
  messages: MessageReactions[]
}

/** A custom emoji to react with: an emoji item id from `expressions.list()` */
export interface CustomEmojiRef {
  itemId: Snowflake
}

/** Most messages per `batchGet` call; extra ids are ignored by the server */
export const MAX_BATCH_GET = 50

export class ReactionsApi {
  constructor(private readonly base: BaseApiClient) {}

  /** Reacts with a unicode emoji (max 20 distinct emoji per message) */
  async add(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    await this.base.call<void>('IReactions', 1, 'Add', 'POST', { body: { channelId, messageId, emoji } })
  }

  /** Removes the bot's own unicode emoji reaction */
  async remove(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    await this.base.call<void>('IReactions', 1, 'Remove', 'DELETE', {
      body: { channelId, messageId, emoji },
      idempotent: true,
    })
  }

  /**
   * Reacts with a custom emoji. Any bot may use an emoji of the message's space; emoji of other spaces
   * are for verified bots only.
   */
  async addCustom(spaceId: Snowflake, channelId: Snowflake, messageId: Snowflake, itemId: Snowflake): Promise<void> {
    await this.base.call<void>('IReactions', 1, 'AddCustom', 'POST', {
      body: { spaceId, channelId, messageId, itemId },
    })
  }

  /** Removes the bot's own custom emoji reaction (also after the emoji was deleted) */
  async removeCustom(spaceId: Snowflake, channelId: Snowflake, messageId: Snowflake, itemId: Snowflake): Promise<void> {
    await this.base.call<void>('IReactions', 1, 'RemoveCustom', 'POST', {
      body: { spaceId, channelId, messageId, itemId },
      idempotent: true,
    })
  }

  /** Lists a message's reactions (at most 3 user ids each) */
  list(channelId: Snowflake, messageId: Snowflake): Promise<{ reactions: Reaction[] }> {
    return this.base.call<{ reactions: Reaction[] }>('IReactions', 1, 'List', 'GET', {
      query: { channelId, messageId },
    })
  }

  /** Current reactions of up to 50 messages of one channel */
  batchGet(channelId: Snowflake, messageIds: Snowflake[]): Promise<BatchGetReactionsResponse> {
    return this.base.call<BatchGetReactionsResponse>('IReactions', 1, 'BatchGet', 'POST', {
      body: { channelId, messageIds: messageIds.slice(0, MAX_BATCH_GET) },
      idempotent: true,
    })
  }
}
