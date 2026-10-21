import type { ContextDeps } from './base'
import type { ChannelCreatePayload } from '../events'
import type { ChannelInfo, ChannelType, Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the channel creation event */
export class ChannelCreateContext extends BaseContext<ChannelCreatePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ChannelCreatePayload) {
    super(deps, eventId, EventType.ChannelCreate, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get channel(): ChannelInfo {
    return this.payload.channel
  }

  get channelId(): Snowflake {
    return this.payload.channel.channelId
  }

  get name(): string {
    return this.payload.channel.name
  }

  get type(): ChannelType {
    return this.payload.channel.type
  }

  /** @deprecated Use `channel` */
  get data(): ChannelInfo {
    return this.payload.channel
  }
}
