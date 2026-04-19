import type { ApiClient } from '../api/client'
import type { ChannelCreatePayload } from '../events'
import type { Snowflake } from '../types'
import type { Channel } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the channel creation event */
export class ChannelCreateContext extends BaseContext {
  private readonly payload: ChannelCreatePayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ChannelCreatePayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.ChannelCreate, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get channel(): Channel {
    return this.payload.data
  }
}
