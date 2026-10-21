import type { ModalSubmitContext } from '../contexts/modal-submit'
import type { Filter } from './base'

import { extendFilter, makeFilter } from './base'
import { matches, matchesPrefix } from './predicates'
import { EventType } from '../events/types'

/** Extended filter for modal submissions with modal id matching */
export interface ModalSubmitFilter extends Filter<ModalSubmitContext> {
  and(predicate: (ctx: ModalSubmitContext) => boolean): ModalSubmitFilter
  /** Matches the modal's custom id (the first argument of `modal(id, title)`) exactly or by pattern */
  id(match: string | RegExp): ModalSubmitFilter
  /** Matches modal ids `prefix` and `prefix:<anything>`; the remainder is available as `ctx.data` */
  prefix(prefix: string): ModalSubmitFilter
}

/** Default modal submit filter that matches all modal submissions */
export const submit: ModalSubmitFilter = extendFilter<ModalSubmitContext, ModalSubmitFilter>(
  makeFilter<ModalSubmitContext>(EventType.ModalSubmit, () => true),
  (narrow) => ({
    id: (match) => narrow((ctx) => matches(ctx.id, match)),
    prefix: (prefix) => narrow((ctx) => matchesPrefix(ctx.id, prefix)),
  }),
)
