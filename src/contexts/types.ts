import type { MessageEntity } from '../types'
import type { Snowflake } from '../types'
import type { Row } from '../types'
import type { Visibility } from '../types'

/** Options for sending an interaction reply */
export interface ReplyOptions {
  entities?: MessageEntity[]
  controls?: Row[]
  visibility?: Visibility
  replyTo?: Snowflake | null
}

/** Options for editing an existing message via interaction */
export interface EditOptions {
  entities?: MessageEntity[]
  controls?: Row[]
}
