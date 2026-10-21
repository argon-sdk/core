import type { CommandContext } from '../contexts/command-interaction'
import type { Filter } from './base'

import { extendFilter, makeFilter } from './base'
import { matches } from './predicates'
import { EventType } from '../events/types'

/** Extended filter for slash command interactions with name matching */
export interface CommandInteractionFilter extends Filter<CommandContext> {
  and(predicate: (ctx: CommandContext) => boolean): CommandInteractionFilter
  /** Matches the command name exactly or by pattern */
  name(match: string | RegExp): CommandInteractionFilter
}

/** Default command interaction filter that matches all slash commands */
export const invoke: CommandInteractionFilter = extendFilter<CommandContext, CommandInteractionFilter>(
  makeFilter<CommandContext>(EventType.CommandInteraction, () => true),
  (narrow) => ({
    name: (match) => narrow((ctx) => matches(ctx.commandName, match)),
  }),
)
