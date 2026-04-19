import type { ApiClient } from '../api/client'
import type { SelectInteractionPayload } from '../events'
import type { Snowflake, User } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { InteractionContext } from './interaction'
import { EventType } from '../events'

/** Context for select menu interaction events */
export class SelectInteractionContext extends InteractionContext {
  private readonly payload: SelectInteractionPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: SelectInteractionPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.SelectInteraction, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get interactionId(): Snowflake {
    return this.payload.interactionId
  }
  get channelId(): Snowflake {
    return this.payload.channelId
  }
  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get userId(): Snowflake {
    return this.payload.user.userId
  }
  get user(): User {
    return this.payload.user
  }
  get id(): string {
    return this.payload.controlId
  }
  get controlType(): string {
    return this.payload.controlType
  }
  get messageId(): string {
    return this.payload.messageId
  }
  get values(): string[] {
    return this.payload.values
  }
}
