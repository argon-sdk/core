import type { Snowflake } from '../primitives'

/** Sticker or custom emoji */
export type ExpressionKind = 'sticker' | 'emoji'
/** Storage format of an expression item */
export type ExpressionFormat = 'static' | 'lottie' | 'video'

/** A sticker or custom emoji */
export interface ExpressionItem {
  itemId: Snowflake
  packId: Snowflake
  spaceId: Snowflake
  kind: ExpressionKind
  format: ExpressionFormat
  name: string
  url: string | null
  width: number
  height: number
  fileSize: number
  emoji: string[]
  keywords: string[]
  textColor: boolean
  sortOrder: number
  creatorId: Snowflake | null
  createdByBot: boolean
}

/** A sticker or emoji pack */
export interface ExpressionPack {
  packId: Snowflake
  spaceId: Snowflake
  kind: ExpressionKind
  title: string
  slug: string
  coverItemId: Snowflake | null
  sortOrder: number
  version: number
  items: ExpressionItem[]
  creatorId: Snowflake | null
  createdByBot: boolean
}

/** Kinds of change carried by the `expressionsUpdate` event */
export type ExpressionsDeltaType =
  | 'packUpserted'
  | 'packDeleted'
  | 'itemUpserted'
  | 'itemDeleted'
  | 'packsReordered'
  | 'itemsReordered'

/** A single change to a space's expressions */
export interface ExpressionsDelta {
  type: ExpressionsDeltaType
  pack: ExpressionPack | null
  item: ExpressionItem | null
  packId: Snowflake | null
  itemId: Snowflake | null
  kind: ExpressionKind | null
  /** New order of pack ids (`packsReordered`) or item ids (`itemsReordered`) */
  ordered: Snowflake[] | null
}

/** Usage against a limit */
export interface QuotaUsage {
  used: number
  max: number
}

/** A space's expression limits, which grow with its boost level */
export interface ExpressionsQuota {
  packs: QuotaUsage
  stickers: QuotaUsage
  emoji: QuotaUsage
  itemsPerPack: { sticker: number; emoji: number }
  boostLevel: number
}

/** An uploaded file */
export interface BotFile {
  fileId: Snowflake
  size: number
  contentType: string
  url: string
  fileName: string | null
}
