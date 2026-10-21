import type { BaseApiClient } from '../base'
import type { Snowflake, ExpressionItem, ExpressionKind, ExpressionPack, ExpressionsQuota } from '../../types'
import type { InputFile } from '../files'

import { appendFilePart, isFileContent } from '../files'

/** Parameters for `expressions.addItem()` */
export interface AddExpressionItemParams {
  spaceId: Snowflake
  packId: Snowflake
  name: string
  /** PNG, WEBP, TGS, Lottie JSON or WEBM contents, or a file id from `files.upload(…, 'sticker' | 'emoji')` */
  file: InputFile
  emoji?: string[]
  keywords?: string[]
  textColor?: boolean
}

/** Parameters for `expressions.updateItem()`; omitted fields are kept */
export interface UpdateExpressionItemParams {
  spaceId: Snowflake
  itemId: Snowflake
  name?: string
  emoji?: string[]
  keywords?: string[]
  textColor?: boolean
}

/**
 * Stickers and custom emoji of a space. Writes need the CreateExpressions entitlement, and a bot can only
 * change packs and items it created (never delete or reorder).
 */
export class ExpressionsApi {
  constructor(private readonly base: BaseApiClient) {}

  /**
   * Lists the space's packs with their items. Pass the `version` you hold as `known`: `packs` is `null`
   * while it is still current.
   */
  list(spaceId: Snowflake, known?: string): Promise<{ version: string; packs: ExpressionPack[] | null }> {
    return this.base.call('IExpressions', 1, 'List', 'GET', { query: { spaceId, known } })
  }

  /** One pack by id or slug */
  getPack(spaceId: Snowflake, by: { packId: Snowflake } | { slug: string }): Promise<ExpressionPack> {
    return this.base.call<ExpressionPack>('IExpressions', 1, 'GetPack', 'GET', { query: { spaceId, ...by } })
  }

  /** How many packs, stickers and emoji the space holds against its limits */
  getQuota(spaceId: Snowflake): Promise<ExpressionsQuota> {
    return this.base.call<ExpressionsQuota>('IExpressions', 1, 'GetQuota', 'GET', { query: { spaceId } })
  }

  /** Creates a pack; repeating it with the slug of a pack this bot made returns that pack */
  createPack(params: {
    spaceId: Snowflake
    kind: ExpressionKind
    title: string
    slug: string
  }): Promise<ExpressionPack> {
    return this.base.call<ExpressionPack>('IExpressions', 1, 'CreatePack', 'POST', { body: params, idempotent: true })
  }

  /** Changes the title or cover of a pack this bot made; omitted fields are kept */
  updatePack(params: {
    spaceId: Snowflake
    packId: Snowflake
    title?: string
    coverItemId?: Snowflake
  }): Promise<ExpressionPack> {
    return this.base.call<ExpressionPack>('IExpressions', 1, 'UpdatePack', 'PATCH', { body: params, idempotent: true })
  }

  /** Adds a sticker or emoji to a pack. Each call adds a new item */
  addItem(params: AddExpressionItemParams): Promise<ExpressionItem> {
    const form = new FormData()
    form.append('spaceId', params.spaceId)
    form.append('packId', params.packId)
    form.append('name', params.name)

    if (isFileContent(params.file)) {
      appendFilePart(form, 'file', params.file)
    } else {
      form.append('file', params.file)
    }

    if (params.emoji) {
      form.append('emoji', JSON.stringify(params.emoji))
    }

    if (params.keywords) {
      form.append('keywords', JSON.stringify(params.keywords))
    }

    if (params.textColor !== undefined) {
      form.append('textColor', String(params.textColor))
    }

    return this.base.call<ExpressionItem>('IExpressions', 1, 'AddItem', 'POST', { form })
  }

  /** Changes an item this bot made; omitted fields are kept */
  updateItem(params: UpdateExpressionItemParams): Promise<ExpressionItem> {
    return this.base.call<ExpressionItem>('IExpressions', 1, 'UpdateItem', 'PATCH', { body: params, idempotent: true })
  }
}
