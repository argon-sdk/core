import type { ContextDeps } from './base'
import type { ReadyPayload } from '../events'
import type { BotSpaceInfo } from '../events'

import { BaseContext } from './base'
import { EventType } from '../events'
import { toEntitlementMask } from '../types/entitlement'

/** Context for the event sent when the stream connects */
export class ReadyContext extends BaseContext<ReadyPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ReadyPayload) {
    super(deps, eventId, EventType.Ready, payload)
  }

  /** Intents the stream was opened with */
  get intents(): number {
    return this.payload.intents
  }

  get spaces(): BotSpaceInfo[] {
    return this.payload.spaces
  }

  /** Entitlements granted in a space, as a bitmask (`0n` if the bot is not in it) */
  granted(spaceId: string): bigint {
    return toEntitlementMask(this.payload.spaces.find((s) => s.spaceId === spaceId)?.grantedEntitlements)
  }
}
