import type { BaseApiClient } from '../base'
import type { Snowflake, Channel } from '../../types'

import { ChannelType } from '../../types/entities/channel'

const CHANNEL_TYPE_NAMES = {
  text: ChannelType.Text,
  voice: ChannelType.Voice,
  announcement: ChannelType.Announcement,
} as const

/** Parameters for creating a new channel in a space (needs ManageChannels) */
export interface CreateChannelParams {
  spaceId: Snowflake
  name: string
  /** A {@link ChannelType} value or its lower-case name */
  channelType: ChannelType | keyof typeof CHANNEL_TYPE_NAMES
  description?: string | null
  groupId?: Snowflake | null
}

/** Parameters for deleting a channel from a space */
export interface DeleteChannelParams {
  spaceId: Snowflake
  channelId: Snowflake
}

export class ChannelsApi {
  constructor(private readonly base: BaseApiClient) {}

  create(params: CreateChannelParams): Promise<Channel> {
    const channelType =
      typeof params.channelType === 'string' ? CHANNEL_TYPE_NAMES[params.channelType] : params.channelType

    return this.base.call<Channel>('IChannels', 1, 'Create', 'POST', {
      body: { ...params, description: params.description ?? null, channelType },
    })
  }

  delete(params: DeleteChannelParams): Promise<{ deleted: boolean }> {
    return this.base.call<{ deleted: boolean }>('IChannels', 1, 'Delete', 'DELETE', {
      query: { spaceId: params.spaceId, channelId: params.channelId },
    })
  }

  list(spaceId: Snowflake): Promise<{ channels: Channel[] }> {
    return this.base.call<{ channels: Channel[] }>('IChannels', 1, 'List', 'GET', {
      query: { spaceId },
    })
  }
}
