import type { MessageEntity, Snowflake } from '../types'
import type { Row, ControlRowData } from '../controls'
import type { BuiltMessage } from '../core/message-builder'
import type { InputFile } from '../api/files'

/** Message content: plain text, or the result of `richText(...)` */
export type MessageContent = string | BuiltMessage

/** Options for sending a message from a context */
export interface ReplyOptions {
  /** Extra entities; combined with those of a `richText` content */
  entities?: MessageEntity[]
  controls?: Array<Row | ControlRowData>
  /** Message to reply to; `null` sends a plain message */
  replyTo?: Snowflake | null
  /** Up to 10 files: uploaded file ids, `Blob`s or `file(data, name)` */
  attachments?: InputFile[]
}

/** Options for editing a message */
export interface EditOptions {
  /** New controls; omit to keep them, `[]` removes them */
  controls?: Array<Row | ControlRowData>
}
