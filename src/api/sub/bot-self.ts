import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** The authenticated bot's own profile information */
export interface BotSelf {
  botId: Snowflake
  userId: Snowflake
  username: string
  displayName: string
  email?: string
}

/** Basic information about a space the bot belongs to */
export interface BotSpaceBase {
  spaceId: Snowflake
  name: string
  description: string
}

export class BotSelfApi {
  constructor(private readonly base: BaseApiClient) {}

  getMe(): Promise<BotSelf> {
    return this.base.call<BotSelf>('IBotSelf', 1, 'GetMe', 'GET')
  }

  getSpaces(): Promise<{ spaces: BotSpaceBase[] }> {
    return this.base.call<{ spaces: BotSpaceBase[] }>('IBotSelf', 1, 'GetSpaces', 'GET')
  }
}
