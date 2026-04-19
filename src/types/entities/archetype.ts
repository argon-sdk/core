import type { Snowflake } from '../primitives'

/** Represents a role/archetype within a space */
export interface Archetype {
  archetypeId: Snowflake
  spaceId: Snowflake
  name: string
  colour: number
  isMentionable: boolean
  isDefault: boolean
  permissions: bigint | null // int64 in API, server sends as string, parsed to bigint
}

/** A member assigned to an archetype */
export interface ArchetypeMember {
  userId: Snowflake
  username: string
  displayName: string
}
