import type { ContextDeps } from './base'
import type { PresenceUpdatePayload } from '../events'
import type { BotPresence, PresenceActivity, PresenceStatus, Snowflake, User } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a user's presence change (privileged Presence intent) */
export class PresenceUpdateContext extends BaseContext<PresenceUpdatePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: PresenceUpdatePayload) {
    super(deps, eventId, EventType.PresenceUpdate, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
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

  get presence(): BotPresence {
    return this.payload.presence
  }

  get status(): PresenceStatus {
    return this.payload.presence.status
  }

  get activity(): PresenceActivity | null {
    return this.payload.presence.activity
  }
}
