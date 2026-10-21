import type { ContextDeps } from './base'
import type { TypingPayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a user stopping to type */
export class TypingStopContext extends BaseContext<TypingPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: TypingPayload) {
    super(deps, eventId, EventType.TypingStop, payload)
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
