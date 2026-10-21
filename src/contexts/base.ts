import type { ApiClient, BotSelf } from '../api/client'
import type { SseEventMap } from '../events'
import type { Services } from '../core/plugin'

import { ArgonError } from '../errors'

/** Everything a context needs from the bot that created it */
export interface ContextDeps {
  api: ApiClient
  /** Plugin values by name */
  services: ReadonlyMap<string, unknown>
  /** The bot's own profile, known once `bot.start()` has called `GetMe` */
  me: BotSelf | null
}

/** Base context shared by all event handlers: the raw payload, API access and plugin services */
export class BaseContext<P = unknown> {
  readonly api: ApiClient
  readonly eventId: string
  readonly event: keyof SseEventMap
  /** The event's payload exactly as received */
  readonly payload: P
  /** The bot's own profile (`null` only if the context was built outside `bot.start()`) */
  readonly me: BotSelf | null

  private readonly _services: ReadonlyMap<string, unknown>

  constructor(deps: ContextDeps, eventId: string, event: keyof SseEventMap, payload: P) {
    this.api = deps.api
    this.eventId = eventId
    this.event = event
    this.payload = payload
    this.me = deps.me
    this._services = deps.services
  }

  /**
   * Looks up a plugin value by name.
   *
   * @deprecated Plugin values are available directly on the context (`ctx.myService`), typed via `Bot<TDec>`.
   */
  service<K extends keyof Services>(name: K): Services[K] {
    const value = this._services.get(name as string)

    if (value === undefined) {
      throw new ArgonError(`Service "${name as string}" not registered. Use bot.plugin() to register it.`)
    }

    return value as Services[K]
  }
}
