import type { BaseContext } from '../contexts/base'
import type { Middleware } from './middleware'
import type { Filter } from '../filters/base'

const HANDLED = Symbol('argon:handled')

function runHandlers<C extends BaseContext>(
  ctx: C,
  handlers: Middleware<C>[],
  next: () => Promise<void>,
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

/** Creates a middleware that runs handlers when the event matches the given filter */
export function on<C extends BaseContext>(filter: Filter<C>, ...handlers: Middleware<C>[]): Middleware {
  return (ctx, next) => {
    if (ctx.event !== filter.event || !filter.match(ctx as C)) {
      return next()
    }

    ;(ctx as unknown as Record<symbol, boolean>)[HANDLED] = true

    return runHandlers(ctx as C, handlers, next)
  }
}

/** Creates a middleware that runs handlers only if no prior `on()` has handled the event */
export function otherwise<C extends BaseContext>(filter: Filter<C>, ...handlers: Middleware<C>[]): Middleware {
  return (ctx, next) => {
    if (ctx.event !== filter.event || !filter.match(ctx as C) || (ctx as unknown as Record<symbol, boolean>)[HANDLED]) {
      return next()
    }

    return runHandlers(ctx as C, handlers, next)
  }
}
