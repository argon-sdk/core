import type { BaseContext } from '../contexts/base'
import type { SseEventMap } from '../events'

/** Composable event filter that matches contexts by event type and predicate */
export interface Filter<C extends BaseContext = BaseContext> {
  event: keyof SseEventMap
  match: (ctx: C) => boolean
  and(predicate: (ctx: C) => boolean): Filter<C>
}

/** Creates a new filter bound to a specific event type with a match predicate */
export function makeFilter<C extends BaseContext>(event: keyof SseEventMap, match: (ctx: C) => boolean): Filter<C> {
  return {
    event,
    match,
    and(predicate: (ctx: C) => boolean): Filter<C> {
      return makeFilter(event, (ctx) => match(ctx) && predicate(ctx))
    },
  }
}
