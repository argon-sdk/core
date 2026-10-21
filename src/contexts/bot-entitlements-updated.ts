import type { ContextDeps } from './base'
import type { BotEntitlementsUpdatedPayload } from '../events'
import type { Snowflake } from '../types'
import type { EntitlementName } from '../types/entitlement'

import { BaseContext } from './base'
import { EventType } from '../events'
import { entitlementNames, toEntitlementMask } from '../types/entitlement'

/** Context for a space granting fewer entitlements than the bot requires (sent on every connect while that holds) */
export class BotEntitlementsUpdatedContext extends BaseContext<BotEntitlementsUpdatedPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: BotEntitlementsUpdatedPayload) {
    super(deps, eventId, EventType.BotEntitlementsUpdated, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  /** Granted entitlements bitmask */
  get grantedEntitlements(): bigint {
    return toEntitlementMask(this.payload.grantedEntitlements)
  }

  /** Required entitlements bitmask */
  get requiredEntitlements(): bigint {
    return toEntitlementMask(this.payload.requiredEntitlements)
  }

  /** Names of required entitlements the space has not granted */
  get missing(): EntitlementName[] {
    return entitlementNames(this.requiredEntitlements & ~this.grantedEntitlements)
  }
}
