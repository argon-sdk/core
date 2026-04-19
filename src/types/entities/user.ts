import type { Snowflake } from '../primitives'

/** Account-level flag values for user accounts */
export const UserFlags = {
  None: 'none',
  Bot: 'bot',
  System: 'system',
  Verified: 'verified',
  Premium: 'premium',
  Banned: 'banned',
  Deleted: 'deleted',
} as const

/** Union of all user flag string literals */
export type UserFlags = (typeof UserFlags)[keyof typeof UserFlags]

/** Represents a platform user */
export interface User {
  userId: Snowflake
  username: string
  displayName: string
  avatarUrl: string
  flags: UserFlags
}
