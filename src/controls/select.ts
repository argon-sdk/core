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
export class SelectBuilder<T extends StringSelect | UserSelect | ArchetypeSelect | ChannelSelect>
  implements ControlBuilder<T>
{
  protected readonly data: T
  private handler?: SelectHandler

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

  on(handler: SelectHandler): this {
    this.handler = handler
    return this
  }

  getSelectHandler(): { id: string; handler: SelectHandler } | null {
    if (this.handler && this.data.customId) {
      return { id: this.data.customId, handler: this.handler }
    }

    return null
  }

  build(): T {
    return { ...this.data }
  }
}

class StringSelectBuilder extends SelectBuilder<StringSelect> {
  constructor() {
    super('stringSelect')
    ;(this.data as StringSelect).options = []
  }
}

function applyPlaceholderTokens<T extends StringSelect | UserSelect | ArchetypeSelect | ChannelSelect>(
  builder: SelectBuilder<T>,
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
export function stringSelect(): StringSelectBuilder
export function stringSelect(first: NameToken | NameToken[], ...rest: NameToken[]): StringSelectBuilder
export function stringSelect(first?: NameToken | NameToken[], ...rest: NameToken[]): StringSelectBuilder {
  const builder = new StringSelectBuilder()

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Creates a user select menu for picking members */
export function userSelect(): SelectBuilder<UserSelect>
export function userSelect(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<UserSelect>
export function userSelect(first?: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<UserSelect> {
  const builder = new SelectBuilder<UserSelect>('userSelect')

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Creates an archetype (role) select menu */
export function archetypeSelect(): SelectBuilder<ArchetypeSelect>
export function archetypeSelect(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<ArchetypeSelect>
export function archetypeSelect(first?: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<ArchetypeSelect> {
  const builder = new SelectBuilder<ArchetypeSelect>('archetypeSelect')

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}

/** Creates a channel select menu */
export function channelSelect(): SelectBuilder<ChannelSelect>
export function channelSelect(first: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<ChannelSelect>
export function channelSelect(first?: NameToken | NameToken[], ...rest: NameToken[]): SelectBuilder<ChannelSelect> {
  const builder = new SelectBuilder<ChannelSelect>('channelSelect')

  if (first) {
    const tokens = Array.isArray(first) ? first : [first, ...rest]
    applyPlaceholderTokens(builder, tokens)
  }

  return builder
}
