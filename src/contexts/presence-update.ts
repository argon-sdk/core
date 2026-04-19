import type { ApiClient } from '../api/client'
import type { BotPresence, PresenceStatus, PresenceUpdatePayload } from '../events'
import type { Snowflake, User } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for user presence status change events */
export class PresenceUpdateContext extends BaseContext {
  private readonly payload: PresenceUpdatePayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: PresenceUpdatePayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.PresenceUpdate, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
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

  get presence(): BotPresence {
    return this.payload.presence
  }

  get status(): PresenceStatus {
    return this.payload.presence.status
  }
}
