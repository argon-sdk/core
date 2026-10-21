import type { Snowflake } from '../primitives'

/** Member state flag bits of {@link VoiceState.state} */
export const VoiceMemberState = {
  None: 0,
  Muted: 1 << 1,
  MutedByServer: 1 << 2,
  MutedHeadphones: 1 << 3,
  MutedHeadphonesByServer: 1 << 4,
  Streaming: 1 << 5,
} as const

/** Voice channel presence of the user behind an interaction */
export interface VoiceState {
  channelId: Snowflake
  /** ISO-8601 timestamp */
  joinedAt: string
  /** Bitmask of {@link VoiceMemberState} */
  state: number
}
