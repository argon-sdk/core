import type { CommandContext } from '../contexts/command-interaction'
import type { BuiltCommand, BuiltCommandOption } from './builder'
import type { BotMember } from '../api/client'
import type { OptionMeta } from './option'
import type { Archetype } from '../types'
import type { Channel } from '../types'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type ExtractOptionType<T> = T extends OptionBuilder<infer K, infer V> ? Record<K, V> : {}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

type ExtractOptionsFromArray<T extends readonly any[]> = UnionToIntersection<
  { [I in keyof T]: ExtractOptionType<T[I]> }[number]
>

class OptionBuilder<K extends string = string, V = unknown> {
  private _name = '' as K
  private _description = ''
  private readonly _nameLocalizations: Record<string, string> = {}
  private readonly _descriptionLocalizations: Record<string, string> = {}
  private readonly _meta: OptionMeta

  constructor(type: OptionMeta['type']) {
    this._meta = { type, description: '', required: true }
  }

  setName<const N extends string>(name: N): OptionBuilder<N, V> {
    ;(this as any)._name = name
    return this as any
  }

  setDescription(description: string): this {
    this._description = description
    this._meta.description = description
    return this
  }

  setNameLocalization(value: string, locale: string): this {
    this._nameLocalizations[locale] = value
    return this
  }

  setDescriptionLocalization(value: string, locale: string): this {
    this._descriptionLocalizations[locale] = value
    return this
  }

  optional(): OptionBuilder<K, V | undefined> {
    this._meta.required = false
    return this as any
  }

  choices<const C extends Record<string, V>>(c: C): OptionBuilder<K, C[keyof C]> {
    this._meta.choices = c
    return this as any
  }

  _build(): BuiltCommandOption {
    return {
      key: this._name,
      meta: { ...this._meta, description: this._description || this._meta.description },
      nameLocalizations: { ...this._nameLocalizations },
      descriptionLocalizations: { ...this._descriptionLocalizations },
      choiceLocalizations: {},
    }
  }
}

class OptionAdder {
  string(): OptionBuilder<string, string> {
    return new OptionBuilder<string, string>('string')
  }

  integer(): OptionBuilder<string, number> {
    return new OptionBuilder<string, number>('integer')
  }

  number(): OptionBuilder<string, number> {
    return new OptionBuilder<string, number>('number')
  }

  boolean(): OptionBuilder<string, boolean> {
    return new OptionBuilder<string, boolean>('boolean')
  }

  user(): OptionBuilder<string, BotMember> {
    return new OptionBuilder('user')
  }

  channel(): OptionBuilder<string, Channel> {
    return new OptionBuilder('channel')
  }

  role(): OptionBuilder<string, Archetype> {
    return new OptionBuilder('role')
  }
}

/** Fluent builder for constructing slash commands with options */
export class CommandBuilder<Opts = {}> {
  private _name = ''
  private _description = ''
  private readonly _nameLocalizations: Record<string, string> = {}
  private readonly _descriptionLocalizations: Record<string, string> = {}
  private readonly _optionBuilders: OptionBuilder[] = []

  setName(name: string): this {
    this._name = name
    return this
  }

  setDescription(description: string): this {
    this._description = description
    return this
  }

  setNameLocalization(value: string, locale: string): this {
    this._nameLocalizations[locale] = value
    return this
  }

  setDescriptionLocalization(value: string, locale: string): this {
    this._descriptionLocalizations[locale] = value
    return this
  }

  addOption<B extends OptionBuilder<any, any>>(
    factory: (adder: OptionAdder) => B,
  ): CommandBuilder<Opts & ExtractOptionType<B>> {
    const builder = factory(new OptionAdder())
    this._optionBuilders.push(builder)
    return this as any
  }

  addOptions<B extends OptionBuilder<any, any>[]>(
    factory: (adder: OptionAdder) => [...B],
  ): CommandBuilder<Opts & ExtractOptionsFromArray<B>> {
    const builders = factory(new OptionAdder())

    for (const builder of builders) {
      this._optionBuilders.push(builder)
    }

    return this as any
  }

  run(handler: (ctx: CommandContext, opts: Prettify<Opts>) => Promise<void>): BuiltCommand {
    const options: BuiltCommandOption[] = []

    for (const builder of this._optionBuilders) {
      options.push(builder._build())
    }

    if (!this._name) {
      throw new Error('command() requires setName()')
    }

    return {
      name: this._name,
      nameLocalizations: { ...this._nameLocalizations },
      description: this._description,
      descriptionLocalizations: { ...this._descriptionLocalizations },
      options,
      handler: handler as (ctx: CommandContext, opts: Record<string, unknown>) => Promise<void>,
    }
  }
}
