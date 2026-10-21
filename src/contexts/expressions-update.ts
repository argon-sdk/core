import type { ContextDeps } from './base'
import type { ExpressionsUpdatePayload } from '../events'
import type { ExpressionsDelta, Snowflake } from '../types'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for a change to a space's stickers or custom emoji. Apply `delta` only if `baseVersion` is the version you hold; otherwise re-read `expressions.list()` */
export class ExpressionsUpdateContext extends BaseContext<ExpressionsUpdatePayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ExpressionsUpdatePayload) {
    super(deps, eventId, EventType.ExpressionsUpdate, payload)
  }

  get spaceId(): Snowflake {
    return this.payload.spaceId
  }

  get version(): string {
    return this.payload.version
  }

  get baseVersion(): string | null {
    return this.payload.baseVersion
  }

  get delta(): ExpressionsDelta | null {
    return this.payload.delta
  }
}
