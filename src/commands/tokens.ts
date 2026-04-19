import type { OptionDef } from './option'

/** Token carrying a localized or default name value */
export interface NameToken<V extends string = string> {
  tag: 'name'
  value: V
  locale?: string
}

/** Token carrying a localized or default description value */
export interface DescribeToken {
  tag: 'describe'
  value: string
  locale?: string
}

/** Token carrying a command option definition with localizations */
export interface OptionToken<K extends string = string, V = unknown> {
  tag: 'option'
  key: K
  def: OptionDef<V>
  nameLocalizations: Record<string, string>
  descriptionLocalizations: Record<string, string>
  description?: string
}

type OptionInnerToken = NameToken | DescribeToken

type ExtractOptionName<T extends readonly unknown[]> = T extends readonly [
  NameToken<infer K> & { locale?: undefined },
  ...unknown[],
]
  ? K
  : T extends readonly [unknown, ...infer Rest]
    ? ExtractOptionName<Rest>
    : never

/** Union of all token types accepted by the command() function */
export type CommandToken = NameToken | DescribeToken | OptionToken

/** Creates a name token, optionally localized */
export function name<const V extends string>(value: V): NameToken<V> & { locale?: undefined }
export function name<const V extends string>(value: V, locale: string): NameToken<V> & { locale: string }
export function name<const V extends string>(value: V, locale?: string): NameToken<V> {
  return { tag: 'name', value, locale }
}

/** Creates a description token, optionally localized */
export function describe(value: string, locale?: string): DescribeToken {
  return { tag: 'describe', value, locale }
}

/** Creates an option token from a type definition and name/describe tokens */
export function option<V, const Tokens extends OptionInnerToken[]>(
  def: OptionDef<V>,
  ...tokens: Tokens
): OptionToken<ExtractOptionName<Tokens>, V> {
  let key = '' as ExtractOptionName<Tokens>
  const nameLocalizations: Record<string, string> = {}
  const descriptionLocalizations: Record<string, string> = {}
  let description: string | undefined

  for (const token of tokens) {
    if (token.tag === 'name') {
      if (!token.locale) {
        key = token.value as ExtractOptionName<Tokens>
      } else {
        nameLocalizations[token.locale] = token.value
      }
    } else if (token.tag === 'describe') {
      if (!token.locale) {
        description = token.value
      } else {
        descriptionLocalizations[token.locale] = token.value
      }
    }
  }

  return {
    tag: 'option',
    key,
    def,
    nameLocalizations,
    descriptionLocalizations,
    description,
  }
}
