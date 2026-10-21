import type { NameToken } from '../commands'

import { autoControlId } from './registry'
import { type ControlHandler, type ControlBuilder, ControlType, ButtonVariant } from './base'

/** OKLCH colour; L 0.40–0.80, C 0.00–0.37, H 0–360 */
export interface OklchColour {
  l: number
  c: number
  h: number
}

/** Serializable button control, in its wire shape */
export interface Button {
  type: typeof ControlType.Button
  variant: ButtonVariant
  /** 1–80 characters */
  label: string
  labelLocalizations?: Record<string, string>
  /** Callback buttons: the id reported back in `controlInteraction` (1–100 characters) */
  id?: string
  /** Link buttons: http(s) URL */
  url?: string
  colour?: OklchColour
  disabled?: boolean
  requiredArchetypeId?: string
}

type VariantName = 'callback' | 'link'

/** Fluent builder for constructing button controls */
export class ButtonBuilder<TDec = {}> implements ControlBuilder<Button> {
  private readonly data: Button
  private handler?: ControlHandler<TDec>

  constructor(variant: ButtonVariant | VariantName = ButtonVariant.Callback) {
    this.data = {
      type: ControlType.Button,
      variant: toVariant(variant),
      label: '',
    }
  }

  variant(value: ButtonVariant | VariantName): this {
    this.data.variant = toVariant(value)
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

  /** Sets the id reported back on click. Use `prefix:data` ids with `button.interaction.prefix(prefix)` routes */
  id(value: string): this {
    this.data.id = value
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

  /** Only members with this archetype can press the button */
  requiredArchetype(id: string): this {
    this.data.requiredArchetypeId = id
    return this
  }

  /**
   * Attaches an inline click handler. Without an explicit `.id()` a unique id is generated.
   * Inline handlers live in memory; use `bot.on(button.interaction.prefix(...))` for ones that must survive restarts.
   */
  on(handler: ControlHandler<TDec>): this {
    this.handler = handler

    if (!this.data.id) {
      this.data.id = autoControlId()
    }

    return this
  }

  getHandler(): { id: string; handler: ControlHandler } | null {
    if (this.handler && this.data.id) {
      return { id: this.data.id, handler: this.handler as unknown as ControlHandler }
    }

    return null
  }

  build(): Button {
    const data = { ...this.data }

    if (data.variant === ButtonVariant.Link) {
      delete data.id
    }

    return data
  }
}

function toVariant(value: ButtonVariant | VariantName): ButtonVariant {
  if (value === 'link') {
    return ButtonVariant.Link
  }

  if (value === 'callback') {
    return ButtonVariant.Callback
  }

  return value
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
    const builder = new ButtonBuilder(ButtonVariant.Callback)

    if (first) {
      applyLabelTokens(builder, Array.isArray(first) ? first : [first, ...rest])
    }

    return builder
  },

  link(first?: NameToken | NameToken[], ...rest: NameToken[]): ButtonBuilder {
    const builder = new ButtonBuilder(ButtonVariant.Link)

    if (first) {
      applyLabelTokens(builder, Array.isArray(first) ? first : [first, ...rest])
    }

    return builder
  },
}
