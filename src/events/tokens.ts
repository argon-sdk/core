import type { MessageEditContext } from '../contexts/message-edit'
import type { MemberJoinContext } from '../contexts/member-join'
import type { MemberLeaveContext } from '../contexts/member-leave'
import type { MemberUpdateContext } from '../contexts/member-update'
import type { ChannelCreateContext } from '../contexts/channel-create'
import type { ChannelDeleteContext } from '../contexts/channel-delete'
import type { PresenceUpdateContext } from '../contexts/presence-update'
import type { BotInstallingContext } from '../contexts/bot-installing'
import type { BotUninstallingContext } from '../contexts/bot-uninstalling'
import type { TypingStartContext } from '../contexts/typing-start'
import type { TypingStopContext } from '../contexts/typing-stop'
import type { ArchetypeCreateContext } from '../contexts/archetype-create'
import type { ArchetypeUpdateContext } from '../contexts/archetype-update'
import type { ReactionAddContext } from '../contexts/reaction-add'
import type { ReactionRemoveContext } from '../contexts/reaction-remove'
import type { ReadyContext } from '../contexts/ready'
import type { HeartbeatContext } from '../contexts/heartbeat'
import type { ResumedContext } from '../contexts/resumed'
import type { Filter } from '../filters/base'
import type { MessageCreateFilter } from '../filters/message-create'
import type { ControlInteractionFilter } from '../filters/control-interaction'
import type { SelectInteractionFilter } from '../filters/select-interaction'
import type { ModalSubmitFilter } from '../filters/modal-submit'

import { create as messageCreate } from '../filters/message-create'
import { invoke } from '../filters/command-interaction'
import { interaction as controlInteraction } from '../filters/control-interaction'
import { interaction as selectInteraction } from '../filters/select-interaction'
import { submit as modalSubmit } from '../filters/modal-submit'
import { makeFilter } from '../filters/base'
import { EventType } from './types'

/** Event filters for message lifecycle events */
export const message: {
  create: MessageCreateFilter
  edit: Filter<MessageEditContext>
} = {
  create: messageCreate,
  edit: makeFilter<MessageEditContext>(EventType.MessageEdit, () => true),
}

/** Event filter for slash command interactions */
export { invoke }

/** Event filters for button/control interactions */
export const control: {
  interaction: ControlInteractionFilter
} = {
  interaction: controlInteraction,
}

/** Event filters for select menu interactions */
export const select: {
  interaction: SelectInteractionFilter
} = {
  interaction: selectInteraction,
}

/** Event filters for modal form submissions */
export const modal: {
  submit: ModalSubmitFilter
} = {
  submit: modalSubmit,
}

/** Event filters for space member lifecycle events */
export const member: {
  join: Filter<MemberJoinContext>
  leave: Filter<MemberLeaveContext>
  update: Filter<MemberUpdateContext>
} = {
  join: makeFilter<MemberJoinContext>(EventType.MemberJoin, () => true),
  leave: makeFilter<MemberLeaveContext>(EventType.MemberLeave, () => true),
  update: makeFilter<MemberUpdateContext>(EventType.MemberUpdate, () => true),
}

/** Event filters for channel lifecycle events */
export const channel: {
  create: Filter<ChannelCreateContext>
  delete: Filter<ChannelDeleteContext>
} = {
  create: makeFilter<ChannelCreateContext>(EventType.ChannelCreate, () => true),
  delete: makeFilter<ChannelDeleteContext>(EventType.ChannelDelete, () => true),
}

/** Event filters for user presence updates */
export const presence: {
  update: Filter<PresenceUpdateContext>
} = {
  update: makeFilter<PresenceUpdateContext>(EventType.PresenceUpdate, () => true),
}

/** Event filters for bot install/uninstall lifecycle */
export const botLifecycle: {
  installing: Filter<BotInstallingContext>
  uninstalling: Filter<BotUninstallingContext>
} = {
  installing: makeFilter<BotInstallingContext>(EventType.BotInstallingToSpace, () => true),
  uninstalling: makeFilter<BotUninstallingContext>(EventType.BotUninstallingFromSpace, () => true),
}

/** Event filters for typing indicator events */
export const typing: {
  start: Filter<TypingStartContext>
  stop: Filter<TypingStopContext>
} = {
  start: makeFilter<TypingStartContext>(EventType.TypingStart, () => true),
  stop: makeFilter<TypingStopContext>(EventType.TypingStop, () => true),
}

/** Event filters for archetype (role) lifecycle events */
export const archetype: {
  create: Filter<ArchetypeCreateContext>
  update: Filter<ArchetypeUpdateContext>
} = {
  create: makeFilter<ArchetypeCreateContext>(EventType.ArchetypeCreate, () => true),
  update: makeFilter<ArchetypeUpdateContext>(EventType.ArchetypeUpdate, () => true),
}

/** Event filters for message reaction events */
export const reaction: {
  add: Filter<ReactionAddContext>
  remove: Filter<ReactionRemoveContext>
} = {
  add: makeFilter<ReactionAddContext>(EventType.ReactionAdd, () => true),
  remove: makeFilter<ReactionRemoveContext>(EventType.ReactionRemove, () => true),
}

/** Event filter for the initial ready event after connection */
export const ready: Filter<ReadyContext> = makeFilter<ReadyContext>(EventType.Ready, () => true)

/** Event filter for heartbeat keep-alive events */
export const heartbeat: Filter<HeartbeatContext> = makeFilter<HeartbeatContext>(EventType.Heartbeat, () => true)

/** Event filter for session resume events after reconnection */
export const resumed: Filter<ResumedContext> = makeFilter<ResumedContext>(EventType.Resumed, () => true)
