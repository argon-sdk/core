export {
  name,
  describe,
  option,
  type NameToken,
  type DescribeToken,
  type OptionToken,
  type CommandToken,
} from './tokens'

export { string, integer, number, boolean, user, channel, role, type OptionDef, type OptionMeta } from './option'
export type { BuiltCommand, BuiltCommandOption, CommandDefinition } from './builder'
export { CommandBuilder } from './command-builder'
export { syncCommands } from './sync'
