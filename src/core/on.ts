import type { BaseContext } from '../contexts/base'
import type { Middleware } from './middleware'
import type { Filter } from '../filters/base'

const HANDLED = Symbol('argon:handled')

const done = async (): Promise<void> => {}

/** Runs `handlers` as a chain: each one continues to the next by calling `next()` */
export function runHandlers<C extends BaseContext>(
  ctx: C,
  handlers: Middleware<C>[],
  next: () => Promise<void> = done,
): Promise<void> {
  let index = 0

  const run = async (): Promise<void> => {
    if (index >= handlers.length) {
      return next()
    }

    await handlers[index++]!(ctx, run)
  }

  return run()
}

/** Marks the event as handled so `otherwise()` subscriptions skip it */
export function markHandled(ctx: BaseContext): void {
  ;(ctx as unknown as Record<symbol, boolean>)[HANDLED] = true
}

/** True when an earlier `on()` subscription already matched this event */
export function isHandled(ctx: BaseContext): boolean {
  return (ctx as unknown as Record<symbol, boolean>)[HANDLED] === true
}

/**
 * Creates a subscription for events matching `filter`.
 *
 * Subscriptions fan out: every matching `on()` runs, in registration order, whether or not an earlier
 * one called `next()`. Inside one subscription the handlers form a chain, so a guard can stop the
 * handlers after it by not calling `next()`:
 *
 * ```ts
 * bot.on(message.create, onlyAdmins, handleAdminMessage) // onlyAdmins decides whether handleAdminMessage runs
 * bot.on(message.create, logMessage)                     // runs for every message regardless
 * ```
 *
 * To stop all later subscriptions, use a `bot.use()` middleware that does not call `next()`.
 */
export function on<C extends BaseContext>(filter: Filter<C>, ...handlers: Middleware<C>[]): Middleware {
  return async (ctx, next) => {
    if (ctx.event === filter.event && filter.match(ctx as C)) {
      markHandled(ctx)
      await runHandlers(ctx as C, handlers)
    }

    await next()
  }
}

/** Creates a subscription that runs only if no earlier `on()` matched the event */
export function otherwise<C extends BaseContext>(filter: Filter<C>, ...handlers: Middleware<C>[]): Middleware {
  return async (ctx, next) => {
    if (ctx.event === filter.event && filter.match(ctx as C) && !isHandled(ctx)) {
      await runHandlers(ctx as C, handlers)
    }

    await next()
  }
}
