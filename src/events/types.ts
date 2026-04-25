import type { Snowflake } from '../types'
import type { Message } from '../types'
import type { Channel } from '../types'
import type { Archetype } from '../types'
import type { User } from '../types'

/** All supported SSE event type identifiers */
export const EventType = {
  Ready: 'ready',
  Heartbeat: 'heartbeat',
  Resumed: 'resumed',
  MessageCreate: 'messageCreate',
  MessageEdit: 'messageEdit',
  MemberJoin: 'memberJoin',
  MemberLeave: 'memberLeave',
  MemberUpdate: 'memberUpdate',
  ChannelCreate: 'channelCreate',
  ChannelDelete: 'channelDelete',
  PresenceUpdate: 'presenceUpdate',
  CommandInteraction: 'commandInteraction',
  BotInstallingToSpace: 'botInstallingToSpace',
  BotUninstallingFromSpace: 'botUninstallingFromSpace',
  ControlInteraction: 'controlInteraction',
  SelectInteraction: 'selectInteraction',
  ModalSubmit: 'modalSubmit',
  TypingStart: 'typingStart',
  TypingStop: 'typingStop',
  ArchetypeCreate: 'archetypeCreate',
  ArchetypeUpdate: 'archetypeUpdate',
  ReactionAdd: 'reactionAdd',
  ReactionRemove: 'reactionRemove',
  BotEntitlementsUpdated: 'botEntitlementsUpdated',
  VoiceJoin: 'voiceJoin',
  VoiceLeave: 'voiceLeave',
  CallIncoming: 'callIncoming',
  CallEnded: 'callEnded',
} as const

/** Union of all event type string literals */
export type EventType = (typeof EventType)[keyof typeof EventType]

/** Alias for EventType used in SSE transport */
export type SseEventType = EventType

/** Payload received when a user interacts with a button or control */
export interface ControlInteractionPayload {
  interactionId: Snowflake
  controlId: string
  controlType: string
  messageId: string
  channelId: Snowflake
  spaceId: Snowflake
  user: User
}

/** A single resolved option value from a command interaction */
export interface CommandOptionValue {
  name: string
  type: string
  value: unknown
}

/** Payload received when a user invokes a slash command */
export interface CommandInteractionPayload {
  interactionId: Snowflake
  commandId: Snowflake
  commandName: string
  spaceId: Snowflake
  channelId: Snowflake
  user: User
  options: CommandOptionValue[]
}

/** Payload received when a new message is created */
export interface MessageCreatePayload {
  channelId: Snowflake
  spaceId: Snowflake
  message: Message
}

/** Payload received when a message is edited */
export interface MessageEditPayload {
  messageId: Snowflake
  channelId: Snowflake
  spaceId: Snowflake
}

/** Payload received when a member joins a space */
export interface MemberJoinPayload {
  spaceId: Snowflake
  user: User
}

/** Payload received when a member leaves a space */
export interface MemberLeavePayload {
  spaceId: Snowflake
  userId: Snowflake
}

/** Payload received when a member's profile is updated */
export interface MemberUpdatePayload {
  spaceId: Snowflake
  user: User
}

/** Payload received when a channel is created */
export interface ChannelCreatePayload {
  spaceId: Snowflake
  data: Channel
}

/** Payload received when a channel is deleted */
export interface ChannelDeletePayload {
  spaceId: Snowflake
  channelId: Snowflake
}

/** Payload received when a user starts or stops typing */
export interface TypingPayload {
  spaceId: Snowflake
  channelId: Snowflake
  userId: Snowflake
}

/** Payload received when an archetype (role) is created or updated */
export interface ArchetypeEventPayload {
  archetype: Archetype
  spaceId: Snowflake
}

/** Payload received for bot install/uninstall lifecycle events */
export interface BotSpacePayload {
  spaceId: Snowflake
}

/** Payload received when the bot's required entitlements diverge from a space's granted set */
export interface BotEntitlementsUpdatedPayload {
  grantedEntitlements: EntitlementName
  requiredEntitlements: EntitlementName
  spaceId: Snowflake
}

/** Payload received when a user interacts with a select menu */
export interface SelectInteractionPayload {
  interactionId: Snowflake
  controlId: string
  controlType: string
  messageId: string
  channelId: Snowflake
  spaceId: Snowflake
  user: User
  values: string[]
}

/** Payload received when a user submits a modal form */
export interface ModalSubmitPayload {
  interactionId: Snowflake
  modalInteractionId: Snowflake
  channelId: Snowflake
  spaceId: Snowflake
  user: User
  values: Record<string, string>
}

/** Wire-format string-enum names for entitlements (matches the API enum, distinct from the BigInt bitmask `Entitlement`) */
export type EntitlementName =
  | 'none'
  | 'viewChannel'
  | 'readHistory'
  | 'joinToVoice'
  | 'sendMessages'
  | 'sendVoice'
  | 'attachFiles'
  | 'addReactions'
  | 'anyMentions'
  | 'mentionEveryone'
  | 'externalEmoji'
  | 'externalStickers'
  | 'useCommands'
  | 'postEmbeddedLinks'
  | 'connect'
  | 'speak'
  | 'video'
  | 'stream'
  | 'useASIO'
  | 'additionalStreams'
  | 'disconnectMember'
  | 'moveMember'
  | 'banMember'
  | 'muteMember'
  | 'kickMember'
  | 'manageChannels'
  | 'manageArchetype'
  | 'manageBots'
  | 'manageEvents'
  | 'manageBehaviour'
  | 'manageServer'

/** Per-space membership info delivered in the Ready event */
export interface BotSpaceInfo {
  spaceId: Snowflake
  grantedEntitlements: EntitlementName
  pendingApproval: boolean
}

/** Possible user presence statuses */
export type PresenceStatus = 'offline' | 'online' | 'away' | 'inGame' | 'listen' | 'touchGrass' | 'doNotDisturb'

/** Kind of activity a user is currently engaged in */
export type ActivityKind = 'game' | 'software' | 'streaming' | 'listen'

/** Describes a user's current activity */
export interface PresenceActivity {
  kind: ActivityKind
  startTimestampSeconds: number
  titleName: string
}

/** Bot or user presence with status and optional activity */
export interface BotPresence {
  activity: PresenceActivity
  status: PresenceStatus
}

/** Payload received when a user's presence changes */
export interface PresenceUpdatePayload {
  presence: BotPresence
  spaceId: Snowflake
  user: User
}

/** Payload received when a reaction is added or removed */
export interface ReactionPayload {
  channelId: Snowflake
  emoji: string
  messageId: Snowflake
  spaceId: Snowflake
  userId: Snowflake
}

/** Payload received when a user joins a voice channel */
export interface VoiceJoinPayload {
  spaceId: Snowflake
  channelId: Snowflake
  user: User
}

/** Payload received when a user leaves a voice channel */
export interface VoiceLeavePayload {
  spaceId: Snowflake
  channelId: Snowflake
  user: User
}

/** Payload received when a verified bot is being called */
export interface CallIncomingPayload {
  callId: Snowflake
  fromUserId: Snowflake
}

/** Payload received when an active call ends */
export interface CallEndedPayload {
  callId: Snowflake
}

/** Payload received on initial SSE connection */
export interface ReadyPayload {
  intents: number
  spaces: BotSpaceInfo[]
}

/** Maps each event type string to its corresponding payload type */
export interface SseEventMap {
  ready: ReadyPayload
  heartbeat: null
  resumed: null

  messageCreate: MessageCreatePayload
  messageEdit: MessageEditPayload

  memberJoin: MemberJoinPayload
  memberLeave: MemberLeavePayload
  memberUpdate: MemberUpdatePayload

  channelCreate: ChannelCreatePayload
  channelDelete: ChannelDeletePayload

  presenceUpdate: PresenceUpdatePayload

  commandInteraction: CommandInteractionPayload
  controlInteraction: ControlInteractionPayload
  selectInteraction: SelectInteractionPayload
  modalSubmit: ModalSubmitPayload

  botInstallingToSpace: BotSpacePayload
  botUninstallingFromSpace: BotSpacePayload
  botEntitlementsUpdated: BotEntitlementsUpdatedPayload

  typingStart: TypingPayload
  typingStop: TypingPayload

  archetypeCreate: ArchetypeEventPayload
  archetypeUpdate: ArchetypeEventPayload

  reactionAdd: ReactionPayload
  reactionRemove: ReactionPayload

  voiceJoin: VoiceJoinPayload
  voiceLeave: VoiceLeavePayload

  callIncoming: CallIncomingPayload
  callEnded: CallEndedPayload
}

/** A single SSE event with typed payload */
export interface SseEvent<T extends keyof SseEventMap = keyof SseEventMap> {
  id: string
  type: T
  data: SseEventMap[T]
  spaceId: Snowflake | null
  channelId: Snowflake | null
}
