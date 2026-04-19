import type { MessageEntity } from '../../types'
import type { BaseApiClient } from '../base'
import type { Visibility } from '../../types'
import type { Snowflake } from '../../types'
import type { Row } from '../../types'
import type { ModalDefinition } from '../../controls'

import type { SendMessageResponse } from './messages'

export class InteractionsApi {
  constructor(private readonly base: BaseApiClient) {}

  ack(interactionId: Snowflake): Promise<void> {
    return this.base.call<void>('IInteractions', 1, 'Ack', 'POST', {
      body: { interactionId },
    })
  }

  reply(
    interactionId: Snowflake,
    channelId: Snowflake,
    params: {
      text: string
      entities?: MessageEntity[]
      controls?: Row[]
      visibility?: Visibility
      replyTo?: Snowflake | null
    },
  ): Promise<SendMessageResponse> {
    return this.base.call<SendMessageResponse>('IInteractions', 1, 'Reply', 'POST', {
      body: {
        interactionId,
        channelId,
        text: params.text,
        entities: params.entities ?? [],
        controls: params.controls,
        visibility: params.visibility,
        replyTo: params.replyTo ?? null,
      },
    })
  }

  defer(interactionId: Snowflake): Promise<void> {
    return this.base.call<void>('IInteractions', 1, 'Defer', 'POST', {
      body: { interactionId },
    })
  }

  editMessage(
    interactionId: Snowflake,
    channelId: Snowflake,
    params: { text: string; entities?: MessageEntity[]; controls?: Row[] },
  ): Promise<void> {
    return this.base.call<void>('IInteractions', 1, 'EditMessage', 'PATCH', {
      body: {
        interactionId,
        channelId,
        text: params.text,
        entities: params.entities ?? [],
        controls: params.controls,
      },
    })
  }

  showModal(interactionId: Snowflake, modal: ModalDefinition): Promise<{ modalInteractionId: Snowflake }> {
    return this.base.call<{ modalInteractionId: Snowflake }>('IInteractions', 1, 'Modal', 'POST', {
      body: { interactionId, modal },
    })
  }
}
