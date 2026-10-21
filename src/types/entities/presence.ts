/** Presence status values */
export const PresenceStatus = {
  Offline: 0,
  Online: 1,
  Away: 2,
  InGame: 3,
  Listen: 4,
  TouchGrass: 5,
  DoNotDisturb: 6,
} as const

/** Union of presence status values */
export type PresenceStatus = (typeof PresenceStatus)[keyof typeof PresenceStatus]

/** Activity kind values */
export const ActivityKind = {
  Game: 0,
  Software: 1,
  Streaming: 2,
  Listen: 3,
} as const

/** Union of activity kind values */
export type ActivityKind = (typeof ActivityKind)[keyof typeof ActivityKind]

/** Describes a user's current activity */
export interface PresenceActivity {
  kind: ActivityKind
  startTimestampSeconds: number
  titleName: string
}

/** User presence with status and optional activity */
export interface BotPresence {
  status: PresenceStatus
  activity: PresenceActivity | null
}
