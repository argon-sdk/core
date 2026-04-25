import type { NameToken } from '../commands'

import {
  type ControlHandler,
  type ControlBuilder,
  type ButtonVariant,
  ControlType,
  ButtonVariant as ButtonVariantEnum,
} from './base'

/** Serializable button control definition */
export interface Button {
  type: 'button'
  variant: ButtonVariant
  label: string
  labelLocalizations?: Record<string, string>
  customId?: string
  url?: string
  colour?: { l: number; c: number; h: number }
  disabled?: boolean
  requiredArchetypeId?: string
}

/** Fluent builder for constructing button controls */
export class ButtonBuilder<TDec = {}> implements ControlBuilder<Button> {
  private readonly data: Button
  private handler?: ControlHandler<TDec>

  constructor(variant?: ButtonVariant) {
    this.data = {
      type: ControlType.Button,
      variant: variant ?? ButtonVariantEnum.Callback,
      label: '',
    }
  }

  variant(value: ButtonVariant): this {
    ;(this.data as { variant: ButtonVariant }).variant = value
    return this
  }

  label(value: string): this {
    this.data.label = value
    return this
  }

  labelLocalizations(value: Record<string, string>): this {
    this.data.labelLocalizations = value
    return this
  }

  id(value: string): this {
    this.data.customId = value
    return this
  }

  href(url: string): this {
    this.data.url = url
    return this
  }

  colour(l: number, c: number, h: number): this {
    this.data.colour = { l, c, h }
    return this
  }

  disabled(value = true): this {
    this.data.disabled = value
    return this
  }

  requiredArchetype(id: string): this {
    this.data.requiredArchetypeId = id
    return this
  }

  on(handler: ControlHandler<TDec>): this {
    this.handler = handler
    return this
  }

  getHandler(): { id: string; handler: ControlHandler } | null {
    if (this.handler && this.data.customId) {
      return { id: this.data.customId, handler: this.handler as unknown as ControlHandler }
    }

    return null
  }

  build(): Button {
    return { ...this.data }
  }
}

function applyLabelTokens(builder: ButtonBuilder, tokens: NameToken[]): void {
  const localizations: Record<string, string> = {}

  for (const token of tokens) {
    if (!token.locale) {
      builder.label(token.value)
    } else {
      localizations[token.locale] = token.value
    }
  }

  if (Object.keys(localizations).length > 0) {
    builder.labelLocalizations(localizations)
  }
}

/** Namespace providing callback and link button factory methods */
export interface ButtonNamespace<TDec = {}> {
  callback(): ButtonBuilder<TDec>
  callback(first: NameToken | NameToken[], ...rest: NameToken[]): ButtonBuilder<TDec>
  link(): ButtonBuilder<TDec>
  link(first: NameToken | NameToken[], ...rest: NameToken[]): ButtonBuilder<TDec>
}

/** Factory for creating callback and link buttons with optional label tokens */
export const button: ButtonNamespace = {
  callback(first?: NameToken | NameToken[], ...rest: NameToken[]): ButtonBuilder {
    const builder = new ButtonBuilder(ButtonVariantEnum.Callback)

    if (first) {
      const tokens = Array.isArray(first) ? first : [first, ...rest]
      applyLabelTokens(builder, tokens)
    }

    return builder
  },

  link(first?: NameToken | NameToken[], ...rest: NameToken[]): ButtonBuilder {
    const builder = new ButtonBuilder(ButtonVariantEnum.Link)

    if (first) {
      const tokens = Array.isArray(first) ? first : [first, ...rest]
      applyLabelTokens(builder, tokens)
    }

    return builder
  },
}
