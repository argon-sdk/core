import type { ApiClient } from '../api/client'
import type { ReactionPayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the reaction added event */
export class ReactionAddContext extends BaseContext {
  private readonly payload: ReactionPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ReactionPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.ReactionAdd, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
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

  get emoji(): string {
    return this.payload.emoji
  }
}
