import type { ApiClient } from '../api/client'
import type { SseEvent, SseEventMap } from '../events'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'
import { MessageCreateContext } from './message-create'
import { MessageEditContext } from './message-edit'
import { ControlInteractionContext } from './control-interaction'
import { CommandContext } from './command-interaction'
import { SelectInteractionContext } from './select-interaction'
import { ModalSubmitContext } from './modal-submit'
import { MemberJoinContext } from './member-join'
import { MemberLeaveContext } from './member-leave'
import { MemberUpdateContext } from './member-update'
import { ChannelCreateContext } from './channel-create'
import { ChannelDeleteContext } from './channel-delete'
import { PresenceUpdateContext } from './presence-update'
import { BotInstallingContext } from './bot-installing'
import { BotUninstallingContext } from './bot-uninstalling'
import { BotEntitlementsUpdatedContext } from './bot-entitlements-updated'
import { TypingStartContext } from './typing-start'
import { TypingStopContext } from './typing-stop'
import { ArchetypeCreateContext } from './archetype-create'
import { ArchetypeUpdateContext } from './archetype-update'
import { ReactionAddContext } from './reaction-add'
import { ReactionRemoveContext } from './reaction-remove'
import { ReadyContext } from './ready'
import { HeartbeatContext } from './heartbeat'
import { ResumedContext } from './resumed'
import { VoiceJoinContext } from './voice-join'
import { VoiceLeaveContext } from './voice-leave'
import { CallIncomingContext } from './call-incoming'
import { CallEndedContext } from './call-ended'

import type {
  MessageCreatePayload,
  MessageEditPayload,
  ControlInteractionPayload,
  CommandInteractionPayload,
  SelectInteractionPayload,
  ModalSubmitPayload,
  MemberJoinPayload,
  MemberLeavePayload,
  MemberUpdatePayload,
  ChannelCreatePayload,
  ChannelDeletePayload,
  TypingPayload,
  BotSpacePayload,
  ArchetypeEventPayload,
  ReactionPayload,
  PresenceUpdatePayload,
  ReadyPayload,
  BotEntitlementsUpdatedPayload,
  VoiceJoinPayload,
  VoiceLeavePayload,
  CallIncomingPayload,
  CallEndedPayload,
} from '../events'

type ContextFactory = (
  api: ApiClient,
  eventId: string,
  data: SseEventMap[keyof SseEventMap],
  registerControlHandler: RegisterControlHandler,
  registerSelectHandler: RegisterSelectHandler,
  services: Map<string, unknown>,
) => BaseContext

const registry = new Map<string, ContextFactory>([
  [
    EventType.Ready,
    (api, id, data, rch, rsh, services) => new ReadyContext(api, id, data as ReadyPayload, rch, rsh, services),
  ],

  [EventType.Heartbeat, (api, id, _data, rch, rsh, services) => new HeartbeatContext(api, id, rch, rsh, services)],

  [EventType.Resumed, (api, id, _data, rch, rsh, services) => new ResumedContext(api, id, rch, rsh, services)],

  [
    EventType.MessageCreate,
    (api, id, data, rch, rsh, services) =>
      new MessageCreateContext(api, id, (data as MessageCreatePayload).message, rch, rsh, services),
  ],

  [
    EventType.MessageEdit,
    (api, id, data, rch, rsh, services) =>
      new MessageEditContext(api, id, data as MessageEditPayload, rch, rsh, services),
  ],

  [
    EventType.MemberJoin,
    (api, id, data, rch, rsh, services) =>
      new MemberJoinContext(api, id, data as MemberJoinPayload, rch, rsh, services),
  ],

  [
    EventType.MemberLeave,
    (api, id, data, rch, rsh, services) =>
      new MemberLeaveContext(api, id, data as MemberLeavePayload, rch, rsh, services),
  ],

  [
    EventType.MemberUpdate,
    (api, id, data, rch, rsh, services) =>
      new MemberUpdateContext(api, id, data as MemberUpdatePayload, rch, rsh, services),
  ],

  [
    EventType.ChannelCreate,
    (api, id, data, rch, rsh, services) =>
      new ChannelCreateContext(api, id, data as ChannelCreatePayload, rch, rsh, services),
  ],

  [
    EventType.ChannelDelete,
    (api, id, data, rch, rsh, services) =>
      new ChannelDeleteContext(api, id, data as ChannelDeletePayload, rch, rsh, services),
  ],

  [
    EventType.PresenceUpdate,
    (api, id, data, rch, rsh, services) =>
      new PresenceUpdateContext(api, id, data as PresenceUpdatePayload, rch, rsh, services),
  ],

  [
    EventType.CommandInteraction,
    (api, id, data, rch, rsh, services) =>
      new CommandContext(api, id, data as CommandInteractionPayload, rch, rsh, services),
  ],

  [
    EventType.ControlInteraction,
    (api, id, data, rch, rsh, services) =>
      new ControlInteractionContext(api, id, data as ControlInteractionPayload, rch, rsh, services),
  ],

  [
    EventType.SelectInteraction,
    (api, id, data, rch, rsh, services) =>
      new SelectInteractionContext(api, id, data as SelectInteractionPayload, rch, rsh, services),
  ],

  [
    EventType.ModalSubmit,
    (api, id, data, rch, rsh, services) =>
      new ModalSubmitContext(api, id, data as ModalSubmitPayload, rch, rsh, services),
  ],

  [
    EventType.BotInstallingToSpace,
    (api, id, data, rch, rsh, services) =>
      new BotInstallingContext(api, id, data as BotSpacePayload, rch, rsh, services),
  ],

  [
    EventType.BotUninstallingFromSpace,
    (api, id, data, rch, rsh, services) =>
      new BotUninstallingContext(api, id, data as BotSpacePayload, rch, rsh, services),
  ],

  [
    EventType.TypingStart,
    (api, id, data, rch, rsh, services) => new TypingStartContext(api, id, data as TypingPayload, rch, rsh, services),
  ],

  [
    EventType.TypingStop,
    (api, id, data, rch, rsh, services) => new TypingStopContext(api, id, data as TypingPayload, rch, rsh, services),
  ],

  [
    EventType.ArchetypeCreate,
    (api, id, data, rch, rsh, services) =>
      new ArchetypeCreateContext(api, id, data as ArchetypeEventPayload, rch, rsh, services),
  ],

  [
    EventType.ArchetypeUpdate,
    (api, id, data, rch, rsh, services) =>
      new ArchetypeUpdateContext(api, id, data as ArchetypeEventPayload, rch, rsh, services),
  ],

  [
    EventType.ReactionAdd,
    (api, id, data, rch, rsh, services) => new ReactionAddContext(api, id, data as ReactionPayload, rch, rsh, services),
  ],

  [
    EventType.ReactionRemove,
    (api, id, data, rch, rsh, services) =>
      new ReactionRemoveContext(api, id, data as ReactionPayload, rch, rsh, services),
  ],

  [
    EventType.BotEntitlementsUpdated,
    (api, id, data, rch, rsh, services) =>
      new BotEntitlementsUpdatedContext(api, id, data as BotEntitlementsUpdatedPayload, rch, rsh, services),
  ],

  [
    EventType.VoiceJoin,
    (api, id, data, rch, rsh, services) => new VoiceJoinContext(api, id, data as VoiceJoinPayload, rch, rsh, services),
  ],

  [
    EventType.VoiceLeave,
    (api, id, data, rch, rsh, services) =>
      new VoiceLeaveContext(api, id, data as VoiceLeavePayload, rch, rsh, services),
  ],

  [
    EventType.CallIncoming,
    (api, id, data, rch, rsh, services) =>
      new CallIncomingContext(api, id, data as CallIncomingPayload, rch, rsh, services),
  ],

  [
    EventType.CallEnded,
    (api, id, data, rch, rsh, services) => new CallEndedContext(api, id, data as CallEndedPayload, rch, rsh, services),
  ],
])

/** Maps event type names to their corresponding context classes */
export interface ContextMap {
  ready: ReadyContext
  heartbeat: HeartbeatContext
  resumed: ResumedContext
  messageCreate: MessageCreateContext
  messageEdit: MessageEditContext
  memberJoin: MemberJoinContext
  memberLeave: MemberLeaveContext
  memberUpdate: MemberUpdateContext
  channelCreate: ChannelCreateContext
  channelDelete: ChannelDeleteContext
  presenceUpdate: PresenceUpdateContext
  commandInteraction: CommandContext
  controlInteraction: ControlInteractionContext
  selectInteraction: SelectInteractionContext
  modalSubmit: ModalSubmitContext
  botInstallingToSpace: BotInstallingContext
  botUninstallingFromSpace: BotUninstallingContext
  typingStart: TypingStartContext
  typingStop: TypingStopContext
  archetypeCreate: ArchetypeCreateContext
  archetypeUpdate: ArchetypeUpdateContext
  reactionAdd: ReactionAddContext
  reactionRemove: ReactionRemoveContext
  botEntitlementsUpdated: BotEntitlementsUpdatedContext
  voiceJoin: VoiceJoinContext
  voiceLeave: VoiceLeaveContext
  callIncoming: CallIncomingContext
  callEnded: CallEndedContext
}

/** Creates a typed context instance from a raw SSE event */
export function buildContext(
  api: ApiClient,
  event: SseEvent,
  registerControlHandler: RegisterControlHandler,
  registerSelectHandler: RegisterSelectHandler,
  services: Map<string, unknown> = new Map(),
): BaseContext {
  const factory = registry.get(event.type)

  if (!factory) {
    return new BaseContext(api, event.id ?? '', event.type, registerControlHandler, registerSelectHandler, services)
  }

  return factory(api, event.id ?? '', event.data, registerControlHandler, registerSelectHandler, services)
}
