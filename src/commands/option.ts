import type { BotMember } from '../api/client'
import type { Archetype } from '../types'
import type { Channel } from '../types'

type OptionType = 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'number'

/** Metadata describing a command option's type and constraints */
export interface OptionMeta {
  type: OptionType
  description: string
  required: boolean
  choices?: Record<string, unknown>
}

/** Type-safe option definition with optional/choices modifiers */
export class OptionDef<V> {
  readonly meta: OptionMeta

  constructor(type: OptionType, description: string) {
    this.meta = { type, description, required: true }
  }

  optional(): OptionDef<V | undefined> {
    const copy = new OptionDef<V | undefined>(this.meta.type, this.meta.description)
    copy.meta.required = false
    copy.meta.choices = this.meta.choices
    return copy
  }

  choices<const C extends Record<string, V>>(c: C): OptionDef<C[keyof C]> {
    const copy = new OptionDef<C[keyof C]>(this.meta.type, this.meta.description)
    copy.meta.required = this.meta.required
    copy.meta.choices = c
    return copy
  }
}

/** Creates a string option definition */
export function string(description = ''): OptionDef<string> {
  return new OptionDef<string>('string', description)
}

/** Creates an integer option definition */
export function integer(description = ''): OptionDef<number> {
  return new OptionDef<number>('integer', description)
}

/** Creates a floating-point number option definition */
export function number(description = ''): OptionDef<number> {
  return new OptionDef<number>('number', description)
}

/** Creates a boolean option definition */
export function boolean(description = ''): OptionDef<boolean> {
  return new OptionDef<boolean>('boolean', description)
}

/** Creates a user option definition that resolves to a BotMember */
export function user(description = ''): OptionDef<BotMember> {
  return new OptionDef<BotMember>('user', description)
}

/** Creates a channel option definition */
export function channel(description = ''): OptionDef<Channel> {
  return new OptionDef<Channel>('channel', description)
}

/** Creates a role (archetype) option definition */
export function role(description = ''): OptionDef<Archetype> {
  return new OptionDef<Archetype>('role', description)
}
