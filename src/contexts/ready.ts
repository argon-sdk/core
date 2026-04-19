import type { ApiClient } from '../api/client'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

interface ReadyPayload {
  intents: number
  spaceIds: Snowflake[]
}

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
  get spaceIds(): Snowflake[] {
    return this.payload.spaceIds
  }
}
