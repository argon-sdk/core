import type { Snowflake } from '../primitives'

/** Discriminator values for all message entity types */
export enum EntityType {
  Hashtag = 0,
  Mention = 1,
  MentionEveryone = 2,
  MentionRole = 3,
  Email = 4,
  Url = 5,
  Monospace = 6,
  Quote = 7,
  Spoiler = 8,
  Strikethrough = 9,
  Bold = 10,
  Italic = 11,
  Underline = 12,
  Fraction = 13,
  Ordinal = 14,
  Capitalized = 15,
  SystemCallStarted = 16,
  SystemCallEnded = 17,
  SystemCallTimeout = 18,
  SystemUserJoined = 19,
  Attachment = 20,
}

interface BaseEntity {
  type: EntityType
  offset: number
  length: number
  version: number
}

/** Entity representing a hashtag reference */
export interface HashtagEntity extends BaseEntity {
  type: EntityType.Hashtag
  hashtag: string
}

/** Entity representing a user mention */
export interface MentionEntity extends BaseEntity {
  type: EntityType.Mention
  userId: Snowflake
}

/** Entity representing an everyone mention */
export interface MentionEveryoneEntity extends BaseEntity {
  type: EntityType.MentionEveryone
}

/** Entity representing an archetype (role) mention */
export interface MentionRoleEntity extends BaseEntity {
  type: EntityType.MentionRole
  archetypeId: Snowflake
}

/** Entity representing an email address */
export interface EmailEntity extends BaseEntity {
  type: EntityType.Email
  email: string
}

/** Entity representing a URL link */
export interface UrlEntity extends BaseEntity {
  type: EntityType.Url
  domain: string
  path: string
}

/** Entity representing monospace/code formatting */
export interface MonospaceEntity extends BaseEntity {
  type: EntityType.Monospace
}

/** Entity representing a quoted block */
export interface QuoteEntity extends BaseEntity {
  type: EntityType.Quote
  quotedUserId: Snowflake
}

/** Entity representing spoiler-hidden text */
export interface SpoilerEntity extends BaseEntity {
  type: EntityType.Spoiler
}

/** Entity representing strikethrough formatting */
export interface StrikethroughEntity extends BaseEntity {
  type: EntityType.Strikethrough
}

/** Entity representing bold formatting */
export interface BoldEntity extends BaseEntity {
  type: EntityType.Bold
}

/** Entity representing italic formatting */
export interface ItalicEntity extends BaseEntity {
  type: EntityType.Italic
}

/** Entity representing underline formatting */
export interface UnderlineEntity extends BaseEntity {
  type: EntityType.Underline
  colour: number
}

/** Entity representing a fraction display */
export interface FractionEntity extends BaseEntity {
  type: EntityType.Fraction
  numerator: number
  denominator: number
}

/** Entity representing ordinal number formatting */
export interface OrdinalEntity extends BaseEntity {
  type: EntityType.Ordinal
}

/** Entity representing capitalized text formatting */
export interface CapitalizedEntity extends BaseEntity {
  type: EntityType.Capitalized
}

/** System entity indicating a voice call was started */
export interface SystemCallStartedEntity extends BaseEntity {
  type: EntityType.SystemCallStarted
  callerId: Snowflake
  callId: Snowflake
}

/** System entity indicating a voice call ended */
export interface SystemCallEndedEntity extends BaseEntity {
  type: EntityType.SystemCallEnded
  callerId: Snowflake
  callId: Snowflake
  durationSeconds: number
}

/** System entity indicating a voice call timed out */
export interface SystemCallTimeoutEntity extends BaseEntity {
  type: EntityType.SystemCallTimeout
  callerId: Snowflake
  callId: Snowflake
}

/** System entity indicating a user joined the space */
export interface SystemUserJoinedEntity extends BaseEntity {
  type: EntityType.SystemUserJoined
  userId: Snowflake
  inviterId: Snowflake | null
}

/** Entity representing a file attachment */
export interface AttachmentEntity extends BaseEntity {
  type: EntityType.Attachment
  fileId: Snowflake
  fileName: string
  fileSize: number
  contentType: string
  width: number | null
  height: number | null
  thumbHash: string | null
}

/** Union of all possible message entity types */
export type MessageEntity =
  | HashtagEntity
  | MentionEntity
  | MentionEveryoneEntity
  | MentionRoleEntity
  | EmailEntity
  | UrlEntity
  | MonospaceEntity
  | QuoteEntity
  | SpoilerEntity
  | StrikethroughEntity
  | BoldEntity
  | ItalicEntity
  | UnderlineEntity
  | FractionEntity
  | OrdinalEntity
  | CapitalizedEntity
  | SystemCallStartedEntity
  | SystemCallEndedEntity
  | SystemCallTimeoutEntity
  | SystemUserJoinedEntity
  | AttachmentEntity
