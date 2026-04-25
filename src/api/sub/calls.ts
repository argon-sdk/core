import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** Token bundle returned when accepting a call — caller plus LiveKit room handle */
export interface CallAcceptance {
  audioBaseUrl: string
  callerId: Snowflake
  roomName: string
  token: string
}

/** Single ringing-call entry returned by `CallsApi.ringing` */
export interface RingingCall {
  callId: Snowflake
  callerId: Snowflake
}

export interface RingingCallsResponse {
  calls: RingingCall[]
}

export interface RejectCallResponse {
  rejected: boolean
}

export class CallsApi {
  constructor(private readonly base: BaseApiClient) {}

  accept(callId: Snowflake): Promise<CallAcceptance> {
    return this.base.call<CallAcceptance>('ICalls', 20260401, 'Accept', 'POST', {
      body: { callId },
    })
  }

  reject(callId: Snowflake, reason: string): Promise<RejectCallResponse> {
    return this.base.call<RejectCallResponse>('ICalls', 20260401, 'Reject', 'POST', {
      body: { callId, reason },
    })
  }

  ringing(): Promise<RingingCallsResponse> {
    return this.base.call<RingingCallsResponse>('ICalls', 20260401, 'Ringing', 'GET')
  }
}
