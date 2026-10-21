import type { CallAcceptance, RejectCallResponse } from '../api/client'
import type { ContextDeps } from './base'
import type { CallIncomingPayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for an incoming call to a verified bot */
export class CallIncomingContext extends BaseContext<CallIncomingPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: CallIncomingPayload) {
    super(deps, eventId, EventType.CallIncoming, payload)
  }

  get callId(): Snowflake {
    return this.payload.callId
  }

  get fromUserId(): Snowflake {
    return this.payload.fromUserId
  }

  /** The caller's app language, for picking a voice; `null` when unknown */
  get fromLocale(): string | null {
    return this.payload.fromLocale ?? null
  }

  accept(): Promise<CallAcceptance> {
    return this.api.calls.accept(this.callId)
  }

  reject(reason?: string): Promise<RejectCallResponse> {
    return this.api.calls.reject(this.callId, reason)
  }
}
