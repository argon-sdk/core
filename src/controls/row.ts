import type { ControlHandler, SelectHandler, ControlBuilder } from './base'
import { CONTROL_HANDLERS, SELECT_HANDLERS } from './base'
import type { Button } from './button'
import type { StringSelect, UserSelect, ArchetypeSelect, ChannelSelect } from './select'

/** Union of all interactive control types */
export type Control = Button | StringSelect | UserSelect | ArchetypeSelect | ChannelSelect

/** Array of controls with attached handler maps */
export type Row = Control[] & {
  [CONTROL_HANDLERS]?: Map<string, ControlHandler>
  [SELECT_HANDLERS]?: Map<string, SelectHandler>
}

/** Builds a row of controls, collecting their interaction handlers */
export function row(...controls: ControlBuilder[]): Row {
  const controlHandlers = new Map<string, ControlHandler>()
  const selectHandlers = new Map<string, SelectHandler>()

  for (const control of controls) {
    const controlEntry = control.getHandler?.()
    if (controlEntry) {
      controlHandlers.set(controlEntry.id, controlEntry.handler)
    }

    const selectEntry = control.getSelectHandler?.()
    if (selectEntry) {
      selectHandlers.set(selectEntry.id, selectEntry.handler)
    }
  }

  const result: Row = controls.map((c) => c.build()) as Row

  if (controlHandlers.size > 0) {
    result[CONTROL_HANDLERS] = controlHandlers
  }

  if (selectHandlers.size > 0) {
    result[SELECT_HANDLERS] = selectHandlers
  }

  return result
}
