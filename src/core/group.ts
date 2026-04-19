import type { BaseContext } from '../contexts/base'
import type { Filter } from '../filters/base'
import type { Middleware } from './middleware'

import { MiddlewarePipeline } from './middleware'

/** Callback used inside a group to register conditional sub-handlers */
export type GroupUse<C extends BaseContext> = (predicate: (ctx: C) => boolean, ...handlers: Middleware<C>[]) => void

export function createGroup<C extends BaseContext>(filter: Filter<C>, setup: (use: GroupUse<C>) => void): Middleware {
  const pipeline = new MiddlewarePipeline<C>()

  const use: GroupUse<C> = (predicate, ...handlers) => {
    pipeline.use((ctx, next) => {
      if (!predicate(ctx)) {
        return next()
      }

      let index = 0

      const run = async (): Promise<void> => {
        if (index >= handlers.length) {
          return next()
        }

        await handlers[index++]!(ctx, run)
      }

      return run()
    })
  }

  setup(use)

  return (ctx, next) => {
    if (ctx.event !== filter.event || !filter.match(ctx as C)) {
      return next()
    }

    return pipeline.execute(ctx as C)
  }
}
