import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

export class TypingApi {
  constructor(private readonly base: BaseApiClient) {}

  start(channelId: Snowflake, kind: 'typing' | 'thinking' | 'uploading' | 'searching' = 'typing'): Promise<void> {
    return this.base.call<void>('ITyping', 1, 'Start', 'POST', {
      body: { channelId, kind },
    })
  }

  stop(channelId: Snowflake): Promise<void> {
    return this.base.call<void>('ITyping', 1, 'Stop', 'POST', {
      body: { channelId },
    })
  }
}
