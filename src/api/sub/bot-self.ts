import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** The authenticated bot's own profile information */
export interface BotSelf {
  /** The bot application id */
  botId: Snowflake
  /** The bot's user id, as seen in messages and events */
  userId: Snowflake
  username: string
  displayName: string
}

/** Basic information about a space the bot belongs to */
export interface BotSpaceBase {
  spaceId: Snowflake
  name: string
  description: string | null
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
