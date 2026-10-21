import type { Snowflake } from '../primitives'

/** Represents a role/archetype within a space */
export interface Archetype {
  archetypeId: Snowflake
  spaceId: Snowflake
  name: string
  colour: number
  isMentionable: boolean
  isDefault: boolean
  /** Entitlement bitmask; only filled by `archetypes.list/get` for bots holding ManageArchetype, `null` otherwise */
  permissions: bigint | null
}

/** A member assigned to an archetype */
export interface ArchetypeMember {
  userId: Snowflake
  username: string
  displayName: string
}
