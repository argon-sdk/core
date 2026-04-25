import type { ApiClient } from '../api/client'
import type { ReadyPayload, BotSpaceInfo } from '../events'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the initial ready event after connection */
export class ReadyContext extends BaseContext {
  private readonly payload: ReadyPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ReadyPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.Ready, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get intents(): number {
    return this.payload.intents
  }

  get spaces(): BotSpaceInfo[] {
    return this.payload.spaces
  }
}
