import type { Snowflake } from '../primitives'

/** Channel type values, as sent to `channels.create()` and in channel events */
export const ChannelType = {
  Text: 0,
  Voice: 1,
  Announcement: 2,
} as const

/** Union of channel type values */
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType]

/** A channel as returned by `channels.list()` / `channels.create()` */
export interface Channel {
  channelId: Snowflake
  spaceId: Snowflake
  name: string
  description: string | null
  /** Note: the REST API reports the type by name */
  channelType: 'Text' | 'Voice' | 'Announcement'
  groupId: Snowflake | null
}

/** A channel as delivered in the `channelCreate` event */
export interface ChannelInfo {
  channelId: Snowflake
  spaceId: Snowflake
  type: ChannelType
  name: string
  description: string | null
}
