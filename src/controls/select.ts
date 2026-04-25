import type { NameToken } from '../commands'

import type { SelectOption, SelectHandler, ControlBuilder } from './base'

/** Serializable string select menu definition */
export interface StringSelect {
  type: 'stringSelect'
  customId: string
  options: SelectOption[]
  placeholder?: string
  placeholderLocalizations?: Record<string, string>
  minValues?: number
  maxValues?: number
  disabled?: boolean
  requiredArchetypeId?: string
}

/** Serializable user select menu definition */
export interface UserSelect {
  type: 'userSelect'
  customId: string
  placeholder?: string
  placeholderLocalizations?: Record<string, string>
  minValues?: number
  maxValues?: number
  disabled?: boolean
  requiredArchetypeId?: string
}

/** Serializable archetype select menu definition */
export interface ArchetypeSelect {
  type: 'archetypeSelect'
  customId: string
  placeholder?: string
  placeholderLocalizations?: Record<string, string>
  minValues?: number
  maxValues?: number
  disabled?: boolean
  requiredArchetypeId?: string
}

/** Serializable channel select menu definition */
export interface ChannelSelect {
  type: 'channelSelect'
  customId: string
  placeholder?: string
  placeholderLocalizations?: Record<string, string>
  minValues?: number
  maxValues?: number
  disabled?: boolean
  requiredArchetypeId?: string
}

/** Fluent builder for constructing select menu controls */
export class SelectBuilder<T extends StringSelect | UserSelect | ArchetypeSelect | ChannelSelect, TDec = {}>
  implements ControlBuilder<T>
{
  protected readonly data: T
  private handler?: SelectHandler<TDec>

  constructor(type: T['type']) {
    this.data = { type, customId: '' } as T
  }

  id(value: string): this {
    ;(this.data as { customId: string }).customId = value
    return this
  }

  placeholder(value: string): this {
    ;(this.data as { placeholder?: string }).placeholder = value
    return this
  }

  placeholderLocalizations(value: Record<string, string>): this {
    ;(this.data as { placeholderLocalizations?: Record<string, string> }).placeholderLocalizations = value
    return this
  }

  minValues(value: number): this {
    ;(this.data as { minValues?: number }).minValues = value
    return this
  }

  maxValues(value: number): this {
    ;(this.data as { maxValues?: number }).maxValues = value
    return this
  }

  disabled(value = true): this {
    ;(this.data as { disabled?: boolean }).disabled = value
    return this
  }

  options(value: SelectOption[]): this {
    ;(this.data as { options?: SelectOption[] }).options = value
    return this
  }

  requiredArchetype(id: string): this {
    ;(this.data as { requiredArchetypeId?: string }).requiredArchetypeId = id
    return this
  }

  on(handler: SelectHandler<TDec>): this {
    this.handler = handler
    return this
  }

  getSelectHandler(): { id: string; handler: SelectHandler } | null {
    if (this.handler && this.data.customId) {
      return { id: this.data.customId, handler: this.handler as unknown as SelectHandler }
    }

    return null
  }

  build(): T {
    return { ...this.data }
  }
}

class StringSelectBuilder<TDec = {}> extends SelectBuilder<StringSelect, TDec> {
  constructor() {
    super('stringSelect')
    ;(this.data as StringSelect).options = []
  }
}

function applyPlaceholderTokens<T extends StringSelect | UserSelect | ArchetypeSelect | ChannelSelect, TDec>(
  builder: SelectBuilder<T, TDec>,
  tokens: NameToken[],
): void {
  const localizations: Record<string, string> = {}

  for (const token of tokens) {
    if (!token.locale) {
      builder.placeholder(token.value)
    } else {
      localizations[token.locale] = token.value
    }
  }

  if (Object.keys(localizations).length > 0) {
    builder.placeholderLocalizations(localizations)
  }
}

/** Creates a string select menu with predefined options */
export function stringSelect<TDec = {}>(): StringSelectBuilder<TDec>
export function stringSelect<TDec = {}>(first: NameToken | NameToken[], ...rest: NameToken[]): StringSelectBuilder<TDec>
export function stringSelect<TDec = {}>(
  first?: NameToken | NameToken[],
  ...rest: NameToken[]
): StringSelectBuilder<TDec> {
  const builder = new StringSelectBuilder<TDec>()

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Creates a user select menu for picking members */
export function userSelect<TDec = {}>(): SelectBuilder<UserSelect, TDec>
export function userSelect<TDec = {}>(
  first: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<UserSelect, TDec>
export function userSelect<TDec = {}>(
  first?: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<UserSelect, TDec> {
  const builder = new SelectBuilder<UserSelect, TDec>('userSelect')

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Creates an archetype (role) select menu */
export function archetypeSelect<TDec = {}>(): SelectBuilder<ArchetypeSelect, TDec>
export function archetypeSelect<TDec = {}>(
  first: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<ArchetypeSelect, TDec>
export function archetypeSelect<TDec = {}>(
  first?: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<ArchetypeSelect, TDec> {
  const builder = new SelectBuilder<ArchetypeSelect, TDec>('archetypeSelect')

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Creates a channel select menu */
export function channelSelect<TDec = {}>(): SelectBuilder<ChannelSelect, TDec>
export function channelSelect<TDec = {}>(
  first: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<ChannelSelect, TDec>
export function channelSelect<TDec = {}>(
  first?: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<ChannelSelect, TDec> {
  const builder = new SelectBuilder<ChannelSelect, TDec>('channelSelect')

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Namespace providing typed select factory methods */
export interface SelectNamespace<TDec = {}> {
  string(): SelectBuilder<StringSelect, TDec>
  string(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<StringSelect, TDec>
  user(): SelectBuilder<UserSelect, TDec>
  user(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<UserSelect, TDec>
  archetype(): SelectBuilder<ArchetypeSelect, TDec>
  archetype(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<ArchetypeSelect, TDec>
  channel(): SelectBuilder<ChannelSelect, TDec>
  channel(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<ChannelSelect, TDec>
}
