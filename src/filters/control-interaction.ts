import type { ControlInteractionContext } from '../contexts/control-interaction'
import type { Filter } from './base'

import { makeFilter } from './base'
import { EventType } from '../events/types'

/** Extended filter for control interactions with ID matching */
export interface ControlInteractionFilter extends Filter<ControlInteractionContext> {
  id(match: string | RegExp): ControlInteractionFilter
}

function withMethods(filter: Filter<ControlInteractionContext>): ControlInteractionFilter {
  return {
    ...filter,
    and(predicate) {
      return withMethods(filter.and(predicate))
    },
    id(match: string | RegExp): ControlInteractionFilter {
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

/** Default control interaction filter that matches all control interactions */
export const interaction: ControlInteractionFilter = withMethods(
  makeFilter<ControlInteractionContext>(EventType.ControlInteraction, () => true),
)
