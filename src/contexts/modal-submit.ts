import type { ApiClient } from '../api/client'
import type { ModalSubmitPayload } from '../events'
import type { Snowflake, User } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { InteractionContext } from './interaction'
import { EventType } from '../events'

/** Context for modal form submission events */
export class ModalSubmitContext extends InteractionContext {
  private readonly payload: ModalSubmitPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: ModalSubmitPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.ModalSubmit, registerControlHandler, registerSelectHandler, services)
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
  get modalInteractionId(): Snowflake {
    return this.payload.modalInteractionId
  }
  get values(): Record<string, string> {
    return this.payload.values
  }

  value(customId: string): string | undefined {
    return this.payload.values[customId]
  }
}
