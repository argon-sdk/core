import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** Per-user track subscription returned for audio egress */
export interface VoiceTrackSubscription {
  roomName: string
  token: string
  trackId: string
  wsUrl: string
}

export interface DeletedResponse {
  deleted: boolean
}

export class VoiceEgressApi {
  constructor(private readonly base: BaseApiClient) {}

  subscribeTrack(spaceId: Snowflake, channelId: Snowflake, userId: Snowflake): Promise<VoiceTrackSubscription> {
    return this.base.call<VoiceTrackSubscription>('IVoiceEgress', 20260401, 'SubscribeTrack', 'POST', {
      body: { spaceId, channelId, userId },
    })
  }

  unsubscribeTrack(trackId: string): Promise<DeletedResponse> {
    return this.base.call<DeletedResponse>('IVoiceEgress', 20260401, 'UnsubscribeTrack', 'DELETE', {
      body: { trackId },
    })
  }
}
