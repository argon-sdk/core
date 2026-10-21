import type { ControlHandler, SelectHandler, ControlBuilder } from './base'
import type { Button } from './button'
import type { StringSelect, UserSelect, ArchetypeSelect, ChannelSelect } from './select'

import { CONTROL_HANDLERS, SELECT_HANDLERS, ControlType } from './base'
import { ArgonError } from '../errors'

/** Union of all interactive control types */
export type Control = Button | StringSelect | UserSelect | ArchetypeSelect | ChannelSelect

/** A row of controls in its wire shape: 1–5 buttons, or exactly one select */
export interface ControlRowData {
  controls: Control[]
}

/** A row of controls together with the inline handlers attached to them */
export type Row = ControlRowData & {
  [CONTROL_HANDLERS]?: Map<string, ControlHandler>
  [SELECT_HANDLERS]?: Map<string, SelectHandler>
}

/** Rows per message */
export const MAX_ROWS = 5
/** Buttons per row */
export const MAX_BUTTONS_PER_ROW = 5

/** Builds a row of controls, collecting their interaction handlers */
export function row(...controls: Array<ControlBuilder | Control>): Row {
  const controlHandlers = new Map<string, ControlHandler>()
  const selectHandlers = new Map<string, SelectHandler>()
  const built: Control[] = []

  for (const control of controls) {
    if (!isBuilder(control)) {
      built.push(control)
      continue
    }

    const controlEntry = control.getHandler?.()
    if (controlEntry) {
      controlHandlers.set(controlEntry.id, controlEntry.handler)
    }

    const selectEntry = control.getSelectHandler?.()
    if (selectEntry) {
      selectHandlers.set(selectEntry.id, selectEntry.handler)
    }

    built.push(control.build())
  }

  validateRow(built)

  const result: Row = { controls: built }

  if (controlHandlers.size > 0) {
    result[CONTROL_HANDLERS] = controlHandlers
  }

  if (selectHandlers.size > 0) {
    result[SELECT_HANDLERS] = selectHandlers
  }

  return result
}

function isBuilder(value: ControlBuilder | Control): value is ControlBuilder {
  return typeof (value as ControlBuilder).build === 'function'
}

function validateRow(controls: Control[]): void {
  if (controls.length === 0) {
    throw new ArgonError('row() needs at least one control')
  }

  const selects = controls.filter((c) => c.type !== ControlType.Button).length

  if (selects > 0 && controls.length > 1) {
    throw new ArgonError('A row holds either up to 5 buttons or exactly one select')
  }

  if (controls.length > MAX_BUTTONS_PER_ROW) {
    throw new ArgonError(`A row holds at most ${MAX_BUTTONS_PER_ROW} buttons`)
  }
}

/** Strips handler bookkeeping so rows can be sent; also accepts plain wire rows */
export function serializeRows(rows: ReadonlyArray<Row | ControlRowData> | undefined): ControlRowData[] | undefined {
  if (rows === undefined) {
    return undefined
  }

  if (rows.length > MAX_ROWS) {
    throw new ArgonError(`A message holds at most ${MAX_ROWS} rows of controls`)
  }

  return rows.map((r) => ({ controls: r.controls }))
}
