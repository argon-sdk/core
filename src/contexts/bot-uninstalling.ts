import type { ContextDeps } from './base'
import type { BotSpacePayload } from '../events'
import type { Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the bot being removed from a space */
export class BotUninstallingContext extends BaseContext<BotSpacePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: BotSpacePayload) {
    super(deps, eventId, EventType.BotUninstallingFromSpace, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
}
