import type { ApiClient } from '../api/client'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'

/** Context for the session resumed event after reconnection */
export class ResumedContext extends BaseContext {
  constructor(
    api: ApiClient,
    eventId: string,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.Resumed, registerControlHandler, registerSelectHandler, services)
  }
}
