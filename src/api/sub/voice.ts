import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** Voice streaming token returned for audio ingress sessions */
export interface VoiceStreamToken {
  ingressUrl: string
  roomName: string
  token: string
}

export class VoiceApi {
  constructor(private readonly base: BaseApiClient) {}

  streamToken(spaceId: Snowflake, channelId: Snowflake): Promise<VoiceStreamToken> {
    return this.base.call<VoiceStreamToken>('IVoice', 1, 'StreamToken', 'POST', {
      body: { spaceId, channelId },
    })
  }
}
