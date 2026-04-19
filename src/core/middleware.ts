import type { BaseContext } from '../contexts/base'

/** Callback to pass control to the next middleware in the pipeline */
export type NextFunction = () => Promise<void>

/** A function that processes a context and optionally delegates to the next handler */
export type Middleware<C extends BaseContext = BaseContext> = (ctx: C, next: NextFunction) => void | Promise<void>

/** Sequential middleware execution pipeline with next() chaining */
export class MiddlewarePipeline<C extends BaseContext = BaseContext> {
  private readonly middlewares: Middleware<C>[] = []

  use(middleware: Middleware<C>): void {
    this.middlewares.push(middleware)
  }

  async execute(ctx: C): Promise<void> {
    let index = -1

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }

      index = i

      const middleware = this.middlewares[i]

      if (middleware === undefined) {
        return
      }

      await middleware(ctx, () => dispatch(i + 1))
    }

    await dispatch(0)
  }
}
