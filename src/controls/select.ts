import type { NameToken } from '../commands'

import type { SelectOption, SelectHandler, ControlBuilder } from './base'

import { ControlType } from './base'
import { autoControlId } from './registry'

interface SelectBase {
  /** Reported back in `selectInteraction` (1–100 characters) */
  customId: string
  /** Up to 150 characters */
  placeholder?: string
  /** 0–25 */
  minValues?: number
  /** 1–25 */
  maxValues?: number
  disabled?: boolean
  /** Only members with this archetype can use the select */
  requiredArchetypeId?: string
}

/** Serializable string select menu, in its wire shape */
export interface StringSelect extends SelectBase {
  type: typeof ControlType.StringSelect
  /** 1–25 options with unique values */
  options: SelectOption[]
}

/** Serializable user select menu, in its wire shape */
export interface UserSelect extends SelectBase {
  type: typeof ControlType.UserSelect
}

/** Serializable archetype select menu, in its wire shape */
export interface ArchetypeSelect extends SelectBase {
  type: typeof ControlType.ArchetypeSelect
}

/** Serializable channel select menu, in its wire shape */
export interface ChannelSelect extends SelectBase {
  type: typeof ControlType.ChannelSelect
}

type AnySelect = StringSelect | UserSelect | ArchetypeSelect | ChannelSelect

const SELECT_TYPES = {
  stringSelect: ControlType.StringSelect,
  userSelect: ControlType.UserSelect,
  archetypeSelect: ControlType.ArchetypeSelect,
  channelSelect: ControlType.ChannelSelect,
} as const

type SelectTypeName<T extends AnySelect> = {
  [K in keyof typeof SELECT_TYPES]: (typeof SELECT_TYPES)[K] extends T['type'] ? K : never
}[keyof typeof SELECT_TYPES]

/** Fluent builder for constructing select menu controls */
export class SelectBuilder<T extends AnySelect, TDec = {}> implements ControlBuilder<T> {
  protected readonly data: T
  private handler?: SelectHandler<TDec>

  /** `type` is a {@link ControlType} value or its name, e.g. `'stringSelect'` */
  constructor(type: T['type'] | SelectTypeName<T>) {
    const value = typeof type === 'string' ? SELECT_TYPES[type] : type
    this.data = { type: value, customId: '' } as T

    if (value === ControlType.StringSelect) {
      ;(this.data as StringSelect).options = []
    }
  }

  id(value: string): this {
    ;(this.data as { customId: string }).customId = value
    return this
  }

  placeholder(value: string): this {
    ;(this.data as { placeholder?: string }).placeholder = value
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

  /**
   * Attaches an inline submit handler. Without an explicit `.id()` a unique id is generated.
   * Inline handlers live in memory; use `bot.on(select.interaction.prefix(...))` for ones that must survive restarts.
   */
  on(handler: SelectHandler<TDec>): this {
    this.handler = handler

    if (!this.data.customId) {
      ;(this.data as { customId: string }).customId = autoControlId()
    }

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

/** Sets the placeholder from the unlocalized token; the API has no placeholder localizations */
function applyPlaceholderTokens<T extends AnySelect, TDec>(builder: SelectBuilder<T, TDec>, tokens: NameToken[]): void {
  for (const token of tokens) {
    if (!token.locale) {
      builder.placeholder(token.value)
    }
  }
}

/** Creates a string select menu with predefined options */
export function stringSelect<TDec = {}>(): SelectBuilder<StringSelect, TDec>
export function stringSelect<TDec = {}>(
  first: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<StringSelect, TDec>
export function stringSelect<TDec = {}>(
  first?: NameToken | NameToken[],
  ...rest: NameToken[]
): SelectBuilder<StringSelect, TDec> {
  const builder = new SelectBuilder<StringSelect, TDec>(ControlType.StringSelect)

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
  const builder = new SelectBuilder<UserSelect, TDec>(ControlType.UserSelect)

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
  const builder = new SelectBuilder<ArchetypeSelect, TDec>(ControlType.ArchetypeSelect)

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
  const builder = new SelectBuilder<ChannelSelect, TDec>(ControlType.ChannelSelect)

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
