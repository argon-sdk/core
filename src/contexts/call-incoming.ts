import type { ApiClient } from '../api/client'
import type { CallIncomingPayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for an incoming call to a verified bot */
export class CallIncomingContext extends BaseContext {
  private readonly payload: CallIncomingPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: CallIncomingPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.CallIncoming, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get callId(): Snowflake {
    return this.payload.callId
  }

  get fromUserId(): Snowflake {
    return this.payload.fromUserId
  }

  accept(): Promise<unknown> {
    return this.api.calls.accept(this.callId)
  }

  reject(reason: string): Promise<unknown> {
    return this.api.calls.reject(this.callId, reason)
  }
}
