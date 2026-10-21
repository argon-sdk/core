import type { ControlInteractionContext } from '../contexts/control-interaction'
import type { Filter } from './base'

import { extendFilter, makeFilter } from './base'
import { matches, matchesPrefix } from './predicates'
import { EventType } from '../events/types'

/** Extended filter for button interactions with id matching */
export interface ControlInteractionFilter extends Filter<ControlInteractionContext> {
  and(predicate: (ctx: ControlInteractionContext) => boolean): ControlInteractionFilter
  /** Matches the button's custom id exactly or by pattern */
  id(match: string | RegExp): ControlInteractionFilter
  /** Matches custom ids `prefix` and `prefix:<anything>`; the remainder is available as `ctx.data` */
  prefix(prefix: string): ControlInteractionFilter
}

/** Default control interaction filter that matches all button clicks */
export const interaction: ControlInteractionFilter = extendFilter<ControlInteractionContext, ControlInteractionFilter>(
  makeFilter<ControlInteractionContext>(EventType.ControlInteraction, () => true),
  (narrow) => ({
    id: (match) => narrow((ctx) => matches(ctx.id, match)),
    prefix: (prefix) => narrow((ctx) => matchesPrefix(ctx.id, prefix)),
  }),
)
