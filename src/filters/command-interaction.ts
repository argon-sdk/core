import type { CommandContext } from '../contexts/command-interaction'
import type { Filter } from './base'

import { makeFilter } from './base'
import { EventType } from '../events/types'

interface CommandInteractionFilter extends Filter<CommandContext> {
  name(match: string | RegExp): CommandInteractionFilter
}

function withMethods(filter: Filter<CommandContext>): CommandInteractionFilter {
  return {
    ...filter,
    and(predicate) {
      return withMethods(filter.and(predicate))
    },
    name(match: string | RegExp): CommandInteractionFilter {
      return withMethods(
        filter.and((ctx) => {
          if (typeof match === 'string') {
            return ctx.commandName === match
          }

          return match.test(ctx.commandName)
        }),
      )
    },
  }
}

/** Default command interaction filter that matches all slash commands */
export const invoke: CommandInteractionFilter = withMethods(
  makeFilter<CommandContext>(EventType.CommandInteraction, () => true),
)
