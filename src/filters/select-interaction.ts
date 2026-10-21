import type { SelectInteractionContext } from '../contexts/select-interaction'
import type { Filter } from './base'

import { extendFilter, makeFilter } from './base'
import { matches, matchesPrefix } from './predicates'
import { EventType } from '../events/types'

/** Extended filter for select menu interactions with id matching */
export interface SelectInteractionFilter extends Filter<SelectInteractionContext> {
  and(predicate: (ctx: SelectInteractionContext) => boolean): SelectInteractionFilter
  /** Matches the select's custom id exactly or by pattern */
  id(match: string | RegExp): SelectInteractionFilter
  /** Matches custom ids `prefix` and `prefix:<anything>`; the remainder is available as `ctx.data` */
  prefix(prefix: string): SelectInteractionFilter
}

/** Default select interaction filter that matches all select submissions */
export const interaction: SelectInteractionFilter = extendFilter<SelectInteractionContext, SelectInteractionFilter>(
  makeFilter<SelectInteractionContext>(EventType.SelectInteraction, () => true),
  (narrow) => ({
    id: (match) => narrow((ctx) => matches(ctx.id, match)),
    prefix: (prefix) => narrow((ctx) => matchesPrefix(ctx.id, prefix)),
  }),
)
