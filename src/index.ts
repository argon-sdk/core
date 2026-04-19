/**
 * Argon SDK — TypeScript SDK for building bots on the Argon messaging platform.
 *
 * @example
 * ```ts
 * import { Bot, on, message } from '@argon-sdk/core'
 *
 * const bot = new Bot('your-token')
 * bot.on(message.create, (ctx) => ctx.reply('Hello!'))
 * await bot.start()
 * ```
 *
 * @module
 */

export { Bot } from './core/bot'
export type { BotOptions } from './core/bot'
export { on, otherwise } from './core/on'
export type { Filter } from './filters/base'
export { makeFilter } from './filters/base'
export { BaseContext } from './contexts/base'
export { InteractionContext } from './contexts/interaction'
export type { Middleware, NextFunction } from './core/middleware'
export type { BotHooks } from './core/hooks'
export type { GroupUse } from './core/group'

export { SseTransport } from './transport/sse'
export type { SseOptions } from './transport/sse'
export type { Transport } from './transport/transport'

export { ApiClient } from './api/client'
export type {
  SendMessageParams,
  SendMessageResponse,
  MessageHistoryParams,
  CreateChannelParams,
  DeleteChannelParams,
  RegisterCommandParams,
  UpdateCommandParams,
  CommandOption,
  BotSelf,
  BotSpaceBase,
  BotSpaceDetail,
  BotMember,
  BotCommand,
  BatchGetReactionsResponse,
  MessageReactions,
  ModalDefinition,
  ModalControl,
  SelectOption,
} from './api/client'

export {
  message,
  invoke,
  member,
  channel,
  presence,
  botLifecycle,
  typing,
  archetype,
  reaction,
  ready,
  heartbeat,
  resumed,
} from './events/tokens'

import { control as _control, select as _select, modal as _modal } from './events/tokens'

import {
  button as _button,
  stringSelect,
  userSelect,
  archetypeSelect,
  channelSelect,
  modal as _modalFactory,
} from './controls/index'

import type { ButtonNamespace } from './controls/button'
import type { ControlInteractionFilter } from './filters/control-interaction'
import type { SelectInteractionFilter } from './filters/select-interaction'
import type { ModalSubmitFilter } from './filters/modal-submit'
import type { ModalBuilder, ModalDefinition, ModalControlDef } from './controls'

/** Button control factories and interaction event filter */
export const button: ButtonNamespace & {
  interaction: ControlInteractionFilter
} = {
  ..._button,
  interaction: _control.interaction,
}

/** Select control factories and interaction event filter */
export const select: {
  interaction: SelectInteractionFilter
  string: typeof stringSelect
  user: typeof userSelect
  archetype: typeof archetypeSelect
  channel: typeof channelSelect
} = {
  interaction: _select.interaction,
  string: stringSelect,
  user: userSelect,
  archetype: archetypeSelect,
  channel: channelSelect,
}

/** Modal dialog factory and submit event filter */
export const modal: {
  (): ModalBuilder
  (customId: string, title: string, ...controls: ModalControlDef[]): ModalDefinition
  submit: ModalSubmitFilter
} = Object.assign(_modalFactory, {
  submit: _modal.submit,
})

export { command } from './commands/builder'
export { name, describe, option } from './commands/tokens'
export type { NameToken, DescribeToken, OptionToken, CommandToken } from './commands/tokens'
export { string, integer, number, boolean, user, channel as channelOption, role } from './commands/option'
export type { OptionDef, OptionMeta } from './commands/option'
export type { BuiltCommand, BuiltCommandOption } from './commands/builder'

export { EventType } from './events/types'

export type { ContextMap } from './contexts/registry'
export type { ReplyOptions, EditOptions } from './contexts/types'

export { MessageCreateContext } from './contexts/message-create'
export { ControlInteractionContext } from './contexts/control-interaction'
export { CommandContext } from './contexts/command-interaction'
export { SelectInteractionContext } from './contexts/select-interaction'
export { ModalSubmitContext } from './contexts/modal-submit'
export { MessageEditContext } from './contexts/message-edit'
export { MemberJoinContext } from './contexts/member-join'
export { MemberLeaveContext } from './contexts/member-leave'
export { MemberUpdateContext } from './contexts/member-update'
export { ChannelCreateContext } from './contexts/channel-create'
export { ChannelDeleteContext } from './contexts/channel-delete'
export { PresenceUpdateContext } from './contexts/presence-update'
export { BotInstallingContext } from './contexts/bot-installing'
export { BotUninstallingContext } from './contexts/bot-uninstalling'
export { TypingStartContext } from './contexts/typing-start'
export { TypingStopContext } from './contexts/typing-stop'
export { ArchetypeCreateContext } from './contexts/archetype-create'
export { ArchetypeUpdateContext } from './contexts/archetype-update'
export { ReactionAddContext } from './contexts/reaction-add'
export { ReactionRemoveContext } from './contexts/reaction-remove'
export { ReadyContext } from './contexts/ready'
export { HeartbeatContext } from './contexts/heartbeat'
export { ResumedContext } from './contexts/resumed'

export type { MessageCreateReplyOptions } from './contexts/message-create'

export { text } from './filters/predicates'

export { CommandBuilder } from './commands/command-builder'

export { ArgonError, HttpError, TransportError } from './errors'

export { Intent } from './types/intents'
export { Entitlement } from './types/entitlement'
export {
  row,
  ButtonBuilder,
  SelectBuilder,
  ModalBuilder,
  textInput,
  checkboxInput,
  selectInput,
  userSelectInput,
  archetypeSelectInput,
  channelSelectInput,
} from './controls/index'
export { ControlType, ButtonVariant } from './controls/index'
export { VisibilityScope } from './types/visibility'
export { UserFlags } from './types/entities/user'
export type { Visibility } from './types/visibility'
export type {
  Button,
  StringSelect,
  UserSelect,
  ArchetypeSelect,
  ChannelSelect,
  Control,
  Row,
  ControlBuilder,
  ModalControlDef,
} from './controls/index'

export {
  richText,
  MessageBuilder,
  plain,
  bold,
  italic,
  underline,
  strikethrough,
  code,
  spoiler,
  mention,
  mentionEveryone,
  mentionRole,
  url,
  email,
  hashtag,
  quote,
  newline,
} from './core/message-builder'

export type { BuiltMessage, MessageToken } from './core/message-builder'

export type {
  Snowflake,
  Archetype,
  ArchetypeMember,
  Reaction,
  User,
  Space,
  Channel,
  Message,
  MessageEntity,
  AttachmentEntity,
  MentionEntity,
  UrlEntity,
  SystemCallStartedEntity,
  SystemCallEndedEntity,
  SystemCallTimeoutEntity,
  SystemUserJoinedEntity,
} from './types/index'

export { ChannelType, EntityType } from './types/index'

export type {
  SseEventType,
  SseEventMap,
  SseEvent,
  MessageCreatePayload,
  MessageEditPayload,
  MemberJoinPayload,
  MemberLeavePayload,
  MemberUpdatePayload,
  ChannelCreatePayload,
  ChannelDeletePayload,
  TypingPayload,
  ControlInteractionPayload,
  CommandInteractionPayload,
  CommandOptionValue,
  ArchetypeEventPayload,
  BotSpacePayload,
  SelectInteractionPayload,
  ModalSubmitPayload,
  ReactionPayload,
  PresenceUpdatePayload,
  BotPresence,
  PresenceActivity,
  PresenceStatus,
  ActivityKind,
} from './events/types'

export type { Services } from './core/plugin'
export type { Plugin } from './core/plugin'
