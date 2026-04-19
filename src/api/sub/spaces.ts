import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** Detailed information about a space the bot is installed in */
export interface BotSpaceDetail {
  spaceId: Snowflake
  name: string
  description: string
  isCommunity: boolean
}

/** A member within a space as seen by the bot */
export interface BotMember {
  userId: Snowflake
  spaceId: Snowflake
  displayName: string
  username: string
  archetypeIds: Snowflake[]
}

export class SpacesApi {
  constructor(private readonly base: BaseApiClient) {}

  get(spaceId: Snowflake): Promise<BotSpaceDetail> {
    return this.base.call<BotSpaceDetail>('ISpaces', 1, 'Get', 'GET', {
      query: { spaceId },
    })
  }

  getMember(spaceId: Snowflake, userId: Snowflake): Promise<BotMember> {
    return this.base.call<BotMember>('ISpaces', 1, 'GetMember', 'GET', {
      query: { spaceId, userId },
    })
  }

  listMembers(spaceId: Snowflake): Promise<{ members: BotMember[] }> {
    return this.base.call<{ members: BotMember[] }>('ISpaces', 1, 'ListMembers', 'GET', {
      query: { spaceId },
    })
  }
}
