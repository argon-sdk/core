import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'
import type { Channel } from '../../types'

/** Parameters for creating a new channel in a space */
export interface CreateChannelParams {
  spaceId: Snowflake
  name: string
  channelType: 'text' | 'voice' | 'announcement'
  description?: string
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
    return this.base.call<Channel>('IChannels', 1, 'Create', 'POST', {
      body: params,
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
