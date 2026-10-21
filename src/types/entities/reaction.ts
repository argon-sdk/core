import type { Snowflake } from '../primitives'

/** A reaction on a message */
export interface Reaction {
  /** Unicode emoji, or `:name:` for a custom emoji */
  emoji: string
  count: number
  /** Users who reacted; REST responses carry at most 3, use `count` for the total */
  userIds: Snowflake[]
  /** Set for custom emoji reactions */
  customEmojiId: Snowflake | null
}
