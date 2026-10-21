import type { ApiClient, SendMessageResponse } from '../api/client'
import type { Snowflake } from '../types'
import type { MessageContent, ReplyOptions } from './types'

/** Splits message content into text and entities */
export function contentParts(content: MessageContent, extra: ReplyOptions['entities'] = []) {
  return typeof content === 'string'
    ? { text: content, entities: extra }
    : { text: content.text, entities: [...content.entities, ...extra] }
}

/** Sends a message to a channel on behalf of a context */
export function sendMessage(
  api: ApiClient,
  channelId: Snowflake,
  content: MessageContent,
  options: ReplyOptions = {},
): Promise<SendMessageResponse> {
  const { text, entities } = contentParts(content, options.entities)

  return api.messages.send({
    channelId,
    text,
    entities,
    replyTo: options.replyTo ?? null,
    controls: options.controls,
    attachments: options.attachments,
  })
}
