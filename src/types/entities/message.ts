import type { Snowflake } from '../primitives'
import type { MessageEntity } from './entity'
import type { ControlRowData } from '../../controls'
import type { Reaction } from './reaction'
import type { User } from './user'

/** A file attached to a message */
export interface Attachment {
  fileId: Snowflake
  /** Download URL (empty string if it could not be resolved) */
  url: string
  fileName: string
  size: number
  contentType: string
  width: number | null
  height: number | null
}

/** Where a crossposted message came from */
export interface Crosspost {
  sourceSpaceId: Snowflake
  sourceChannelId: Snowflake
  sourceMessageId: Snowflake
  sourceSpaceName: string
  sourceChannelName: string
}

/** The webhook that posted a message */
export interface MessageWebhook {
  webhookId: Snowflake
  name: string
  avatarFileId: string | null
}

/** A message as delivered in the `messageCreate` event */
export interface Message {
  messageId: Snowflake
  replyId: Snowflake | null
  channelId: Snowflake
  spaceId: Snowflake
  text: string
  entities: MessageEntity[]
  /** ISO-8601 timestamp */
  timeSent: string
  /** `null` for system messages */
  sender: User | null
  /** Always `null` in events; read controls from `messages.history()` */
  controls: ControlRowData[] | null
  /** `null` when there are none */
  reactions: Reaction[] | null
  crosspost: Crosspost | null
  webhook: MessageWebhook | null
  /** `null` when there are none; videos are listed here too */
  attachments: Attachment[] | null
}

/** A message as returned by `messages.history()` */
export interface HistoryMessage {
  messageId: Snowflake
  channelId: Snowflake
  spaceId: Snowflake
  text: string
  creatorId: Snowflake
  /** ISO-8601 timestamp */
  createdAt: string
  replyTo: Snowflake | null
  entities: MessageEntity[]
  controls: ControlRowData[] | null
  /** At most 3 `userIds` per reaction */
  reactions: Reaction[] | null
  attachments: Attachment[] | null
}
