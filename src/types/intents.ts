/** Bitfield flags indicating which events the bot subscribes to */
export const Intent = {
  Messages: 1 << 0,
  /** Privileged */
  Members: 1 << 1,
  Channels: 1 << 2,
  Reactions: 1 << 3,
  Typing: 1 << 4,
  /** Privileged */
  Presence: 1 << 5,
  Commands: 1 << 6,
  DirectMessages: 1 << 7,
  Moderation: 1 << 8,
  Archetypes: 1 << 9,
  SpaceUpdates: 1 << 10,
  Voice: 1 << 11,
  /** Privileged (verified bots only) */
  Calls: 1 << 12,
  ControlInteractions: 1 << 13,
  Expressions: 1 << 14,

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
    (1 << 13) |
    (1 << 14),
  AllPrivileged: (1 << 1) | (1 << 5) | (1 << 12),
  All: (1 << 15) - 1,
} as const

/** Union of all intent bitfield values */
export type Intent = (typeof Intent)[keyof typeof Intent]

/** Intent that must be enabled to receive each event; events missing here are always delivered */
export const EVENT_INTENTS: Readonly<Record<string, number>> = {
  messageCreate: Intent.Messages,
  messageEdit: Intent.Messages,
  memberJoin: Intent.Members,
  memberLeave: Intent.Members,
  memberUpdate: Intent.Members,
  channelCreate: Intent.Channels,
  channelDelete: Intent.Channels,
  reactionAdd: Intent.Reactions,
  reactionRemove: Intent.Reactions,
  typingStart: Intent.Typing,
  typingStop: Intent.Typing,
  presenceUpdate: Intent.Presence,
  commandInteraction: Intent.Commands,
  archetypeCreate: Intent.Archetypes,
  archetypeUpdate: Intent.Archetypes,
  voiceJoin: Intent.Voice,
  voiceLeave: Intent.Voice,
  callIncoming: Intent.Calls,
  callEnded: Intent.Calls,
  controlInteraction: Intent.ControlInteractions,
  selectInteraction: Intent.ControlInteractions,
  modalSubmit: Intent.ControlInteractions,
  expressionsUpdate: Intent.Expressions,
}

/** Names of the intent bits set in `intents`, e.g. `['Messages', 'Commands']` */
export function intentNames(intents: number): string[] {
  return Object.entries(Intent)
    .filter(([name, bit]) => !name.startsWith('All') && (intents & bit) !== 0)
    .map(([name]) => name)
}
