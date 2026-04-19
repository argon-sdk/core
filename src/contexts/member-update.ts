import type { ApiClient } from '../api/client'
import type { MemberUpdatePayload } from '../events'
import type { Snowflake, User } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the member update event */
export class MemberUpdateContext extends BaseContext {
  private readonly payload: MemberUpdatePayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: MemberUpdatePayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.MemberUpdate, registerControlHandler, registerSelectHandler, services)
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

  get displayName(): string {
    return this.payload.user.displayName
  }

  get username(): string {
    return this.payload.user.username
  }
}
