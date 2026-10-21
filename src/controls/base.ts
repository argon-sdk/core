import type { ControlInteractionContext } from '../contexts/control-interaction'
import type { SelectInteractionContext } from '../contexts/select-interaction'

/** Option entry for select menus */
export interface SelectOption {
  label: string
  value: string
  description?: string
  default?: boolean | null
}

/** Control type values as sent on the wire */
export const ControlType = {
  Button: 0,
  StringSelect: 1,
  UserSelect: 2,
  ArchetypeSelect: 3,
  ChannelSelect: 4,
} as const

/** Union of control type values */
export type ControlType = (typeof ControlType)[keyof typeof ControlType]

/** Button variants: callback (sends an interaction) or link (opens a URL) */
export const ButtonVariant = {
  Callback: 0,
  Link: 1,
} as const

/** Union of button variant values */
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant]

/** Handler invoked on button interaction */
export type ControlHandler<TDec = {}> = (ctx: ControlInteractionContext & TDec) => unknown
/** Handler invoked on select menu interaction */
export type SelectHandler<TDec = {}> = (ctx: SelectInteractionContext & TDec) => unknown

/** Symbol key for storing button handler map on a row */
export const CONTROL_HANDLERS = Symbol('controlHandlers')
/** Symbol key for storing select handler map on a row */
export const SELECT_HANDLERS = Symbol('selectHandlers')

/** Interface for building a serializable control with optional handlers */
export interface ControlBuilder<T extends import('./row').Control = import('./row').Control> {
  /** Serializes the control to its wire shape */
  build(): T
  getHandler?(): { id: string; handler: ControlHandler } | null
  getSelectHandler?(): { id: string; handler: SelectHandler } | null
}
