import type { SendMessageResponse } from '../api/client'
import type { MessageCreatePayload } from '../events'
import type { Attachment, Message, MessageEntity, Snowflake, User } from '../types'
import type { ContextDeps } from './base'
import type { MessageContent, ReplyOptions } from './types'

import { BaseContext } from './base'
import { EventType } from '../events'
import { EntityType, UserFlags } from '../types'
import { sendMessage } from './send'

/** Options for replying to a newly created message */
export type MessageCreateReplyOptions = ReplyOptions

/** Context for the message creation event */
export class MessageCreateContext extends BaseContext<MessageCreatePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: MessageCreatePayload) {
    super(deps, eventId, EventType.MessageCreate, payload)
  }

  get message(): Message {
    return this.payload.message
  }
  get messageId(): Snowflake {
    return this.payload.message.messageId
  }
  get channelId(): Snowflake {
    return this.payload.channelId
  }
  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get text(): string {
    return this.payload.message.text
  }
  get entities(): MessageEntity[] {
    return this.payload.message.entities
  }
  get replyId(): Snowflake | null {
    return this.payload.message.replyId
  }
  /** The author; `null` for system messages */
  get user(): User | null {
    return this.payload.message.sender
  }
  /** The author's id; `null` for system messages */
  get userId(): Snowflake | null {
    return this.payload.message.sender?.userId ?? null
  }
  /** @deprecated Use `userId` */
  get senderId(): Snowflake | null {
    return this.userId
  }
  /** The author's app language, `null` when unknown */
  get locale(): string | null {
    return this.payload.message.sender?.locale ?? null
  }
  /** Files attached to the message */
  get attachments(): Attachment[] {
    return this.payload.message.attachments ?? []
  }
  /** True for messages from bots (including this one), webhooks and the system */
  get isFromBot(): boolean {
    const { sender, webhook } = this.payload.message
    return sender === null || webhook !== null || (sender.flags & (UserFlags.Bot | UserFlags.System)) !== 0
  }
  /** True when this bot wrote the message */
  get isFromSelf(): boolean {
    return this.me !== null && this.userId === this.me.userId
  }

  /** True when the message mentions `userId` (defaults to this bot) */
  mentions(userId: Snowflake | undefined = this.me?.userId): boolean {
    return (
      userId !== undefined &&
      this.entities.some((e) => e.type === EntityType.Mention && (e as { userId: Snowflake }).userId === userId)
    )
  }

  /** Replies to this message (pass `replyTo: null` for a plain message) */
  reply(content: MessageContent, options: ReplyOptions = {}): Promise<SendMessageResponse> {
    return sendMessage(this.api, this.channelId, content, { replyTo: this.messageId, ...options })
  }

  /** Posts a message in the same channel without replying */
  send(content: MessageContent, options: Omit<ReplyOptions, 'replyTo'> = {}): Promise<SendMessageResponse> {
    return sendMessage(this.api, this.channelId, content, options)
  }

  /** Reacts to this message with a unicode emoji or a custom emoji (`{ itemId }`) */
  react(emoji: string | { itemId: Snowflake }): Promise<void> {
    return typeof emoji === 'string'
      ? this.api.reactions.add(this.channelId, this.messageId, emoji)
      : this.api.reactions.addCustom(this.spaceId, this.channelId, this.messageId, emoji.itemId)
  }

  /** Removes the bot's reaction from this message */
  unreact(emoji: string | { itemId: Snowflake }): Promise<void> {
    return typeof emoji === 'string'
      ? this.api.reactions.remove(this.channelId, this.messageId, emoji)
      : this.api.reactions.removeCustom(this.spaceId, this.channelId, this.messageId, emoji.itemId)
  }

  /** Shows a typing indicator in the channel for 8 seconds */
  typing(kind?: 'typing' | 'thinking' | 'uploading' | 'searching'): Promise<void> {
    return this.api.typing.start(this.channelId, kind)
  }
}
