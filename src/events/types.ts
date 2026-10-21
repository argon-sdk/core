import type {
  Snowflake,
  Message,
  ChannelInfo,
  Archetype,
  User,
  VoiceState,
  BotPresence,
  ExpressionsDelta,
} from '../types'

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
  ExpressionsUpdate: 'expressionsUpdate',
} as const

/** Union of all event type string literals */
export type EventType = (typeof EventType)[keyof typeof EventType]

/** Alias for EventType used in SSE transport */
export type SseEventType = EventType

/** Fields shared by all interaction events */
interface InteractionPayloadBase {
  interactionId: Snowflake
  channelId: Snowflake
  spaceId: Snowflake
  user: User
  /** Present when the user is in a voice channel */
  voiceState: VoiceState | null
}

/** Payload received when a user clicks a callback button */
export interface ControlInteractionPayload extends InteractionPayloadBase {
  /** Always `0` (button) */
  controlType: number
  messageId: Snowflake
  /** The button's id */
  controlId: string
}

/** Command option type values as sent on the wire */
export const CommandOptionType = {
  String: 0,
  Integer: 1,
  Boolean: 2,
  User: 3,
  Channel: 4,
  Role: 5,
  Number: 6,
} as const

/** A single option value from a command interaction */
export interface CommandOptionValue {
  name: string
  type: number
  /** Integer/Number/Boolean values are parsed; user/channel/role values are ids */
  value: string | number | boolean
}

/** Payload received when a user invokes a slash command */
export interface CommandInteractionPayload extends InteractionPayloadBase {
  commandId: Snowflake
  commandName: string
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
  /** New text; entities and controls are not reported */
  text: string | null
  /** ISO-8601 timestamp */
  updatedAt: string
}

/** Payload received when a member joins a space, or their profile changes */
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
  channel: ChannelInfo
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
  /** `typingStart` only, upper case on the wire: `TYPING`, `THINKING`, `UPLOADING`, `SEARCHING` */
  kind?: string | null
}

/** Payload received when an archetype (role) is created or updated */
export interface ArchetypeEventPayload {
  /** `permissions` is always `null` in events */
  archetype: Omit<Archetype, 'permissions'> & { permissions: null }
  spaceId: Snowflake
}

/** Payload received for bot install/uninstall lifecycle events */
export interface BotSpacePayload {
  spaceId: Snowflake
}

/** Payload received when the bot's required entitlements exceed a space's granted set (also on every connect) */
export interface BotEntitlementsUpdatedPayload {
  /** Entitlement bitmask as a decimal string */
  grantedEntitlements: string
  /** Entitlement bitmask as a decimal string */
  requiredEntitlements: string
  spaceId: Snowflake
}

/** Payload received when a user submits a select menu */
export interface SelectInteractionPayload extends InteractionPayloadBase {
  /** 1 string, 2 user, 3 archetype, 4 channel select */
  controlType: number
  /** The select's custom id */
  customId: string
  messageId: Snowflake
  /** Option values, or user/archetype/channel ids */
  values: string[]
}

/** One answered component of a submitted modal */
export interface ModalSubmitValue {
  customId: string
  /** Exactly one value; checkboxes report `"true"` / `"false"` */
  values: string[]
}

/** Payload received when a user submits a modal form */
export interface ModalSubmitPayload {
  /** Not usable with ack/defer/modal */
  interactionId: Snowflake
  /** The `modalInteractionId` returned by `IInteractions/Modal` (not the modal's own custom id) */
  customId: string
  channelId: Snowflake
  spaceId: Snowflake
  user: User
  values: ModalSubmitValue[]
  voiceState: VoiceState | null
}

/** Space membership info delivered in the Ready event */
export interface BotSpaceInfo {
  spaceId: Snowflake
  /** Entitlement bitmask as a decimal string */
  grantedEntitlements: string
  pendingApproval: boolean
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
  messageId: Snowflake
  spaceId: Snowflake
  userId: Snowflake
  /** Unicode emoji, or `:name:` for a custom emoji */
  emoji: string
  /** Set for custom emoji */
  customEmojiId: Snowflake | null
  emojiName: string | null
  /** `null` once the custom emoji was deleted */
  emojiUrl: string | null
}

/** Payload received when a user joins or leaves a voice channel */
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
  /** The caller's language, for picking a voice */
  fromLocale: string | null
}

/** Payload received when an active call ends */
export interface CallEndedPayload {
  callId: Snowflake
}

/** Payload received when a space's stickers or custom emoji change */
export interface ExpressionsUpdatePayload {
  spaceId: Snowflake
  version: string
  /** Apply `delta` only if this equals the version you hold; otherwise re-read `expressions.list()` */
  baseVersion: string | null
  delta: ExpressionsDelta | null
}

/** Payload received on connection */
export interface ReadyPayload {
  intents: number
  spaces: BotSpaceInfo[]
}

/** Payload of the keep-alive sent after 30 s without events */
export interface HeartbeatPayload {
  /** Milliseconds since the Argon epoch, 2025-01-01T00:00:00Z */
  timestamp: number
}

/** Payload of the resume notification (defined by the API, not currently sent by the server) */
export interface ResumedPayload {
  replayedCount: number
}

/** Maps each event type string to its corresponding payload type */
export interface SseEventMap {
  ready: ReadyPayload
  heartbeat: HeartbeatPayload
  resumed: ResumedPayload

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

  expressionsUpdate: ExpressionsUpdatePayload
}

/** A single SSE event with typed payload */
export interface SseEvent<T extends keyof SseEventMap = keyof SseEventMap> {
  /** Opaque cursor; not usable for resuming */
  id: string
  type: T
  data: SseEventMap[T]
}
