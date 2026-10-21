import type { ContextDeps } from './base'
import type { MemberLeavePayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the member leave event (privileged Members intent) */
export class MemberLeaveContext extends BaseContext<MemberLeavePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: MemberLeavePayload) {
    super(deps, eventId, EventType.MemberLeave, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get userId(): Snowflake {
    return this.payload.userId
  }
}
