import type { BaseContext } from '../contexts/base'
import type { SseEventMap } from '../events'

/** Composable event filter that matches contexts by event type and predicate */
export interface Filter<C extends BaseContext = BaseContext> {
  event: keyof SseEventMap
  match: (ctx: C) => boolean
  /** Narrows the filter with an extra predicate */
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

/**
 * Builds a filter type with extra chainable methods. `methods` receives a `narrow` helper that applies a
 * predicate and returns the same extended filter type, so every method stays chainable.
 */
export function extendFilter<C extends BaseContext, F extends Filter<C>>(
  filter: Filter<C>,
  methods: (narrow: (predicate: (ctx: C) => boolean) => F) => Omit<F, keyof Filter<C>>,
): F {
  const narrow = (predicate: (ctx: C) => boolean): F => extendFilter(filter.and(predicate), methods)

  return {
    ...filter,
    and: narrow,
    ...methods(narrow),
  } as unknown as F
}
