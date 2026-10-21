import type { BaseContext } from '../contexts/base'

/** Callback to pass control to the next middleware in the pipeline */
export type NextFunction = () => Promise<void>

/**
 * A function that processes a context and optionally delegates to the next handler. Its return value is
 * awaited and ignored, so one-line handlers like `(ctx) => ctx.reply('hi')` work.
 */
export type Middleware<C extends BaseContext = BaseContext> = (ctx: C, next: NextFunction) => unknown

/** Sequential middleware execution pipeline with next() chaining */
export class MiddlewarePipeline<C extends BaseContext = BaseContext> {
  private readonly middlewares: Middleware<C>[] = []

  use(middleware: Middleware<C>): void {
    this.middlewares.push(middleware)
  }

  /** Runs the middleware chain; resolves `true` if the last middleware called `next()` (nothing stopped the event) */
  async execute(ctx: C): Promise<boolean> {
    let index = -1
    let completed = false

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }

      index = i

      const middleware = this.middlewares[i]

      if (middleware === undefined) {
        completed = true
        return
      }

      await middleware(ctx, () => dispatch(i + 1))
    }

    await dispatch(0)
    return completed
  }
}
