import type { ContextDeps } from './base'
import type { ChannelDeletePayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the channel deletion event */
export class ChannelDeleteContext extends BaseContext<ChannelDeletePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ChannelDeletePayload) {
    super(deps, eventId, EventType.ChannelDelete, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get channelId(): Snowflake {
    return this.payload.channelId
  }
}
