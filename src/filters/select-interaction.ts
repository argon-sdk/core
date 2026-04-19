import type { SelectInteractionContext } from '../contexts/select-interaction'
import type { Filter } from './base'

import { makeFilter } from './base'
import { EventType } from '../events'

/** Extended filter for select menu interactions with ID matching */
export interface SelectInteractionFilter extends Filter<SelectInteractionContext> {
  id(match: string | RegExp): SelectInteractionFilter
}

function withMethods(filter: Filter<SelectInteractionContext>): SelectInteractionFilter {
  return {
    ...filter,
    and(predicate) {
      return withMethods(filter.and(predicate))
    },
    id(match: string | RegExp): SelectInteractionFilter {
      return withMethods(
        filter.and((ctx) => {
          if (typeof match === 'string') {
            return ctx.id === match
          }

          return match.test(ctx.id)
        }),
      )
    },
  }
}

/** Default select interaction filter that matches all select interactions */
export const interaction: SelectInteractionFilter = withMethods(
  makeFilter<SelectInteractionContext>(EventType.SelectInteraction, () => true),
)
