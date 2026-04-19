import type { Snowflake } from '../primitives'

/** Represents a reaction on a message with emoji and user list */
export interface Reaction {
  emoji: string
  count: number
  userIds: Snowflake[]
}
