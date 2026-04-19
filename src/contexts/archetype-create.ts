import { type RegisterControlHandler, type RegisterSelectHandler, BaseContext } from './base'
import { type ArchetypeEventPayload, EventType } from '../events'
import type { Snowflake, Archetype } from '../types'
import type { ApiClient } from '../api/client'

/** Context for the archetype (role) creation event */
export class ArchetypeCreateContext extends BaseContext {
  private readonly payload: ArchetypeEventPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ArchetypeEventPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.ArchetypeCreate, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get archetype(): Archetype {
    return this.payload.archetype
  }
}
