import type { Transport } from '../transport/transport'
import type { BotHooks } from './hooks'
import type { Middleware } from './middleware'
import type { Filter } from '../filters/base'
import { BaseContext } from '../contexts/base'
import type { ContextMap } from '../contexts/registry'
import type { GroupUse } from './group'
import type { SseOptions } from '../transport/sse'
import type { BuiltCommand } from '../commands'
import type { CommandContext } from '../contexts/command-interaction'
import type { Snowflake } from '../types'
import type { ControlHandler, SelectHandler } from '../controls'
import type { SseEventMap, ControlInteractionPayload, SelectInteractionPayload } from '../events'
import type { Plugin } from './plugin'

import { ApiClient } from '../api/client'
import { SseTransport } from '../transport/sse'
import { MiddlewarePipeline } from './middleware'
import { buildContext } from '../contexts/registry'
import { createGroup } from './group'
import { Intent } from '../types'
import { syncCommands } from '../commands'
import { on } from './on'
import { invoke } from '../filters/command-interaction'
import { makeFilter } from '../filters/base'
import { ControlInteractionContext } from '../contexts/control-interaction'
import { SelectInteractionContext } from '../contexts/select-interaction'
import { EventType } from '../events'

/** Configuration options for the Bot instance */
export interface BotOptions {
  baseUrl?: string
  intents?: number
  sse?: SseOptions
  hooks?: BotHooks
  debug?: boolean
}

/** Options for registering commands, optionally scoped to a specific space */
export interface CommandsOptions {
  spaceId?: Snowflake
}

const DEFAULT_BASE_URL = 'https://api.argon.gl'

/** Main bot class that manages transport, middleware pipeline, plugins and event handling */
export class Bot {
  readonly api: ApiClient

  private readonly _services = new Map<string, unknown>()
  private readonly pipeline: MiddlewarePipeline
  private readonly hooks: BotHooks
  private readonly transport: Transport
  private readonly registeredCommands: Array<{
    command: BuiltCommand
    spaceId?: Snowflake
  }> = []

  private readonly controlHandlers = new Map<string, ControlHandler>()
  private readonly selectHandlers = new Map<string, SelectHandler>()
  private abortController: AbortController | null = null

  private readonly registerControlHandler = (controlId: string, handler: ControlHandler): void => {
    this.controlHandlers.set(controlId, handler)
  }

  private readonly registerSelectHandler = (controlId: string, handler: SelectHandler): void => {
    this.selectHandlers.set(controlId, handler)
  }

  constructor(token: string, options: BotOptions = {}) {
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
    const intents = options.intents ?? Intent.Messages
    const debug = options.debug ?? false

    this.api = new ApiClient(token, baseUrl, debug)
    this.pipeline = new MiddlewarePipeline()
    this.hooks = options.hooks ?? {}
    this.transport = new SseTransport(token, baseUrl, intents, options.sse, debug)
  }

  plugin(...plugins: Plugin[]): this {
    for (const p of plugins) {
      const value = p.build()
      this._services.set(p.name, value)

      Object.defineProperty(BaseContext.prototype, p.name, {
        get() {
          return (this as any)._services.get(p.name)
        },
        configurable: true,
      })

      Object.defineProperty(this, p.name, {
        get: () => value,
        configurable: true,
      })
    }

    return this
  }

  use(...middlewares: Middleware[]): this {
    for (const middleware of middlewares) {
      this.pipeline.use(middleware)
    }

    return this
  }

  on<C extends BaseContext>(filter: Filter<C>, ...handlers: Middleware<C>[]): this
  on<K extends keyof ContextMap>(event: K, ...handlers: Middleware<ContextMap[K]>[]): this
  on(filterOrEvent: Filter | string, ...handlers: Middleware[]): this {
    if (typeof filterOrEvent === 'string') {
      const filter = makeFilter(filterOrEvent as keyof SseEventMap, () => true)
      this.pipeline.use(on(filter, ...handlers))
    } else {
      this.pipeline.use(on(filterOrEvent, ...handlers))
    }

    return this
  }

  group<C extends BaseContext>(filter: Filter<C>, setup: (use: GroupUse<C>) => void): this
  group<K extends keyof ContextMap>(event: K, setup: (use: GroupUse<ContextMap[K]>) => void): this
  group(filterOrEvent: Filter | string, setup: (use: GroupUse<any>) => void): this {
    if (typeof filterOrEvent === 'string') {
      const filter = makeFilter(filterOrEvent as keyof SseEventMap, () => true)
      this.pipeline.use(createGroup(filter, setup))
    } else {
      this.pipeline.use(createGroup(filterOrEvent, setup))
    }

    return this
  }

  commands(...args: [...BuiltCommand[], CommandsOptions] | BuiltCommand[]): this {
    const last = args[args.length - 1]
    const hasOptions = last !== null && typeof last === 'object' && !('name' in last)
    const options: CommandsOptions = hasOptions ? (last as CommandsOptions) : {}
    const commandList = (hasOptions ? args.slice(0, -1) : args) as BuiltCommand[]

    for (const builtCommand of commandList) {
      this.registeredCommands.push({
        command: builtCommand,
        spaceId: options.spaceId,
      })

      this.pipeline.use(
        on(invoke.name(builtCommand.name), async (ctx: CommandContext) => {
          const opts: Record<string, unknown> = {}

          for (const { key, meta } of builtCommand.options) {
            if (meta.type === 'user') {
              opts[key] = await ctx.resolveOption(key, 'user')
            } else if (meta.type === 'channel') {
              opts[key] = await ctx.resolveOption(key, 'channel')
            } else if (meta.type === 'role') {
              opts[key] = await ctx.resolveOption(key, 'role')
            } else {
              opts[key] = ctx.rawOptions[key]
            }
          }

          await builtCommand.handler(ctx, opts)
        }),
      )
    }

    return this
  }

  async start(): Promise<void> {
    this.abortController = new AbortController()

    await this.api.self.getMe()

    if (this.registeredCommands.length > 0) {
      const bySpace = new Map<string | undefined, BuiltCommand[]>()

      for (const { command: builtCommand, spaceId } of this.registeredCommands) {
        const key = spaceId ?? undefined
        const group = bySpace.get(key) ?? []
        group.push(builtCommand)
        bySpace.set(key, group)
      }

      for (const [spaceId, commandGroup] of bySpace) {
        await syncCommands(this.api, commandGroup, spaceId ?? null)
      }
    }

    await this.hooks.onStart?.()

    try {
      for await (const event of this.transport.start(this.abortController.signal)) {
        try {
          if (event.type === EventType.ControlInteraction) {
            const payload = event.data as ControlInteractionPayload
            const handler = this.controlHandlers.get(payload.controlId)

            if (handler) {
              const ctx = new ControlInteractionContext(
                this.api,
                event.id ?? '',
                payload,
                this.registerControlHandler,
                this.registerSelectHandler,
                this._services,
              )
              await handler(ctx)
              continue
            }
          }

          if (event.type === EventType.SelectInteraction) {
            const payload = event.data as SelectInteractionPayload
            const handler = this.selectHandlers.get(payload.controlId)

            if (handler) {
              const ctx = new SelectInteractionContext(
                this.api,
                event.id ?? '',
                payload,
                this.registerControlHandler,
                this.registerSelectHandler,
                this._services,
              )
              await handler(ctx)
              continue
            }
          }

          const ctx = buildContext(
            this.api,
            event,
            this.registerControlHandler,
            this.registerSelectHandler,
            this._services,
          )
          await this.pipeline.execute(ctx)
        } catch (error) {
          if (error instanceof Error) {
            await this.hooks.onError?.(error)
          }
        }
      }
    } finally {
      await this.hooks.onStop?.()
    }
  }

  async stop(): Promise<void> {
    this.abortController?.abort()
  }
}
