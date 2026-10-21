import type { SseEvent } from '../events'
import type { ContextDeps } from './base'

import { BaseContext } from './base'
import { EventType } from '../events'
import { ReadyContext } from './ready'
import { HeartbeatContext } from './heartbeat'
import { ResumedContext } from './resumed'
import { MessageCreateContext } from './message-create'
import { MessageEditContext } from './message-edit'
import { MemberJoinContext } from './member-join'
import { MemberLeaveContext } from './member-leave'
import { MemberUpdateContext } from './member-update'
import { ChannelCreateContext } from './channel-create'
import { ChannelDeleteContext } from './channel-delete'
import { PresenceUpdateContext } from './presence-update'
import { CommandContext } from './command-interaction'
import { ControlInteractionContext } from './control-interaction'
import { SelectInteractionContext } from './select-interaction'
import { ModalSubmitContext } from './modal-submit'
import { BotInstallingContext } from './bot-installing'
import { BotUninstallingContext } from './bot-uninstalling'
import { BotEntitlementsUpdatedContext } from './bot-entitlements-updated'
import { TypingStartContext } from './typing-start'
import { TypingStopContext } from './typing-stop'
import { ArchetypeCreateContext } from './archetype-create'
import { ArchetypeUpdateContext } from './archetype-update'
import { ReactionAddContext } from './reaction-add'
import { ReactionRemoveContext } from './reaction-remove'
import { VoiceJoinContext } from './voice-join'
import { VoiceLeaveContext } from './voice-leave'
import { CallIncomingContext } from './call-incoming'
import { CallEndedContext } from './call-ended'
import { ExpressionsUpdateContext } from './expressions-update'

type ContextClass = new (deps: ContextDeps, eventId: string, payload: any) => BaseContext

const registry = new Map<string, ContextClass>([
  [EventType.Ready, ReadyContext],
  [EventType.Heartbeat, HeartbeatContext],
  [EventType.Resumed, ResumedContext],
  [EventType.MessageCreate, MessageCreateContext],
  [EventType.MessageEdit, MessageEditContext],
  [EventType.MemberJoin, MemberJoinContext],
  [EventType.MemberLeave, MemberLeaveContext],
  [EventType.MemberUpdate, MemberUpdateContext],
  [EventType.ChannelCreate, ChannelCreateContext],
  [EventType.ChannelDelete, ChannelDeleteContext],
  [EventType.PresenceUpdate, PresenceUpdateContext],
  [EventType.CommandInteraction, CommandContext],
  [EventType.ControlInteraction, ControlInteractionContext],
  [EventType.SelectInteraction, SelectInteractionContext],
  [EventType.ModalSubmit, ModalSubmitContext],
  [EventType.BotInstallingToSpace, BotInstallingContext],
  [EventType.BotUninstallingFromSpace, BotUninstallingContext],
  [EventType.BotEntitlementsUpdated, BotEntitlementsUpdatedContext],
  [EventType.TypingStart, TypingStartContext],
  [EventType.TypingStop, TypingStopContext],
  [EventType.ArchetypeCreate, ArchetypeCreateContext],
  [EventType.ArchetypeUpdate, ArchetypeUpdateContext],
  [EventType.ReactionAdd, ReactionAddContext],
  [EventType.ReactionRemove, ReactionRemoveContext],
  [EventType.VoiceJoin, VoiceJoinContext],
  [EventType.VoiceLeave, VoiceLeaveContext],
  [EventType.CallIncoming, CallIncomingContext],
  [EventType.CallEnded, CallEndedContext],
  [EventType.ExpressionsUpdate, ExpressionsUpdateContext],
])

/** Every context class, e.g. to check plugin names against built-in properties */
export const CONTEXT_CLASSES: ReadonlyArray<abstract new (...args: any[]) => BaseContext> = [
  BaseContext,
  ...registry.values(),
]

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
  botEntitlementsUpdated: BotEntitlementsUpdatedContext
  typingStart: TypingStartContext
  typingStop: TypingStopContext
  archetypeCreate: ArchetypeCreateContext
  archetypeUpdate: ArchetypeUpdateContext
  reactionAdd: ReactionAddContext
  reactionRemove: ReactionRemoveContext
  voiceJoin: VoiceJoinContext
  voiceLeave: VoiceLeaveContext
  callIncoming: CallIncomingContext
  callEnded: CallEndedContext
  expressionsUpdate: ExpressionsUpdateContext
}

/** Creates a typed context instance from a raw SSE event; unknown events get a plain {@link BaseContext} */
export function buildContext(deps: ContextDeps, event: SseEvent): BaseContext {
  const Context = registry.get(event.type)

  if (!Context) {
    return new BaseContext(deps, event.id ?? '', event.type, event.data)
  }

  return new Context(deps, event.id ?? '', event.data)
}
