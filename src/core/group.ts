import type { BaseContext } from '../contexts/base'
import type { Filter } from '../filters/base'
import type { Middleware } from './middleware'

import { MiddlewarePipeline } from './middleware'
import { runHandlers } from './on'

/** Callback used inside a group to register conditional sub-handlers */
export type GroupUse<C extends BaseContext> = (predicate: (ctx: C) => boolean, ...handlers: Middleware<C>[]) => void

/**
 * Creates a router for events matching `filter`: the first branch whose predicate matches handles the
 * event, and falls through to the next branch only if its last handler calls `next()`.
 * Like `on()`, the group itself never blocks later subscriptions.
 */
export function createGroup<C extends BaseContext>(filter: Filter<C>, setup: (use: GroupUse<C>) => void): Middleware {
  const pipeline = new MiddlewarePipeline<C>()

  const use: GroupUse<C> = (predicate, ...handlers) => {
    pipeline.use((ctx, next) => {
      if (!predicate(ctx)) {
        return next()
      }

      return runHandlers(ctx, handlers, next)
    })
  }

  setup(use)

  return async (ctx, next) => {
    if (ctx.event === filter.event && filter.match(ctx as C)) {
      await pipeline.execute(ctx as C)
    }

    await next()
  }
}
