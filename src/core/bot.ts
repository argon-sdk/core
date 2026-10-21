import type { Transport } from '../transport/transport'
import type { BotHooks } from './hooks'
import type { Middleware } from './middleware'
import type { Filter } from '../filters/base'
import type { ContextMap } from '../contexts/registry'
import type { ContextDeps } from '../contexts/base'
import type { GroupUse } from './group'
import type { SseOptions } from '../transport/sse'
import type { BuiltCommand, CommandDefinition, CommandToken, ExtractOpts } from '../commands'
import type { CommandContext } from '../contexts/command-interaction'
import type { Snowflake } from '../types'
import type { Row, ControlBuilder } from '../controls'
import type { Plugin } from './plugin'
import type { ButtonNamespace, SelectNamespace, ModalBuilder, ModalDefinition, ModalControlDef } from '../controls'
import type { SseEvent } from '../events'
import type { ApiClientOptions } from '../api/base'
import type { BotSelf } from '../api/client'

import { ApiClient } from '../api/client'
import type { BaseContext } from '../contexts/base'
import { InteractionContext } from '../contexts/interaction'
import { ControlInteractionContext } from '../contexts/control-interaction'
import { SelectInteractionContext } from '../contexts/select-interaction'
import { MessageCreateContext } from '../contexts/message-create'
import { SseTransport } from '../transport/sse'
import { MiddlewarePipeline } from './middleware'
import { buildContext, CONTEXT_CLASSES } from '../contexts/registry'
import { createGroup } from './group'
import { EVENT_INTENTS, Intent, intentNames } from '../types/intents'
import { syncCommands } from '../commands'
import { command as _commandGlobal, CommandBuilder } from '../commands'
import {
  button as _buttonGlobal,
  stringSelect as _stringSelectGlobal,
  userSelect as _userSelectGlobal,
  archetypeSelect as _archetypeSelectGlobal,
  channelSelect as _channelSelectGlobal,
  modal as _modalGlobal,
  row as _rowGlobal,
} from '../controls'
import { ControlRegistry } from '../controls/registry'
import { on, markHandled } from './on'
import { invoke } from '../filters/command-interaction'
import { makeFilter } from '../filters/base'
import { ArgonError } from '../errors'
import { EventType } from '../events'

/** Configuration options for the Bot instance */
export interface BotOptions extends ApiClientOptions {
  /**
   * Extra intents to subscribe to. Intents needed by the events you subscribe to with `on()`,
   * `group()`, `commands()` and inline control handlers are added automatically, so this is only
   * needed for events consumed through `bot.use()` middleware.
   */
  intents?: number
  sse?: SseOptions
  hooks?: BotHooks
  /** Maximum number of events handled at the same time (default 32). `1` processes events strictly in order. */
  concurrency?: number
  /** Drop events caused by the bot itself: its own messages, typing and reactions (default `true`) */
  ignoreSelf?: boolean
  interactions?: {
    /**
     * Milliseconds after which an interaction nobody answered yet is deferred, so the user sees a loading
     * state and a later `reply()` still works (default 2500). `false` disables it.
     */
    autoDeferAfter?: number | false
  }
  controls?: {
    /** Inline `.on()` handlers kept in memory per kind before the least recently used are dropped (default 5000) */
    maxInlineHandlers?: number
  }
  /** Replaces the SSE transport (tests, custom gateways) */
  transport?: Transport
}

/** Options for registering commands, optionally scoped to a specific space */
export interface CommandsOptions {
  spaceId?: Snowflake
}

type PluginValues<P extends readonly Plugin[]> = {
  readonly [Pl in P[number] as Pl['name']]: ReturnType<Pl['build']>
}

/** Instance fields of every context (prototype members are checked separately) */
const CONTEXT_FIELDS = new Set(['api', 'eventId', 'event', 'payload', 'me', '_services'])
const DEFAULT_CONCURRENCY = 32
const DEFAULT_AUTO_DEFER_MS = 2_500
const SELF_EVENTS = new Set<string>([
  EventType.MessageCreate,
  EventType.TypingStart,
  EventType.TypingStop,
  EventType.ReactionAdd,
  EventType.ReactionRemove,
])

/**
 * Main bot class that manages transport, middleware pipeline, plugins and event handling.
 *
 * @typeParam TDec - Accumulated decorator map injected by registered plugins via `.plugin(...)`.
 * Each handler context (`message.create`, command runners, button `.on()`, etc.) is typed as
 * `CtxBase & TDec`, so plugin-provided properties like `ctx.t` appear automatically with no
 * `declare module` boilerplate.
 */
export class Bot<TDec extends Record<string, unknown> = {}> {
  readonly api: ApiClient

  private readonly services = new Map<string, unknown>()
  private readonly pipeline = new MiddlewarePipeline()
  private readonly hooks: BotHooks
  private readonly transport: Transport
  private readonly controls: ControlRegistry
  private readonly registeredCommands: Array<{ command: BuiltCommand; spaceId?: Snowflake }> = []
  private readonly concurrency: number
  private readonly ignoreSelf: boolean
  private readonly autoDeferAfter: number | false
  private readonly explicitIntents: number | undefined
  private requiredIntents = Intent.ControlInteractions
  private self: BotSelf | null = null
  private abortController: AbortController | null = null
  private running: Promise<void> | null = null

  constructor(token: string, options: BotOptions = {}) {
    this.api = new ApiClient(token, options)
    this.hooks = options.hooks ?? {}
    this.concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY)
    this.ignoreSelf = options.ignoreSelf ?? true
    this.autoDeferAfter = options.interactions?.autoDeferAfter ?? DEFAULT_AUTO_DEFER_MS
    this.explicitIntents = options.intents
    this.controls = new ControlRegistry(options.controls?.maxInlineHandlers)
    this.api.controlSink = (rows) => this.controls.register(rows)
    this.transport =
      options.transport ??
      new SseTransport(token, this.api.baseUrl, () => this.intents, options.sse, options.debug ?? false)
  }

  /** The bot's own profile; available once `start()` has connected */
  get me(): BotSelf {
    if (!this.self) {
      throw new ArgonError('bot.me is available after bot.start() has connected')
    }

    return this.self
  }

  /** Intents the event stream subscribes with: explicit ones plus those required by registered handlers */
  get intents(): number {
    return (this.explicitIntents ?? 0) | this.requiredIntents
  }

  /**
   * Registers plugins. Each plugin's value becomes available as `ctx[plugin.name]` in every handler
   * and as `bot[plugin.name]`, typed automatically.
   */
  plugin<const P extends readonly Plugin[]>(...plugins: P): Bot<TDec & PluginValues<P>> & TDec & PluginValues<P> {
    for (const p of plugins) {
      if (this.services.has(p.name)) {
        throw new ArgonError(`Plugin "${p.name}" is already registered`)
      }

      const clash = CONTEXT_FIELDS.has(p.name) || CONTEXT_CLASSES.some((cls) => p.name in cls.prototype)

      if (clash || p.name in this) {
        throw new ArgonError(`Plugin name "${p.name}" clashes with a built-in property; pick another name`)
      }

      const value = p.build()
      this.services.set(p.name, value)
      Object.defineProperty(this, p.name, { get: () => value, configurable: true, enumerable: true })
    }

    return this as unknown as Bot<TDec & PluginValues<P>> & TDec & PluginValues<P>
  }

  /**
   * Adds middleware that sees every event before later subscriptions. Middleware that does not call
   * `next()` stops the event from reaching anything registered after it.
   */
  use(...middlewares: Middleware<BaseContext & TDec>[]): this {
    for (const middleware of middlewares) {
      this.pipeline.use(middleware as Middleware)
    }

    return this
  }

  /**
   * Subscribes to events. Every matching subscription runs, in registration order. Handlers passed
   * together form a chain: each continues to the next by calling `next()`.
   */
  on<C extends BaseContext>(filter: Filter<C>, ...handlers: Middleware<C & TDec>[]): this
  on<K extends keyof ContextMap>(event: K, ...handlers: Middleware<ContextMap[K] & TDec>[]): this
  on(filterOrEvent: Filter | string, ...handlers: Middleware[]): this {
    const filter = this.toFilter(filterOrEvent)
    this.require(filter.event)
    this.pipeline.use(on(filter, ...handlers))
    return this
  }

  /** Routes matching events to the first branch whose predicate matches */
  group<C extends BaseContext>(filter: Filter<C>, setup: (use: GroupUse<C & TDec>) => void): this
  group<K extends keyof ContextMap>(event: K, setup: (use: GroupUse<ContextMap[K] & TDec>) => void): this
  group(filterOrEvent: Filter | string, setup: (use: GroupUse<any>) => void): this {
    const filter = this.toFilter(filterOrEvent)
    this.require(filter.event)
    this.pipeline.use(createGroup(filter, setup))
    return this
  }

  /** Registers slash commands; they are synced with the server on `start()` */
  commands(...args: [...BuiltCommand<TDec>[], CommandsOptions] | BuiltCommand<TDec>[]): this {
    const last = args[args.length - 1]
    const hasOptions = last !== null && typeof last === 'object' && !('name' in last)
    const options: CommandsOptions = hasOptions ? (last as CommandsOptions) : {}
    const commandList = (hasOptions ? args.slice(0, -1) : args) as BuiltCommand<TDec>[]

    this.require(EventType.CommandInteraction)

    for (const builtCommand of commandList) {
      this.registeredCommands.push({ command: builtCommand as BuiltCommand, spaceId: options.spaceId })

      this.pipeline.use(
        on(invoke.name(builtCommand.name), async (ctx: CommandContext) => {
          const opts = await ctx.resolveOptions(builtCommand.options)
          await builtCommand.handler(ctx as CommandContext & TDec, opts)
        }),
      )
    }

    return this
  }

  /**
   * Bot-bound command factory. Returns a builder/definition whose `.run()` handler
   * receives a context typed with the bot's accumulated decorators (`TDec`).
   */
  command(): CommandBuilder<{}, TDec>
  command<const Tokens extends CommandToken[]>(...tokens: Tokens): CommandDefinition<ExtractOpts<Tokens>, TDec>
  command(...tokens: any[]): any {
    if (tokens.length === 0) {
      return new CommandBuilder<{}, TDec>()
    }

    return (_commandGlobal as any)(...tokens)
  }

  /** Bot-bound button factory. Builders' `.on()` callback receives `ControlInteractionContext & TDec`. */
  get button(): ButtonNamespace<TDec> {
    return _buttonGlobal as unknown as ButtonNamespace<TDec>
  }

  /** Bot-bound select factory. Builders' `.on()` callback receives `SelectInteractionContext & TDec`. */
  get select(): SelectNamespace<TDec> {
    return {
      string: _stringSelectGlobal,
      user: _userSelectGlobal,
      archetype: _archetypeSelectGlobal,
      channel: _channelSelectGlobal,
    } as unknown as SelectNamespace<TDec>
  }

  /** Bot-bound modal factory. Modals inherit decorators implicitly through `bot.on(modal.submit, ...)`. */
  modal(): ModalBuilder
  modal(customId: string, title: string, ...controls: ModalControlDef[]): ModalDefinition
  modal(customId?: string, title?: string, ...controls: ModalControlDef[]): ModalBuilder | ModalDefinition {
    if (customId === undefined) {
      return _modalGlobal()
    }

    return _modalGlobal(customId, title!, ...controls)
  }

  /** Bot-bound row factory. Rows themselves don't carry handlers — handlers live on the controls inside. */
  row(...controls: ControlBuilder[]): Row {
    return _rowGlobal(...controls)
  }

  /**
   * Connects, syncs commands and processes events. The returned promise settles only when the bot
   * stops (`bot.stop()` or a fatal error), so code after `await bot.start()` runs after shutdown;
   * use `hooks.onStart` or `bot.on(ready, ...)` for start-up work.
   */
  start(): Promise<void> {
    if (this.running) {
      throw new ArgonError('Bot is already running')
    }

    this.running = this.run().finally(() => {
      this.running = null
    })

    return this.running
  }

  /** Stops receiving events and resolves once in-flight handlers have finished */
  async stop(): Promise<void> {
    this.abortController?.abort()
    await this.running?.catch(() => {})
  }

  /** Processes a single event as if it came from the gateway (tests, custom transports) */
  async dispatch(event: SseEvent): Promise<void> {
    const ctx = buildContext(this.deps(), event)

    for (const [name, value] of this.services) {
      Object.defineProperty(ctx, name, { value, enumerable: false })
    }

    if (this.ignoreSelf && this.isOwnEvent(ctx)) {
      return
    }

    const isInteraction = ctx instanceof InteractionContext

    if (isInteraction && this.autoDeferAfter !== false) {
      ctx.autoDeferAfter(this.autoDeferAfter)
    }

    try {
      const inline = this.inlineHandler(ctx)

      if (inline) {
        markHandled(ctx)
      }

      const completed = await this.pipeline.execute(ctx)

      // Inline handlers run last, so `bot.use()` middleware (auth, logging) wraps them too
      if (inline && completed) {
        await inline()
      }
    } catch (error) {
      await this.reportError(error, ctx)
    } finally {
      if (isInteraction) {
        await ctx.settle().catch((error) => this.reportError(error, ctx))
      }
    }
  }

  private async run(): Promise<void> {
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    this.self = await this.api.self.getMe()
    this.warnAboutIntents()

    await this.syncRegisteredCommands()
    await this.hooks.onStart?.()

    const inFlight = new Set<Promise<void>>()

    try {
      for await (const event of this.transport.start(signal)) {
        while (inFlight.size >= this.concurrency) {
          await Promise.race(inFlight)
        }

        const task: Promise<void> = this.dispatch(event).finally(() => inFlight.delete(task))
        inFlight.add(task)
      }
    } finally {
      await Promise.allSettled(inFlight)
      await this.hooks.onStop?.()
    }
  }

  private deps(): ContextDeps {
    return { api: this.api, services: this.services, me: this.self }
  }

  private inlineHandler(ctx: BaseContext): (() => Promise<void>) | null {
    if (ctx instanceof ControlInteractionContext) {
      const handler = this.controls.button(ctx.id)
      return handler ? async () => void (await handler(ctx)) : null
    }

    if (ctx instanceof SelectInteractionContext) {
      const handler = this.controls.select(ctx.id)
      return handler ? async () => void (await handler(ctx)) : null
    }

    return null
  }

  private isOwnEvent(ctx: BaseContext): boolean {
    if (!this.self || !SELF_EVENTS.has(ctx.event)) {
      return false
    }

    const actor = ctx instanceof MessageCreateContext ? ctx.userId : (ctx as { userId?: Snowflake | null }).userId
    return actor === this.self.userId
  }

  private async reportError(error: unknown, ctx: BaseContext): Promise<void> {
    const err = error instanceof Error ? error : new ArgonError(`Non-error thrown: ${String(error)}`, { cause: error })

    if (this.hooks.onError) {
      try {
        await this.hooks.onError(err, ctx)
      } catch (hookError) {
        console.error('[argon] onError hook threw:', hookError)
      }
    } else {
      console.error(`[argon] Unhandled error in ${ctx.event} handler:`, err)
    }
  }

  private async syncRegisteredCommands(): Promise<void> {
    const bySpace = new Map<string | undefined, BuiltCommand[]>()

    for (const { command: builtCommand, spaceId } of this.registeredCommands) {
      const group = bySpace.get(spaceId) ?? []
      group.push(builtCommand)
      bySpace.set(spaceId, group)
    }

    for (const [spaceId, commandGroup] of bySpace) {
      await syncCommands(this.api, commandGroup, spaceId ?? null)
    }
  }

  private toFilter(filterOrEvent: Filter | string): Filter {
    return typeof filterOrEvent === 'string' ? makeFilter(filterOrEvent as Filter['event'], () => true) : filterOrEvent
  }

  private require(event: string): void {
    this.requiredIntents |= EVENT_INTENTS[event] ?? 0
  }

  private warnAboutIntents(): void {
    if (this.explicitIntents === undefined) {
      return
    }

    const added = this.requiredIntents & ~this.explicitIntents & ~Intent.ControlInteractions

    if (added !== 0) {
      console.warn(
        `[argon] Subscribed handlers need intents you did not list; adding: ${intentNames(added).join(', ')}`,
      )
    }
  }
}
