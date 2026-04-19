import type { ApiClient } from '../api/client'
import type { ChannelDeletePayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the channel deletion event */
export class ChannelDeleteContext extends BaseContext {
  private readonly payload: ChannelDeletePayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ChannelDeletePayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.ChannelDelete, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get channelId(): Snowflake {
    return this.payload.channelId
  }
}
