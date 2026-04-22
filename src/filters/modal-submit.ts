import type { ModalSubmitContext } from '../contexts/modal-submit'
import type { Filter } from './base'

import { makeFilter } from './base'
import { EventType } from '../events/types'

/** Extended filter for modal submissions with modal ID matching */
export interface ModalSubmitFilter extends Filter<ModalSubmitContext> {
  modalId(match: string | RegExp): ModalSubmitFilter
}

function withMethods(filter: Filter<ModalSubmitContext>): ModalSubmitFilter {
  return {
    ...filter,
    and(predicate) {
      return withMethods(filter.and(predicate))
    },
    modalId(match: string | RegExp): ModalSubmitFilter {
      return withMethods(
        filter.and((ctx) => {
          if (typeof match === 'string') {
            return ctx.modalInteractionId === match
          }

          return match.test(ctx.modalInteractionId)
        }),
      )
    },
  }
}

/** Default modal submit filter that matches all modal submissions */
export const submit: ModalSubmitFilter = withMethods(makeFilter<ModalSubmitContext>(EventType.ModalSubmit, () => true))
