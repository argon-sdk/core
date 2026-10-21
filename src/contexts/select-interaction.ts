import type { SelectInteractionPayload } from '../events'
import type { Snowflake } from '../types'
import type { ContextDeps } from './base'
import type { MessageContent, EditOptions } from './types'

import { InteractionContext } from './interaction'
import { EventType } from '../events'
import { contentParts } from './send'
import { dataOf } from './control-interaction'

/** Context for select menu submissions */
export class SelectInteractionContext extends InteractionContext<SelectInteractionPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: SelectInteractionPayload) {
    super(deps, eventId, EventType.SelectInteraction, payload)
  }

  /** The select's custom id */
  get id(): string {
    return this.payload.customId
  }
  /** The part of the id after the first `:` (`role:admin` → `admin`), `null` without one */
  get data(): string | null {
    return dataOf(this.id)
  }
  /** 1 string, 2 user, 3 archetype, 4 channel select */
  get controlType(): number {
    return this.payload.controlType
  }
  /** The message holding the select */
  get messageId(): Snowflake {
    return this.payload.messageId
  }
  /** Chosen option values, or user/archetype/channel ids */
  get values(): string[] {
    return this.payload.values
  }
  /** The first chosen value */
  get value(): string | undefined {
    return this.payload.values[0]
  }

  /** Edits the message holding the select (it must be one the bot sent). `null` content keeps the text */
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
