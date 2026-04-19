import type { ApiClient } from '../api/client'
import type { MessageEditPayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the message edit event */
export class MessageEditContext extends BaseContext {
  private readonly payload: MessageEditPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: MessageEditPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.MessageEdit, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
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
}
