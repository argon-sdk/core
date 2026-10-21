import type { SendMessageResponse } from '../api/client'
import type { ModalDefinition, ModalBuilder } from '../controls'
import type { SseEventMap } from '../events'
import type { Snowflake, User, VoiceState } from '../types'
import type { ContextDeps } from './base'
import type { MessageContent, ReplyOptions } from './types'

import { ArgonError, HttpError } from '../errors'
import { BaseContext } from './base'
import { sendMessage } from './send'

/** Fields every interaction payload carries */
interface InteractionPayload {
  interactionId: Snowflake
  channelId: Snowflake
  spaceId: Snowflake
  user: User
  voiceState: VoiceState | null
}

/** How the interaction was answered so far */
type ResponseState = 'none' | 'autoDeferred' | 'acked' | 'deferred' | 'modal'

/**
 * Base for command, button, select and modal-submit contexts.
 *
 * The user's client waits for an acknowledgement: `ack()` (brief confirmation), `defer()` (loading state) or
 * `showModal()`. Messages are separate — `reply()` can be called any number of times, before or after those.
 * The bot answers for you when you don't: after `interactions.autoDeferAfter` ms (default 2.5 s) a still
 * running handler gets a `defer()`, and once handlers finish an unanswered (or auto-deferred) interaction is
 * acknowledged. The server keeps interactions answerable for 60 s.
 */
export abstract class InteractionContext<P extends InteractionPayload = InteractionPayload> extends BaseContext<P> {
  private state: ResponseState = 'none'
  private timer: ReturnType<typeof setTimeout> | null = null

  /** False for modal submits, whose interaction id the server does not accept for ack/defer/modal */
  protected readonly answerable: boolean = true

  protected constructor(deps: ContextDeps, eventId: string, event: keyof SseEventMap, payload: P) {
    super(deps, eventId, event, payload)
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
  get user(): User {
    return this.payload.user
  }
  get userId(): Snowflake {
    return this.payload.user.userId
  }
  /** The user's app language (BCP-47 primary tag), `null` when unknown */
  get locale(): string | null {
    return this.payload.user.locale ?? null
  }
  /** The user's voice channel, if they are in one */
  get voiceState(): VoiceState | null {
    return this.payload.voiceState ?? null
  }
  /** True once the interaction was acknowledged, deferred or answered with a modal */
  get responded(): boolean {
    return this.state !== 'none'
  }

  /** Shows the user a brief confirmation */
  async ack(): Promise<void> {
    this.answer('acked')

    if (this.answerable) {
      await this.api.interactions.ack(this.interactionId)
    }
  }

  /** Shows the user a loading state until you follow up */
  async defer(): Promise<void> {
    this.answer('deferred')

    if (this.answerable) {
      await this.api.interactions.defer(this.interactionId)
    }
  }

  /** Posts a message in the interaction's channel */
  reply(content: MessageContent, options: ReplyOptions = {}): Promise<SendMessageResponse> {
    return sendMessage(this.api, this.channelId, content, options)
  }

  /** Shows a modal. Only possible once per interaction, and not after the auto-defer kicked in */
  async showModal(modal: ModalDefinition | ModalBuilder): Promise<{ modalInteractionId: Snowflake }> {
    if (!this.answerable) {
      throw new ArgonError('A modal submit cannot open another modal')
    }

    if (this.state === 'modal') {
      throw new ArgonError('This interaction already showed a modal')
    }

    this.answer('modal')
    return this.api.interactions.showModal(this.interactionId, modal)
  }

  /** @internal Schedules the automatic `defer()` for slow handlers */
  autoDeferAfter(ms: number): void {
    if (!this.answerable || ms < 0) {
      return
    }

    this.timer = setTimeout(() => {
      this.timer = null

      if (this.state === 'none') {
        this.state = 'autoDeferred'
        this.api.interactions.defer(this.interactionId).catch(() => {})
      }
    }, ms)
  }

  /** @internal Called after handlers finished: acknowledges an interaction nobody answered */
  async settle(): Promise<void> {
    this.clearTimer()

    if (!this.answerable || (this.state !== 'none' && this.state !== 'autoDeferred')) {
      return
    }

    this.state = 'acked'

    try {
      await this.api.interactions.ack(this.interactionId)
    } catch (error) {
      // Expired (60 s) or answered elsewhere — nothing left to do
      if (!(error instanceof HttpError && error.statusCode === 404)) {
        throw error
      }
    }
  }

  private answer(state: ResponseState): void {
    this.clearTimer()
    this.state = state
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
