import type { CommandContext } from '../contexts/command-interaction'
import type { CommandToken, NameToken, OptionToken } from './tokens'
import { CommandBuilder } from './command-builder'
import type { OptionMeta } from './option'

/** Resolved command option with localization data */
export interface BuiltCommandOption {
  key: string
  meta: OptionMeta
  nameLocalizations: Record<string, string>
  descriptionLocalizations: Record<string, string>
  choiceLocalizations: Record<string, { name?: string; nameLocalizations: Record<string, string> }>
}

/** Fully resolved command definition ready for registration */
export interface BuiltCommand<TDec = {}> {
  name: string
  nameLocalizations: Record<string, string>
  description: string
  descriptionLocalizations: Record<string, string>
  options: BuiltCommandOption[]
  handler: (ctx: CommandContext & TDec, opts: Record<string, unknown>) => Promise<void>
}

/** Extracts the option key/value record from a tuple of command tokens */
export type ExtractOpts<Tokens extends CommandToken[]> = Tokens extends [
  infer Head,
  ...infer Tail extends CommandToken[],
]
  ? Head extends OptionToken<infer K, infer V>
    ? Record<K, V> & ExtractOpts<Tail>
    : ExtractOpts<Tail>
  : {}

type Prettify<T> = { [K in keyof T]: T[K] } & {}

/** Intermediate command definition awaiting a run handler */
export interface CommandDefinition<Opts, TDec = {}> {
  run(handler: (ctx: CommandContext & TDec, opts: Prettify<Opts>) => Promise<void>): BuiltCommand<TDec>
}

/** Creates a command from tokens or returns a CommandBuilder when called without arguments */
export function command<TDec = {}>(): CommandBuilder<{}, TDec>
export function command<TDec = {}, const Tokens extends CommandToken[] = []>(
  ...tokens: Tokens
): CommandDefinition<ExtractOpts<Tokens>, TDec>
export function command(...tokens: any[]) {
  if (tokens.length === 0) {
    return new CommandBuilder()
  }

  let commandName = ''
  const nameLocalizations: Record<string, string> = {}
  let description = ''
  const descriptionLocalizations: Record<string, string> = {}
  const options: BuiltCommandOption[] = []

  for (const token of tokens) {
    if (token.tag === 'name') {
      if ((token as NameToken).locale) {
        nameLocalizations[(token as NameToken).locale!] = token.value
      } else {
        commandName = token.value
      }
    } else if (token.tag === 'describe') {
      if (token.locale) {
        descriptionLocalizations[token.locale] = token.value
      } else {
        description = token.value
      }
    } else if (token.tag === 'option') {
      const optToken = token as OptionToken
      options.push({
        key: optToken.key,
        meta: {
          ...optToken.def.meta,
          description: optToken.description ?? optToken.def.meta.description,
        },
        nameLocalizations: optToken.nameLocalizations,
        descriptionLocalizations: optToken.descriptionLocalizations,
        choiceLocalizations: {},
      })
    }
  }

  if (!commandName) {
    throw new Error('command() requires at least one name() token without locale')
  }

  return {
    run(handler: (ctx: CommandContext, opts: Prettify<ExtractOpts<any[]>>) => Promise<void>) {
      return {
        name: commandName,
        nameLocalizations,
        description,
        descriptionLocalizations,
        options,
        handler: handler as (ctx: CommandContext, opts: Record<string, unknown>) => Promise<void>,
      }
    },
  }
}
