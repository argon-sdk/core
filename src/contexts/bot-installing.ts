import type { ContextDeps } from './base'
import type { BotSpacePayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the bot being installed into a space */
export class BotInstallingContext extends BaseContext<BotSpacePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: BotSpacePayload) {
    super(deps, eventId, EventType.BotInstallingToSpace, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
}
