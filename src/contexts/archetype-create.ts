import type { ContextDeps } from './base'
import type { ArchetypeEventPayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for an archetype (role) being created */
export class ArchetypeCreateContext extends BaseContext<ArchetypeEventPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ArchetypeEventPayload) {
    super(deps, eventId, EventType.ArchetypeCreate, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  /** Note: `permissions` is always `null` in events */
  get archetype(): ArchetypeEventPayload['archetype'] {
    return this.payload.archetype
  }
}
