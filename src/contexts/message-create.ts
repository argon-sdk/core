import type { RegisterControlHandler, RegisterSelectHandler } from './base'
import type { ApiClient, SendMessageResponse } from '../api/client'
import type { Message } from '../types'
import type { Archetype } from '../types'
import type { MessageEntity } from '../types'
import type { Snowflake } from '../types'
import type { Row } from '../types'
import type { Visibility } from '../types'
import { BaseContext } from './base'
import { resolveVisibility } from './visibility'
import { EventType } from '../events'
import { VisibilityScope } from '../types'

/** Options for replying to a newly created message */
export interface MessageCreateReplyOptions {
  entities?: MessageEntity[]
  replyTo?: Snowflake
  controls?: Row[]
  visibility?: Visibility
}

/** Context for the message creation event */
export class MessageCreateContext extends BaseContext {
  readonly message: Message

  constructor(
    api: ApiClient,
    eventId: string,
    message: Message,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.MessageCreate, registerControlHandler, registerSelectHandler, services)
    this.message = message
  }

  get senderId(): Snowflake {
    return this.message.sender
  }
  get channelId(): Snowflake {
    return this.message.channelId
  }
  get spaceId(): Snowflake {
    return this.message.spaceId
  }
  get text(): string {
    return this.message.text
  }
  get entities(): MessageEntity[] {
    return this.message.entities
  }
  get replyId(): Snowflake | null {
    return this.message.replyId
  }

  reply(text: string, options: MessageCreateReplyOptions = {}): Promise<SendMessageResponse> {
    this.extractControlHandlers(options.controls)
    this.extractSelectHandlers(options.controls)

    return this.api.messages.send({
      channelId: this.channelId,
      text,
      entities: options.entities,
      replyTo: options.replyTo,
      controls: options.controls,
      visibility: options.visibility,
    })
  }

  whisper(text: string, options: Omit<MessageCreateReplyOptions, 'visibility'> = {}): Promise<SendMessageResponse> {
    return this.reply(text, {
      ...options,
      visibility: { scope: VisibilityScope.User, userId: this.senderId },
    })
  }

  visibilityFor(userId: Snowflake, filter?: (archetype: Archetype) => boolean): Promise<Visibility> {
    return resolveVisibility(this.api, this.spaceId, userId, filter)
  }
}
