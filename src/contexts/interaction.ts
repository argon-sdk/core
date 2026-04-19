import type { SendMessageResponse, ModalDefinition } from '../api/client'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'
import type { ReplyOptions, EditOptions } from './types'
import { resolveVisibility } from './visibility'
import type { ApiClient } from '../api/client'
import type { SseEventMap } from '../events'
import type { Visibility } from '../types'
import { VisibilityScope } from '../types'
import type { Snowflake } from '../types'
import type { Archetype } from '../types'
import { ArgonError } from '../errors'
import { BaseContext } from './base'
import type { User } from '../types'

const AUTO_ACK_TIMEOUT_MS = 3_000

/** Abstract context for interaction-based events with reply, ack, defer, and modal support */
export abstract class InteractionContext extends BaseContext {
  private responded = false
  private autoAckTimer: ReturnType<typeof setTimeout> | null = null

  abstract get interactionId(): Snowflake
  abstract get channelId(): Snowflake
  abstract get spaceId(): Snowflake
  abstract get userId(): Snowflake
  abstract get user(): User

  protected constructor(
    api: ApiClient,
    eventId: string,
    event: keyof SseEventMap,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, event, registerControlHandler, registerSelectHandler, services)
    this.scheduleAutoAck()
  }

  async ack(): Promise<void> {
    this.markResponded()
    await this.api.interactions.ack(this.interactionId)
  }

  async reply(text: string, options: ReplyOptions = {}): Promise<SendMessageResponse> {
    this.markResponded()
    this.extractControlHandlers(options.controls)
    this.extractSelectHandlers(options.controls)

    return this.api.interactions.reply(this.interactionId, this.channelId, {
      text,
      entities: options.entities,
      controls: options.controls,
      visibility: options.visibility,
      replyTo: options.replyTo,
    })
  }

  async whisper(text: string, options: Omit<ReplyOptions, 'visibility'> = {}): Promise<SendMessageResponse> {
    return this.reply(text, {
      ...options,
      visibility: { scope: VisibilityScope.User, userId: this.userId },
    })
  }

  async defer(): Promise<void> {
    this.markResponded()
    await this.api.interactions.defer(this.interactionId)
  }

  async editMessage(text: string, options: EditOptions = {}): Promise<void> {
    this.markResponded()
    this.extractControlHandlers(options.controls)
    this.extractSelectHandlers(options.controls)

    await this.api.interactions.editMessage(this.interactionId, this.channelId, {
      text,
      entities: options.entities,
      controls: options.controls,
    })
  }

  async showModal(modal: ModalDefinition): Promise<{ modalInteractionId: Snowflake }> {
    this.markResponded()
    return this.api.interactions.showModal(this.interactionId, modal)
  }

  visibilityFor(userId: Snowflake, filter?: (archetype: Archetype) => boolean): Promise<Visibility> {
    return resolveVisibility(this.api, this.spaceId, userId, filter)
  }

  protected markResponded(): void {
    if (this.responded) {
      throw new ArgonError('Already responded')
    }

    this.responded = true

    if (this.autoAckTimer !== null) {
      clearTimeout(this.autoAckTimer)
      this.autoAckTimer = null
    }
  }

  private scheduleAutoAck(): void {
    this.autoAckTimer = setTimeout(async () => {
      if (!this.responded) {
        this.responded = true
        await this.api.interactions.ack(this.interactionId).catch(() => {})
      }
    }, AUTO_ACK_TIMEOUT_MS)
  }
}
