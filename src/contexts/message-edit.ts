import type { SendMessageResponse } from '../api/client'
import type { MessageEditPayload } from '../events'
import type { Snowflake } from '../types'
import type { ContextDeps } from './base'
import type { MessageContent, ReplyOptions } from './types'

import { BaseContext } from './base'
import { EventType } from '../events'
import { sendMessage } from './send'

/** Context for the message edit event (the server reports the new text only) */
export class MessageEditContext extends BaseContext<MessageEditPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: MessageEditPayload) {
    super(deps, eventId, EventType.MessageEdit, payload)
  }

  get messageId(): Snowflake {
    return this.payload.messageId
  }
  get channelId(): Snowflake {
    return this.payload.channelId
  }
  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  /** The new text, `null` if only something else changed */
  get text(): string | null {
    return this.payload.text
  }
  get editedAt(): Date {
    return new Date(this.payload.updatedAt)
  }

  /** Replies to the edited message */
  reply(content: MessageContent, options: ReplyOptions = {}): Promise<SendMessageResponse> {
    return sendMessage(this.api, this.channelId, content, { replyTo: this.messageId, ...options })
  }
}
