import type { ContextDeps } from './base'
import type { MemberJoinPayload } from '../events'
import type { Snowflake, User } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the member join event (privileged Members intent) */
export class MemberJoinContext extends BaseContext<MemberJoinPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: MemberJoinPayload) {
    super(deps, eventId, EventType.MemberJoin, payload)
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
}
