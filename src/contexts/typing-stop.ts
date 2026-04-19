import type { ApiClient } from '../api/client'
import type { TypingPayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the typing stop event */
export class TypingStopContext extends BaseContext {
  private readonly payload: TypingPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: TypingPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.TypingStop, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get channelId(): Snowflake {
    return this.payload.channelId
  }
  get userId(): Snowflake {
    return this.payload.userId
  }
}
