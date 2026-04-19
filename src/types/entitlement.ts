/** BigInt bitfield flags representing channel and space permissions */
export const Entitlement = {
  None: 0n,

  ViewChannel: 1n << 0n,
  ReadHistory: 1n << 1n,
  JoinToVoice: 1n << 2n,
  SendMessages: 1n << 5n,
  SendVoice: 1n << 6n,
  AttachFiles: 1n << 7n,
  AddReactions: 1n << 8n,
  AnyMentions: 1n << 9n,
  MentionEveryone: 1n << 10n,
  ExternalEmoji: 1n << 11n,
  ExternalStickers: 1n << 12n,
  UseCommands: 1n << 13n,
  PostEmbeddedLinks: 1n << 14n,

  Connect: 1n << 20n,
  Speak: 1n << 21n,
  Video: 1n << 22n,
  Stream: 1n << 23n,
  UseASIO: 1n << 30n,
  AdditionalStreams: 1n << 31n,

  DisconnectMember: 1n << 40n,
  MoveMember: 1n << 41n,
  BanMember: 1n << 42n,
  MuteMember: 1n << 43n,
  KickMember: 1n << 44n,

  ManageChannels: 1n << 50n,
  ManageArchetype: 1n << 51n,
  ManageBots: 1n << 52n,
  ManageEvents: 1n << 53n,
  ManageBehaviour: 1n << 54n,
  ManageServer: 1n << 55n,
} as const
