import type { ControlInteractionPayload } from '../events'
import type { Snowflake } from '../types'
import type { ContextDeps } from './base'
import type { MessageContent, EditOptions } from './types'

import { InteractionContext } from './interaction'
import { EventType } from '../events'
import { contentParts } from './send'

/** Context for button clicks */
export class ControlInteractionContext extends InteractionContext<ControlInteractionPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: ControlInteractionPayload) {
    super(deps, eventId, EventType.ControlInteraction, payload)
  }

  /** The button's id */
  get id(): string {
    return this.payload.controlId
  }
  /** The part of the id after the first `:` (`vote:42` → `42`), `null` without one */
  get data(): string | null {
    return dataOf(this.id)
  }
  get controlType(): number {
    return this.payload.controlType
  }
  /** The message holding the button */
  get messageId(): Snowflake {
    return this.payload.messageId
  }

  /**
   * Edits the message holding the button (it must be one the bot sent). Pass `null` content to keep the text.
   * Entities of a `richText` content are ignored: the API cannot change them.
   */
  async update(content: MessageContent | null, options: EditOptions = {}): Promise<void> {
    await this.api.messages.edit(this.channelId, this.messageId, {
      text: content === null ? undefined : contentParts(content).text,
      controls: options.controls,
    })
  }

  /** @deprecated Use `update()` */
  editMessage(content: MessageContent | null, options: EditOptions = {}): Promise<void> {
    return this.update(content, options)
  }
}

/** The part of a control id after the first `:` */
export function dataOf(id: string): string | null {
  const index = id.indexOf(':')
  return index === -1 ? null : id.slice(index + 1)
}
