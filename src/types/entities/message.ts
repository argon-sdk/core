import type { Snowflake } from '../primitives'
import type { MessageEntity } from './entity'
import type { Control } from '../../controls'
import type { Reaction } from './reaction'

/** Represents a chat message in a channel */
export interface Message {
  messageId: Snowflake
  channelId: Snowflake
  spaceId: Snowflake
  text: string
  entities: MessageEntity[]
  sender: Snowflake
  replyId: Snowflake | null
  timeSent: string
  controls: Control[][]
  reactions: Reaction[]
}
