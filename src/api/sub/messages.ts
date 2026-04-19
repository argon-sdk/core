import type { MessageEntity } from '../../types'
import type { BaseApiClient } from '../base'
import type { Visibility } from '../../types'
import type { Snowflake } from '../../types'
import type { Message } from '../../types'
import type { Row } from '../../types'

/** Parameters for sending a message to a channel */
export interface SendMessageParams {
  channelId: Snowflake
  text: string
  entities?: MessageEntity[]
  randomId?: Snowflake
  replyTo?: Snowflake
  controls?: Row[]
  visibility?: Visibility
}

/** Response returned after successfully sending a message */
export interface SendMessageResponse {
  messageId: Snowflake
}

/** Parameters for fetching message history from a channel */
export interface MessageHistoryParams {
  channelId: Snowflake
  from?: Snowflake
  limit?: number
}

export class MessagesApi {
  constructor(private readonly base: BaseApiClient) {}

  send(params: SendMessageParams): Promise<SendMessageResponse> {
    const randomId = params.randomId ?? String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))

    return this.base.call<SendMessageResponse>('IMessages', 1, 'Send', 'POST', {
      body: {
        channelId: params.channelId,
        text: params.text,
        entities: params.entities ?? [],
        randomId,
        replyTo: params.replyTo ?? null,
        controls: params.controls,
        visibility: params.visibility,
      },
    })
  }

  history(params: MessageHistoryParams): Promise<{ messages: Message[] }> {
    return this.base.call<{ messages: Message[] }>('IMessages', 1, 'History', 'GET', {
      query: {
        channelId: params.channelId,
        from: params.from,
        limit: params.limit !== undefined ? String(params.limit) : undefined,
      },
    })
  }
}
