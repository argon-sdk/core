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
  Calls: 1 << 12,
  ControlInteractions: 1 << 13,

  AllNonPrivileged:
    (1 << 0) |
    (1 << 2) |
    (1 << 3) |
    (1 << 4) |
    (1 << 6) |
    (1 << 7) |
    (1 << 8) |
    (1 << 9) |
    (1 << 10) |
    (1 << 11) |
    (1 << 13),
  AllPrivileged: (1 << 1) | (1 << 5) | (1 << 12),
  All:
    (1 << 0) |
    (1 << 1) |
    (1 << 2) |
    (1 << 3) |
    (1 << 4) |
    (1 << 5) |
    (1 << 6) |
    (1 << 7) |
    (1 << 8) |
    (1 << 9) |
    (1 << 10) |
    (1 << 11) |
    (1 << 12) |
    (1 << 13),
} as const

/** Union of all intent bitfield values */
export type Intent = (typeof Intent)[keyof typeof Intent]
