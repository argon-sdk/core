import type { MessageEntity, Snowflake, Attachment, HistoryMessage } from '../../types'
import type { BaseApiClient } from '../base'
import type { Row, ControlRowData } from '../../controls'
import type { InputFile } from '../files'

import { serializeRows } from '../../controls/row'
import { appendFilePart, isFileContent, randomMessageId } from '../files'
import { ArgonError } from '../../errors'

/** Most attachments per message */
export const MAX_ATTACHMENTS = 10

/** Parameters for sending a message to a channel */
export interface SendMessageParams {
  channelId: Snowflake
  /** Up to 4096 characters */
  text: string
  entities?: MessageEntity[]
  /** De-duplication key: a repeated send with the same id within 2 minutes returns the first message. Random by default */
  randomId?: Snowflake
  /** Message to reply to */
  replyTo?: Snowflake | null
  controls?: Array<Row | ControlRowData>
  /** Up to 10 files: uploaded file ids, `Blob`s or `file(data, name)`. Needs the AttachFiles entitlement */
  attachments?: InputFile[]
}

/** Response returned after successfully sending a message */
export interface SendMessageResponse {
  messageId: Snowflake
  attachments: Attachment[]
}

/** Parameters for editing a message the bot sent */
export interface EditMessageParams {
  /** New text; omit to keep it */
  text?: string
  /** New controls; omit to keep them, `[]` removes them */
  controls?: Array<Row | ControlRowData>
}

/** Parameters for fetching message history from a channel */
export interface MessageHistoryParams {
  channelId: Snowflake
  /** Return messages older than this one */
  from?: Snowflake
  /** 1–100, default 50 */
  limit?: number
}

export class MessagesApi {
  constructor(private readonly base: BaseApiClient) {}

  /** Sends a message; with file contents in `attachments` the request goes out as multipart */
  send(params: SendMessageParams): Promise<SendMessageResponse> {
    const attachments = params.attachments ?? []

    if (attachments.length > MAX_ATTACHMENTS) {
      throw new ArgonError(`A message holds at most ${MAX_ATTACHMENTS} attachments`)
    }

    const controls = serializeRows(params.controls)
    const randomId = params.randomId ?? randomMessageId()
    this.base.sinkControls(params.controls as Row[] | undefined)

    if (!attachments.some(isFileContent)) {
      return this.base.call<SendMessageResponse>('IMessages', 1, 'Send', 'POST', {
        body: {
          channelId: params.channelId,
          text: params.text,
          entities: params.entities ?? [],
          randomId,
          replyTo: params.replyTo ?? null,
          controls,
          attachments: attachments.length > 0 ? attachments : undefined,
        },
        idempotent: true,
      })
    }

    const form = new FormData()
    form.append('channelId', params.channelId)
    form.append('text', params.text)
    form.append('randomId', randomId)

    if (params.replyTo) {
      form.append('replyTo', params.replyTo)
    }

    if (params.entities && params.entities.length > 0) {
      form.append('entities', JSON.stringify(params.entities))
    }

    if (controls) {
      form.append('controls', JSON.stringify(controls))
    }

    // File ids are listed before the parts, so the server keeps the caller's order only within each group
    for (const attachment of attachments) {
      if (!isFileContent(attachment)) {
        form.append('attachments', attachment)
      }
    }

    for (const attachment of attachments) {
      if (isFileContent(attachment)) {
        appendFilePart(form, 'attachments', attachment)
      }
    }

    return this.base.call<SendMessageResponse>('IMessages', 1, 'Send', 'POST', { form, idempotent: true })
  }

  /** Edits the text and/or controls of a message this bot sent. Entities cannot be changed */
  async edit(channelId: Snowflake, messageId: Snowflake, params: EditMessageParams): Promise<void> {
    this.base.sinkControls(params.controls as Row[] | undefined)

    await this.base.call<void>('IInteractions', 1, 'EditMessage', 'PATCH', {
      body: {
        channelId,
        messageId,
        text: params.text ?? null,
        controls: serializeRows(params.controls) ?? null,
      },
      idempotent: true,
    })
  }

  /** One page of history, newest first. Without ViewChannel + ReadHistory the page is empty */
  history(params: MessageHistoryParams): Promise<{ messages: HistoryMessage[] }> {
    return this.base.call<{ messages: HistoryMessage[] }>('IMessages', 1, 'History', 'GET', {
      query: { channelId: params.channelId, from: params.from, limit: params.limit },
    })
  }

  /** Iterates a channel's history from newest to oldest, fetching pages as needed */
  async *iterate(
    channelId: Snowflake,
    options: { from?: Snowflake; pageSize?: number; max?: number } = {},
  ): AsyncIterable<HistoryMessage> {
    let from = options.from
    let remaining = options.max ?? Number.POSITIVE_INFINITY
    const pageSize = Math.min(Math.max(options.pageSize ?? 100, 1), 100)

    while (remaining > 0) {
      const requested = Math.min(pageSize, remaining)
      const { messages } = await this.history({ channelId, from, limit: requested })

      for (const message of messages) {
        yield message
      }

      remaining -= messages.length

      if (messages.length < requested) {
        return
      }

      from = messages[messages.length - 1]!.messageId
    }
  }
}
