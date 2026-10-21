import type { ContextDeps } from './base'
import type { HeartbeatPayload } from '../events'

import { BaseContext } from './base'
import { EventType } from '../events'
import { ARGON_EPOCH_MS } from '../types/primitives'

/** Context for the keep-alive sent after 30 s without events */
export class HeartbeatContext extends BaseContext<HeartbeatPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: HeartbeatPayload) {
    super(deps, eventId, EventType.Heartbeat, payload)
  }

  /** Server time of the heartbeat */
  get time(): Date {
    return new Date(ARGON_EPOCH_MS + this.payload.timestamp)
  }
}
