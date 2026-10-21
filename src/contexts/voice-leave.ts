import type { ContextDeps } from './base'
import type { VoiceLeavePayload } from '../events'
import type { Snowflake, User } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a user leaving a voice channel */
export class VoiceLeaveContext extends BaseContext<VoiceLeavePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: VoiceLeavePayload) {
    super(deps, eventId, EventType.VoiceLeave, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get channelId(): Snowflake {
    return this.payload.channelId
  }

  get user(): User {
    return this.payload.user
  }

  get userId(): Snowflake {
    return this.payload.user.userId
  }

  get displayName(): string {
    return this.payload.user.displayName
  }

  get username(): string {
    return this.payload.user.username
  }

  /** The user's app language, `null` when unknown */
  get locale(): string | null {
    return this.payload.user.locale ?? null
  }
}
