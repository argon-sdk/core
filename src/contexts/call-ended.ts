import type { ContextDeps } from './base'
import type { CallEndedPayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a call ending (verified bots only) */
export class CallEndedContext extends BaseContext<CallEndedPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: CallEndedPayload) {
    super(deps, eventId, EventType.CallEnded, payload)
  }

  get callId(): Snowflake {
    return this.payload.callId
  }
}
