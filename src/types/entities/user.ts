import type { Snowflake } from '../primitives'

/** Account flag bits of {@link User.flags} */
export const UserFlags = {
  None: 0,
  Bot: 1 << 0,
  System: 1 << 1,
  Verified: 1 << 2,
  Premium: 1 << 3,
  Banned: 1 << 4,
  Deleted: 1 << 5,
} as const

/** Union of user flag bit values */
export type UserFlags = (typeof UserFlags)[keyof typeof UserFlags]

/** Represents a platform user */
export interface User {
  userId: Snowflake
  username: string
  displayName: string
  /** The avatar's file id (despite the name, not a URL); resolve it with `bot.api.files.get()` */
  avatarUrl: string | null
  /** Bitmask of {@link UserFlags} */
  flags: number
  /** The user's current app language as a BCP-47 primary tag (e.g. `"ru"`), `null` when unknown */
  locale: string | null
}

/** True when `user.flags` has `flag` set */
export function hasUserFlag(user: Pick<User, 'flags'>, flag: UserFlags): boolean {
  return (user.flags & flag) !== 0
}
