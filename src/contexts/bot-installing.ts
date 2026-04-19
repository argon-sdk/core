import type { ApiClient } from '../api/client'
import type { BotSpacePayload } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the bot being installed to a space */
export class BotInstallingContext extends BaseContext {
  private readonly payload: BotSpacePayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: BotSpacePayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.BotInstallingToSpace, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
}
