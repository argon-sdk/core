import type { ApiClient } from '../api/client'
import type { CallEndedPayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a call that has ended */
export class CallEndedContext extends BaseContext {
  private readonly payload: CallEndedPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: CallEndedPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.CallEnded, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get callId(): Snowflake {
    return this.payload.callId
  }
}
