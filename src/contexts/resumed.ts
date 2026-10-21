import type { ContextDeps } from './base'
import type { ResumedPayload } from '../events'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the resume notification (defined by the API, not currently sent by the server) */
export class ResumedContext extends BaseContext<ResumedPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ResumedPayload) {
    super(deps, eventId, EventType.Resumed, payload)
  }

  get replayedCount(): number {
    return this.payload.replayedCount
  }
}
