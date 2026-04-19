import type { ControlInteractionContext } from '../contexts/control-interaction'
import type { SelectInteractionContext } from '../contexts/select-interaction'

/** Option entry for select menus */
export interface SelectOption {
  label: string
  value: string
  description?: string
  default?: boolean | null
}

/** Available control type identifiers */
export const ControlType = {
  Button: 'button',
  StringSelect: 'stringSelect',
  UserSelect: 'userSelect',
  ArchetypeSelect: 'archetypeSelect',
  ChannelSelect: 'channelSelect',
} as const

/** Union of all control type string values */
export type ControlType = (typeof ControlType)[keyof typeof ControlType]

/** Button variant identifiers: callback or link */
export const ButtonVariant = {
  Callback: 'callback',
  Link: 'link',
} as const

/** Union of button variant string values */
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant]

/** Handler invoked on button interaction */
export type ControlHandler = (ctx: ControlInteractionContext) => Promise<void>
/** Handler invoked on select menu interaction */
export type SelectHandler = (ctx: SelectInteractionContext) => Promise<void>

/** Symbol key for storing button handler map on a row */
export const CONTROL_HANDLERS = Symbol('controlHandlers')
/** Symbol key for storing select handler map on a row */
export const SELECT_HANDLERS = Symbol('selectHandlers')

/** Interface for building a serializable control with optional handlers */
export interface ControlBuilder<T extends import('./row').Control = import('./row').Control> {
  build(): T
  getHandler?(): { id: string; handler: ControlHandler } | null
  getSelectHandler?(): { id: string; handler: SelectHandler } | null
}
