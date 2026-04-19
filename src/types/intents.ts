/** Bitfield flags indicating which events the bot subscribes to */
export const Intent = {
  Messages: 1 << 0,
  Members: 1 << 1,
  Channels: 1 << 2,
  Reactions: 1 << 3,
  Typing: 1 << 4,
  Presence: 1 << 5,
  Commands: 1 << 6,
  DirectMessages: 1 << 7,
  Moderation: 1 << 8,
  Archetypes: 1 << 9,
  SpaceUpdates: 1 << 10,
  Voice: 1 << 11,
  ControlInteractions: 1 << 13,

  AllNonPrivileged: 12253,
  AllPrivileged: 34,
  All: 12287,
} as const

/** Union of all intent bitfield values */
export type Intent = (typeof Intent)[keyof typeof Intent]
