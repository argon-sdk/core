import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

export class TypingApi {
  constructor(private readonly base: BaseApiClient) {}

  /** Shows a typing indicator for 8 seconds, or until `stop()` */
  start(channelId: Snowflake, kind: 'typing' | 'thinking' | 'uploading' | 'searching' = 'typing'): Promise<void> {
    return this.base.call<void>('ITyping', 1, 'Start', 'POST', { body: { channelId, kind }, idempotent: true })
  }

  stop(channelId: Snowflake): Promise<void> {
    return this.base.call<void>('ITyping', 1, 'Stop', 'POST', { body: { channelId }, idempotent: true })
  }
}
