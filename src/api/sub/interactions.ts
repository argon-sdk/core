import type { MessageEntity, Snowflake } from '../../types'
import type { BaseApiClient } from '../base'
import type { Row, ControlRowData, ModalDefinition, ModalBuilder } from '../../controls'
import type { EditMessageParams } from './messages'

import { serializeRows } from '../../controls/row'
import { serializeModal } from '../../controls/modal'
import { randomMessageId } from '../files'

/** How long the server keeps an interaction (and a shown modal) answerable */
export const INTERACTION_TTL_MS = 60_000

/** Parameters for `interactions.reply()` */
export interface InteractionReplyParams {
  channelId: Snowflake
  text: string
  entities?: MessageEntity[]
  controls?: Array<Row | ControlRowData>
  replyTo?: Snowflake | null
  randomId?: Snowflake
}

export class InteractionsApi {
  private readonly modals = new Map<string, { customId: string; expiresAt: number }>()

  constructor(private readonly base: BaseApiClient) {}

  /** Shows the user a brief confirmation. Repeatable within 60 s of the interaction */
  async ack(interactionId: Snowflake): Promise<void> {
    await this.base.call<void>('IInteractions', 1, 'Ack', 'POST', { body: { interactionId }, idempotent: true })
  }

  /** Shows the user a loading state until the bot follows up. Repeatable within 60 s of the interaction */
  async defer(interactionId: Snowflake): Promise<void> {
    await this.base.call<void>('IInteractions', 1, 'Defer', 'POST', { body: { interactionId }, idempotent: true })
  }

  /**
   * Posts a message to the channel (like `messages.send`, without attachments). Not tied to the interaction:
   * it can be called any number of times, before or after ack/defer.
   */
  reply(params: InteractionReplyParams): Promise<{ messageId: Snowflake }> {
    this.base.sinkControls(params.controls as Row[] | undefined)

    return this.base.call<{ messageId: Snowflake }>('IInteractions', 1, 'Reply', 'POST', {
      body: {
        channelId: params.channelId,
        text: params.text,
        entities: params.entities ?? [],
        controls: serializeRows(params.controls),
        replyTo: params.replyTo ?? null,
        randomId: params.randomId ?? randomMessageId(),
      },
      idempotent: true,
    })
  }

  /** Edits a message this bot sent. Same as `messages.edit()` */
  async editMessage(channelId: Snowflake, messageId: Snowflake, params: EditMessageParams): Promise<void> {
    this.base.sinkControls(params.controls as Row[] | undefined)

    await this.base.call<void>('IInteractions', 1, 'EditMessage', 'PATCH', {
      body: { channelId, messageId, text: params.text ?? null, controls: serializeRows(params.controls) ?? null },
      idempotent: true,
    })
  }

  /**
   * Shows a modal to the user behind the interaction. Uses up the interaction (even if the modal is invalid),
   * and the user has 60 s to submit.
   */
  async showModal(
    interactionId: Snowflake,
    modal: ModalDefinition | ModalBuilder,
  ): Promise<{ modalInteractionId: Snowflake }> {
    const wire = serializeModal(modal)
    const result = await this.base.call<{ modalInteractionId: Snowflake }>('IInteractions', 1, 'Modal', 'POST', {
      body: { interactionId, modal: wire },
    })

    this.rememberModal(result.modalInteractionId, wire.customId)
    return result
  }

  /**
   * `modalSubmit` reports the `modalInteractionId`, not the modal's custom id. This maps it back for modals
   * shown by this process; unknown ids are returned unchanged.
   */
  modalCustomId(modalInteractionId: string): string {
    const entry = this.modals.get(modalInteractionId)
    return entry ? entry.customId : modalInteractionId
  }

  private rememberModal(modalInteractionId: string, customId: string): void {
    const now = Date.now()

    for (const [id, entry] of this.modals) {
      if (entry.expiresAt <= now) {
        this.modals.delete(id)
      }
    }

    // A little longer than the server's TTL, so a submit arriving right at the deadline still maps
    this.modals.set(modalInteractionId, { customId, expiresAt: now + INTERACTION_TTL_MS * 2 })
  }
}
