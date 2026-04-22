import type { MessageCreateContext } from '../contexts/message-create'
import type { Filter } from './base'

import { makeFilter } from './base'
import { EventType } from '../events/types'
import { text as textPredicate } from './predicates'

/** Extended filter for message creation events with text matching */
export interface MessageCreateFilter extends Filter<MessageCreateContext> {
  text(match?: string | RegExp): MessageCreateFilter
}

function withMethods(filter: Filter<MessageCreateContext>): MessageCreateFilter {
  return {
    ...filter,
    and(predicate) {
      return withMethods(filter.and(predicate))
    },
    text(match?: string | RegExp): MessageCreateFilter {
      return withMethods(filter.and(textPredicate(match)))
    },
  }
}

/** Default message creation filter that matches all messages */
export const create: MessageCreateFilter = withMethods(
  makeFilter<MessageCreateContext>(EventType.MessageCreate, () => true),
)
