import type { ApiClient } from '../api/client'
import type { SseEventMap } from '../events'
import type { Row } from '../controls'
import type { ControlHandler, SelectHandler } from '../controls'
import type { Services } from '../core/plugin'

import { CONTROL_HANDLERS, SELECT_HANDLERS } from '../controls/base'
import { ArgonError } from '../errors'

/** Callback that registers a control interaction handler by control ID */
export type RegisterControlHandler = (controlId: string, handler: ControlHandler) => void
/** Callback that registers a select interaction handler by control ID */
export type RegisterSelectHandler = (controlId: string, handler: SelectHandler) => void

/** Base context shared by all event handlers, provides API access and service resolution */
export class BaseContext {
  readonly api: ApiClient
  readonly eventId: string
  readonly event: keyof SseEventMap
  readonly registerControlHandler: RegisterControlHandler
  readonly registerSelectHandler: RegisterSelectHandler

  private readonly _services: Map<string, unknown>

  constructor(
    api: ApiClient,
    eventId: string,
    event: keyof SseEventMap,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    this.api = api
    this.eventId = eventId
    this.event = event
    this.registerControlHandler = registerControlHandler
    this.registerSelectHandler = registerSelectHandler
    this._services = services
  }

  service<K extends keyof Services>(name: K): Services[K] {
    const value = this._services.get(name as string)

    if (!value) {
      throw new ArgonError(`Service "${name as string}" not registered. Use bot.plugin() to register it.`)
    }

    return value as Services[K]
  }

  protected extractControlHandlers(controls?: Row[]): void {
    if (!controls) {
      return
    }

    for (const row of controls) {
      const handlers = row[CONTROL_HANDLERS]
      if (!handlers) {
        continue
      }

      for (const [controlId, handler] of handlers) {
        this.registerControlHandler(controlId, handler)
      }
    }
  }

  protected extractSelectHandlers(controls?: Row[]): void {
    if (!controls) {
      return
    }

    for (const row of controls) {
      const handlers = row[SELECT_HANDLERS]
      if (!handlers) {
        continue
      }

      for (const [controlId, handler] of handlers) {
        this.registerSelectHandler(controlId, handler)
      }
    }
  }
}
