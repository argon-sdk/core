import type { ModalSubmitPayload } from '../events'
import type { ContextDeps } from './base'

import { InteractionContext } from './interaction'
import { EventType } from '../events'
import { dataOf } from './control-interaction'

/**
 * Context for modal form submissions.
 *
 * The server cannot acknowledge a modal submit, so `ack()`/`defer()` do nothing here; answer with `reply()`.
 */
export class ModalSubmitContext extends InteractionContext<ModalSubmitPayload> {
  protected override readonly answerable = false

  constructor(deps: ContextDeps, eventId: string, payload: ModalSubmitPayload) {
    super(deps, eventId, EventType.ModalSubmit, payload)
  }

  /**
   * The modal's custom id (first argument of `modal(id, title)`). The server only reports the modal's
   * interaction id; it is mapped back for modals shown by this process, and returned as is otherwise.
   */
  get id(): string {
    return this.api.interactions.modalCustomId(this.payload.customId)
  }
  /** The part of the modal id after the first `:`, `null` without one */
  get data(): string | null {
    return dataOf(this.id)
  }
  /** The interaction id of the shown modal (`modalInteractionId`) */
  get modalInteractionId(): string {
    return this.payload.customId
  }
  /** Submitted values by component id */
  get values(): Record<string, string> {
    return Object.fromEntries(this.payload.values.map((v) => [v.customId, v.values[0] ?? '']))
  }

  /** The submitted value of a component */
  value(customId: string): string | undefined {
    return this.payload.values.find((v) => v.customId === customId)?.values[0]
  }

  /** Whether a checkbox component was ticked */
  checked(customId: string): boolean {
    return this.value(customId) === 'true'
  }
}
