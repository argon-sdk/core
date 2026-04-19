import type { ApiClient } from '../api/client'
import type { MemberLeavePayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the member leave event */
export class MemberLeaveContext extends BaseContext {
  private readonly payload: MemberLeavePayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: MemberLeavePayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.MemberLeave, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get userId(): Snowflake {
    return this.payload.userId
  }
}
