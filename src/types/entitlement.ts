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
  CreateExpressions: 1n << 15n,

  Connect: 1n << 20n,
  Speak: 1n << 21n,
  Video: 1n << 22n,
  Stream: 1n << 23n,
  CanDrawOnStream: 1n << 24n,
  Broadcast: 1n << 25n,
  UseASIO: 1n << 30n,
  AdditionalStreams: 1n << 31n,

  DisconnectMember: 1n << 40n,
  MoveMember: 1n << 41n,
  BanMember: 1n << 42n,
  MuteMember: 1n << 43n,
  KickMember: 1n << 44n,
  DeafenMember: 1n << 45n,

  ManageChannels: 1n << 50n,
  ManageArchetype: 1n << 51n,
  ManageBots: 1n << 52n,
  ManageEvents: 1n << 53n,
  ManageBehaviour: 1n << 54n,
  ManageServer: 1n << 55n,
  ManageMessages: 1n << 56n,
  ManageExpressions: 1n << 57n,
} as const

/** Name of a single entitlement flag */
export type EntitlementName = Exclude<keyof typeof Entitlement, 'None'>

/** Reads an entitlement mask as sent by the API (decimal string or number) into a bigint */
export function toEntitlementMask(value: bigint | string | number | null | undefined): bigint {
  if (value === null || value === undefined || value === '') {
    return 0n
  }

  return BigInt(value)
}

/** True when `mask` grants every flag in `required` */
export function hasEntitlement(mask: bigint, required: bigint): boolean {
  return (mask & required) === required
}

/** Names of the flags set in `mask`, e.g. `['ViewChannel', 'SendMessages']` */
export function entitlementNames(mask: bigint): EntitlementName[] {
  return (Object.entries(Entitlement) as [keyof typeof Entitlement, bigint][])
    .filter(([name, bit]) => name !== 'None' && (mask & bit) !== 0n)
    .map(([name]) => name as EntitlementName)
}
