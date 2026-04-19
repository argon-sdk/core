import type { SelectOption } from './base'

/** Serializable modal form control entry */
export interface ModalControl {
  type: 'textInput' | 'stringSelect' | 'userSelect' | 'archetypeSelect' | 'channelSelect' | 'checkbox'
  customId: string
  label: string
  description?: string
  placeholder?: string
  value?: string
  style?: 'short' | 'paragraph' | null
  required?: boolean | null
  default?: boolean | null
  minLength?: number | null
  maxLength?: number | null
  minValues?: number | null
  maxValues?: number | null
  options?: SelectOption[]
}

/** Complete modal form definition ready for dispatch */
export interface ModalDefinition {
  customId: string
  title: string
  controls: ModalControl[]
}

/** Builder interface for individual modal controls */
export interface ModalControlDef {
  _build(): ModalControl
}

/** Text input control definition for modals */
export class TextInputDef implements ModalControlDef {
  private readonly _customId: string
  private readonly _label: string
  private _description?: string
  private _placeholder?: string
  private _value?: string
  private _style?: 'short' | 'paragraph'
  private _required?: boolean
  private _minLength?: number
  private _maxLength?: number

  constructor(customId: string, label: string) {
    this._customId = customId
    this._label = label
  }

  style(value: 'short' | 'paragraph'): this {
    this._style = value
    return this
  }

  required(value = true): this {
    this._required = value
    return this
  }

  placeholder(value: string): this {
    this._placeholder = value
    return this
  }

  value(value: string): this {
    this._value = value
    return this
  }

  description(value: string): this {
    this._description = value
    return this
  }

  minLength(value: number): this {
    this._minLength = value
    return this
  }

  maxLength(value: number): this {
    this._maxLength = value
    return this
  }

  _build(): ModalControl {
    return {
      type: 'textInput',
      customId: this._customId,
      label: this._label,
      description: this._description,
      placeholder: this._placeholder,
      value: this._value,
      style: this._style ?? null,
      required: this._required ?? null,
      minLength: this._minLength ?? null,
      maxLength: this._maxLength ?? null,
    }
  }
}

/** Checkbox control definition for modals */
export class CheckboxDef implements ModalControlDef {
  private readonly _customId: string
  private readonly _label: string
  private _description?: string
  private _required?: boolean
  private _default?: boolean

  constructor(customId: string, label: string) {
    this._customId = customId
    this._label = label
  }

  required(value = true): this {
    this._required = value
    return this
  }

  description(value: string): this {
    this._description = value
    return this
  }

  defaultValue(value = true): this {
    this._default = value
    return this
  }

  _build(): ModalControl {
    return {
      type: 'checkbox',
      customId: this._customId,
      label: this._label,
      description: this._description,
      required: this._required ?? null,
      default: this._default ?? null,
    }
  }
}

/** Select control definition for modals */
export class SelectDef implements ModalControlDef {
  private readonly _type: ModalControl['type']
  private readonly _customId: string
  private readonly _label: string
  private _description?: string
  private _placeholder?: string
  private _required?: boolean
  private _minValues?: number
  private _maxValues?: number
  private readonly _options?: SelectOption[]

  constructor(type: ModalControl['type'], customId: string, label: string, options?: SelectOption[]) {
    this._type = type
    this._customId = customId
    this._label = label
    this._options = options
  }

  required(value = true): this {
    this._required = value
    return this
  }

  placeholder(value: string): this {
    this._placeholder = value
    return this
  }

  description(value: string): this {
    this._description = value
    return this
  }

  minValues(value: number): this {
    this._minValues = value
    return this
  }

  maxValues(value: number): this {
    this._maxValues = value
    return this
  }

  _build(): ModalControl {
    return {
      type: this._type,
      customId: this._customId,
      label: this._label,
      description: this._description,
      placeholder: this._placeholder,
      required: this._required ?? null,
      minValues: this._minValues ?? null,
      maxValues: this._maxValues ?? null,
      options: this._options,
    }
  }
}

/** Creates a text input control for a modal */
export function textInput(customId: string, label: string): TextInputDef {
  return new TextInputDef(customId, label)
}

/** Creates a checkbox control for a modal */
export function checkboxInput(customId: string, label: string): CheckboxDef {
  return new CheckboxDef(customId, label)
}

/** Creates a string select control for a modal */
export function selectInput(customId: string, label: string, options: SelectOption[]): SelectDef {
  return new SelectDef('stringSelect', customId, label, options)
}

/** Creates a user select control for a modal */
export function userSelectInput(customId: string, label: string): SelectDef {
  return new SelectDef('userSelect', customId, label)
}

/** Creates an archetype select control for a modal */
export function archetypeSelectInput(customId: string, label: string): SelectDef {
  return new SelectDef('archetypeSelect', customId, label)
}

/** Creates a channel select control for a modal */
export function channelSelectInput(customId: string, label: string): SelectDef {
  return new SelectDef('channelSelect', customId, label)
}

class TextInputBuilder implements ModalControlDef {
  private _customId = ''
  private _label = ''
  private _description?: string
  private _placeholder?: string
  private _value?: string
  private _style?: 'short' | 'paragraph'
  private _required?: boolean
  private _minLength?: number
  private _maxLength?: number

  setId(customId: string): this {
    this._customId = customId
    return this
  }

  setLabel(label: string): this {
    this._label = label
    return this
  }

  setDescription(description: string): this {
    this._description = description
    return this
  }

  setPlaceholder(placeholder: string): this {
    this._placeholder = placeholder
    return this
  }

  setValue(value: string): this {
    this._value = value
    return this
  }

  setStyle(style: 'short' | 'paragraph'): this {
    this._style = style
    return this
  }

  setRequired(required = true): this {
    this._required = required
    return this
  }

  setMinLength(minLength: number): this {
    this._minLength = minLength
    return this
  }

  setMaxLength(maxLength: number): this {
    this._maxLength = maxLength
    return this
  }

  _build(): ModalControl {
    return {
      type: 'textInput',
      customId: this._customId,
      label: this._label,
      description: this._description,
      placeholder: this._placeholder,
      value: this._value,
      style: this._style ?? null,
      required: this._required ?? null,
      minLength: this._minLength ?? null,
      maxLength: this._maxLength ?? null,
    }
  }
}

class ModalSelectBuilder implements ModalControlDef {
  private readonly _type: ModalControl['type']
  private _customId = ''
  private _label = ''
  private _description?: string
  private _placeholder?: string
  private _required?: boolean
  private _minValues?: number
  private _maxValues?: number
  private _options?: SelectOption[]

  constructor(type: ModalControl['type']) {
    this._type = type
  }

  setId(customId: string): this {
    this._customId = customId
    return this
  }

  setLabel(label: string): this {
    this._label = label
    return this
  }

  setDescription(description: string): this {
    this._description = description
    return this
  }

  setPlaceholder(placeholder: string): this {
    this._placeholder = placeholder
    return this
  }

  setOptions(options: SelectOption[]): this {
    this._options = options
    return this
  }

  setMinValues(minValues: number): this {
    this._minValues = minValues
    return this
  }

  setMaxValues(maxValues: number): this {
    this._maxValues = maxValues
    return this
  }

  setRequired(required = true): this {
    this._required = required
    return this
  }

  _build(): ModalControl {
    return {
      type: this._type,
      customId: this._customId,
      label: this._label,
      description: this._description,
      placeholder: this._placeholder,
      required: this._required ?? null,
      minValues: this._minValues ?? null,
      maxValues: this._maxValues ?? null,
      options: this._options,
    }
  }
}

class CheckboxBuilder implements ModalControlDef {
  private _customId = ''
  private _label = ''
  private _description?: string
  private _required?: boolean
  private _default?: boolean

  setId(customId: string): this {
    this._customId = customId
    return this
  }

  setLabel(label: string): this {
    this._label = label
    return this
  }

  setDescription(description: string): this {
    this._description = description
    return this
  }

  setRequired(required = true): this {
    this._required = required
    return this
  }

  setDefault(value = true): this {
    this._default = value
    return this
  }

  _build(): ModalControl {
    return {
      type: 'checkbox',
      customId: this._customId,
      label: this._label,
      description: this._description,
      required: this._required ?? null,
      default: this._default ?? null,
    }
  }
}

class ModalControlAdder {
  textInput(): TextInputBuilder {
    return new TextInputBuilder()
  }

  stringSelect(): ModalSelectBuilder {
    return new ModalSelectBuilder('stringSelect')
  }

  userSelect(): ModalSelectBuilder {
    return new ModalSelectBuilder('userSelect')
  }

  archetypeSelect(): ModalSelectBuilder {
    return new ModalSelectBuilder('archetypeSelect')
  }

  channelSelect(): ModalSelectBuilder {
    return new ModalSelectBuilder('channelSelect')
  }

  checkbox(): CheckboxBuilder {
    return new CheckboxBuilder()
  }
}

/** Fluent builder for constructing modal forms */
export class ModalBuilder {
  private _customId = ''
  private _title = ''
  private readonly _controlBuilders: ModalControlDef[] = []

  setId(customId: string): this {
    this._customId = customId
    return this
  }

  setTitle(title: string): this {
    this._title = title
    return this
  }

  addControl(factory: (adder: ModalControlAdder) => ModalControlDef): this {
    const builder = factory(new ModalControlAdder())
    this._controlBuilders.push(builder)
    return this
  }

  build(): ModalDefinition {
    if (!this._customId) {
      throw new Error('ModalBuilder requires setId()')
    }

    if (!this._title) {
      throw new Error('ModalBuilder requires setTitle()')
    }

    const controls: ModalControl[] = []

    for (const builder of this._controlBuilders) {
      controls.push(builder._build())
    }

    return {
      customId: this._customId,
      title: this._title,
      controls,
    }
  }
}

/** Creates a modal form, either as a builder or directly from arguments */
export function modal(): ModalBuilder
export function modal(customId: string, title: string, ...controls: ModalControlDef[]): ModalDefinition
export function modal(
  customId?: string,
  title?: string,
  ...controls: ModalControlDef[]
): ModalBuilder | ModalDefinition {
  if (customId === undefined) {
    return new ModalBuilder()
  }

  const builtControls: ModalControl[] = []

  for (const control of controls) {
    builtControls.push(control._build())
  }

  return {
    customId,
    title: title!,
    controls: builtControls,
  }
}
