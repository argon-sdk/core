import type { ContextDeps } from './base'
import type { ReactionPayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a reaction being added */
export class ReactionAddContext extends BaseContext<ReactionPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ReactionPayload) {
    super(deps, eventId, EventType.ReactionAdd, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get channelId(): Snowflake {
    return this.payload.channelId
  }

  get messageId(): Snowflake {
    return this.payload.messageId
  }

  get userId(): Snowflake {
    return this.payload.userId
  }

  /** Unicode emoji, or `:name:` for a custom emoji */
  get emoji(): string {
    return this.payload.emoji
  }

  get isCustom(): boolean {
    return this.payload.customEmojiId !== null
  }

  /** The custom emoji's item id */
  get customEmojiId(): Snowflake | null {
    return this.payload.customEmojiId
  }

  get emojiName(): string | null {
    return this.payload.emojiName
  }

  /** Image of the custom emoji; `null` once it was deleted */
  get emojiUrl(): string | null {
    return this.payload.emojiUrl
  }
}
