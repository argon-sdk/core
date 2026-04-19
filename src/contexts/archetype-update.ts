import type { RegisterControlHandler, RegisterSelectHandler } from './base'
import type { ArchetypeEventPayload } from '../events'
import type { ApiClient } from '../api/client'
import type { Snowflake } from '../types'
import type { Archetype } from '../types'
import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the archetype (role) update event */
export class ArchetypeUpdateContext extends BaseContext {
  private readonly payload: ArchetypeEventPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ArchetypeEventPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.ArchetypeUpdate, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get archetype(): Archetype {
    return this.payload.archetype
  }
}
