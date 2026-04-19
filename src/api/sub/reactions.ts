import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'
import type { Reaction } from '../../types'

/** Reactions attached to a specific message */
export interface MessageReactions {
  messageId: Snowflake
  reactions: Reaction[]
}

/** Response containing reactions for multiple messages */
export interface BatchGetReactionsResponse {
  messages: MessageReactions[]
}

export class ReactionsApi {
  constructor(private readonly base: BaseApiClient) {}

  add(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    return this.base.call<void>('IReactions', 1, 'Add', 'POST', {
      body: { channelId, messageId, emoji },
    })
  }

  remove(channelId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    return this.base.call<void>('IReactions', 1, 'Remove', 'DELETE', {
      body: { channelId, messageId, emoji },
    })
  }

  list(channelId: Snowflake, messageId: Snowflake): Promise<{ reactions: Reaction[] }> {
    return this.base.call<{ reactions: Reaction[] }>('IReactions', 1, 'List', 'GET', {
      query: { channelId, messageId },
    })
  }

  batchGet(channelId: Snowflake, messageIds: Snowflake[]): Promise<BatchGetReactionsResponse> {
    return this.base.call<BatchGetReactionsResponse>('IReactions', 1, 'BatchGet', 'POST', {
      body: { channelId, messageIds },
    })
  }
}
