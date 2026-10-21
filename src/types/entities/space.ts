import type { Snowflake } from '../primitives'

/** Represents a space (server/guild equivalent) */
export interface Space {
  spaceId: Snowflake
  name: string
  description: string | null
  isCommunity: boolean
}
