import type { Snowflake } from '../primitives'

/** Available channel type identifiers */
export const ChannelType = {
  Text: 'text',
  Voice: 'voice',
  Announcement: 'announcement',
} as const

/** Union of all channel type string literals */
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType]

/** Represents a channel within a space */
export interface Channel {
  channelId: Snowflake
  spaceId: Snowflake
  channelType: ChannelType
  name: string
  description: string
  groupId: Snowflake | null
  isArchived: boolean
}
