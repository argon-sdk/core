import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

export class MembersApi {
  constructor(private readonly base: BaseApiClient) {}

  kick(spaceId: Snowflake, channelId: Snowflake, userId: Snowflake): Promise<{ kicked: boolean }> {
    return this.base.call<{ kicked: boolean }>('IMembers', 1, 'Kick', 'POST', {
      query: { spaceId, channelId, userId },
    })
  }
}
