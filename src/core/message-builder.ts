import type { MessageEntity } from '../types'
import type { Snowflake } from '../types'
import { EntityType } from '../types'

/** The result of building a message: plain text paired with rich-text entities */
export interface BuiltMessage {
  text: string
  entities: MessageEntity[]
}

/** An opaque formatting token used with the richText() template function */
export interface MessageToken {
  _apply(builder: MessageBuilder): void
}

/** Fluent builder for composing messages with rich-text entities */
export class MessageBuilder {
  private text = ''
  private readonly entities: MessageEntity[] = []

  plain(value: string): this {
    this.text += value
    return this
  }

  bold(value: string): this {
    const offset = this.text.length
    this.text += value
    this.entities.push({ type: EntityType.Bold, offset, length: value.length, version: 1 })
    return this
  }

  italic(value: string): this {
    const offset = this.text.length
    this.text += value
    this.entities.push({ type: EntityType.Italic, offset, length: value.length, version: 1 })
    return this
  }

  underline(value: string, colour = 0): this {
    const offset = this.text.length
    this.text += value
    this.entities.push({ type: EntityType.Underline, offset, length: value.length, version: 1, colour })
    return this
  }

  strikethrough(value: string): this {
    const offset = this.text.length
    this.text += value
    this.entities.push({ type: EntityType.Strikethrough, offset, length: value.length, version: 1 })
    return this
  }

  code(value: string): this {
    const offset = this.text.length
    this.text += value
    this.entities.push({ type: EntityType.Monospace, offset, length: value.length, version: 1 })
    return this
  }

  spoiler(value: string): this {
    const offset = this.text.length
    this.text += value
    this.entities.push({ type: EntityType.Spoiler, offset, length: value.length, version: 1 })
    return this
  }

  mention(userId: Snowflake, displayText: string): this {
    const offset = this.text.length
    this.text += displayText
    this.entities.push({ type: EntityType.Mention, offset, length: displayText.length, version: 1, userId })
    return this
  }

  mentionEveryone(displayText = '@everyone'): this {
    const offset = this.text.length
    this.text += displayText
    this.entities.push({ type: EntityType.MentionEveryone, offset, length: displayText.length, version: 1 })
    return this
  }

  mentionRole(archetypeId: Snowflake, displayText: string): this {
    const offset = this.text.length
    this.text += displayText
    this.entities.push({ type: EntityType.MentionRole, offset, length: displayText.length, version: 1, archetypeId })
    return this
  }

  url(href: string, displayText?: string): this {
    const label = displayText ?? href
    const offset = this.text.length
    this.text += label

    const parsed = new URL(href)
    const domain = parsed.hostname
    const path = parsed.pathname + parsed.search + parsed.hash

    this.entities.push({ type: EntityType.Url, offset, length: label.length, version: 1, domain, path })
    return this
  }

  email(address: string): this {
    const offset = this.text.length
    this.text += address
    this.entities.push({ type: EntityType.Email, offset, length: address.length, version: 1, email: address })
    return this
  }

  hashtag(tag: string): this {
    const display = tag.startsWith('#') ? tag : `#${tag}`
    const offset = this.text.length
    this.text += display
    this.entities.push({ type: EntityType.Hashtag, offset, length: display.length, version: 1, hashtag: tag })
    return this
  }

  quote(text: string, quotedUserId: Snowflake): this {
    const offset = this.text.length
    this.text += text
    this.entities.push({ type: EntityType.Quote, offset, length: text.length, version: 1, quotedUserId })
    return this
  }

  newline(): this {
    this.text += '\n'
    return this
  }

  build(): BuiltMessage {
    return { text: this.text, entities: [...this.entities] }
  }
}

/** Creates a plain text token */
export function plain(text: string): MessageToken {
  return {
    _apply: (b) => {
      b.plain(text)
    },
  }
}

/** Creates a bold text token */
export function bold(text: string): MessageToken {
  return {
    _apply: (b) => {
      b.bold(text)
    },
  }
}

/** Creates an italic text token */
export function italic(text: string): MessageToken {
  return {
    _apply: (b) => {
      b.italic(text)
    },
  }
}

/** Creates an underline text token with optional colour */
export function underline(text: string, colour?: number): MessageToken {
  return {
    _apply: (b) => {
      b.underline(text, colour)
    },
  }
}

/** Creates a strikethrough text token */
export function strikethrough(text: string): MessageToken {
  return {
    _apply: (b) => {
      b.strikethrough(text)
    },
  }
}

/** Creates a monospace code text token */
export function code(text: string): MessageToken {
  return {
    _apply: (b) => {
      b.code(text)
    },
  }
}

/** Creates a spoiler text token */
export function spoiler(text: string): MessageToken {
  return {
    _apply: (b) => {
      b.spoiler(text)
    },
  }
}

/** Creates a user mention token */
export function mention(userId: Snowflake, displayText: string): MessageToken {
  return {
    _apply: (b) => {
      b.mention(userId, displayText)
    },
  }
}

/** Creates an @everyone mention token */
export function mentionEveryone(displayText?: string): MessageToken {
  return {
    _apply: (b) => {
      b.mentionEveryone(displayText)
    },
  }
}

/** Creates a role mention token */
export function mentionRole(archetypeId: Snowflake, displayText: string): MessageToken {
  return {
    _apply: (b) => {
      b.mentionRole(archetypeId, displayText)
    },
  }
}

/** Creates a URL hyperlink token */
export function url(href: string, displayText?: string): MessageToken {
  return {
    _apply: (b) => {
      b.url(href, displayText)
    },
  }
}

/** Creates an email address token */
export function email(address: string): MessageToken {
  return {
    _apply: (b) => {
      b.email(address)
    },
  }
}

/** Creates a hashtag token, auto-prefixing '#' if missing */
export function hashtag(tag: string): MessageToken {
  return {
    _apply: (b) => {
      b.hashtag(tag)
    },
  }
}

/** Creates a quote token attributed to a user */
export function quote(text: string, quotedUserId: Snowflake): MessageToken {
  return {
    _apply: (b) => {
      b.quote(text, quotedUserId)
    },
  }
}

/** Creates a newline token */
export function newline(): MessageToken {
  return {
    _apply: (b) => {
      b.newline()
    },
  }
}

/** Returns a MessageBuilder when called with no arguments, or a BuiltMessage when called with tokens */
export function richText(): MessageBuilder
export function richText(...tokens: MessageToken[]): BuiltMessage
export function richText(...tokens: MessageToken[]): MessageBuilder | BuiltMessage {
  const builder = new MessageBuilder()

  if (tokens.length === 0) {
    return builder
  }

  for (const token of tokens) {
    token._apply(builder)
  }

  return builder.build()
}
