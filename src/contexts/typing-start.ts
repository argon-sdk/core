import type { ContextDeps } from './base'
import type { TypingPayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a user starting to type */
export class TypingStartContext extends BaseContext<TypingPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: TypingPayload) {
    super(deps, eventId, EventType.TypingStart, payload)
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

  get kind(): 'typing' | 'thinking' | 'uploading' | 'searching' | null {
    return (this.payload.kind?.toLowerCase() ?? null) as 'typing' | 'thinking' | 'uploading' | 'searching' | null
  }
}
