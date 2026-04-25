import type { ApiClient } from '../api/client'
import type { BotEntitlementsUpdatedPayload, EntitlementName } from '../events'
import type { Snowflake } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the bot's required/granted entitlement set drifting in a space */
export class BotEntitlementsUpdatedContext extends BaseContext {
  private readonly payload: BotEntitlementsUpdatedPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: BotEntitlementsUpdatedPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.BotEntitlementsUpdated, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get grantedEntitlements(): EntitlementName {
    return this.payload.grantedEntitlements
  }

  get requiredEntitlements(): EntitlementName {
    return this.payload.requiredEntitlements
  }
}
