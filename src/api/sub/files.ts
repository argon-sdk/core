import type { BaseApiClient } from '../base'
import type { Snowflake, BotFile } from '../../types'
import type { FileData } from '../files'

import { appendFilePart } from '../files'

/** What an upload will be used for */
export type UploadPurpose = 'attachment' | 'sticker' | 'emoji'

export class FilesApi {
  constructor(private readonly base: BaseApiClient) {}

  /**
   * Uploads a file to use by id within 24 hours (at most 100 unused uploads per bot): attachments
   * (any type, up to 10 MiB) for `messages.send`, stickers/emoji (PNG, WEBP, TGS, Lottie JSON, WEBM)
   * for `expressions.addItem`.
   */
  upload(contents: Blob | FileData, purpose: UploadPurpose = 'attachment'): Promise<BotFile> {
    const form = new FormData()
    appendFilePart(form, 'file', contents)
    form.append('purpose', purpose)

    return this.base.call<BotFile>('IFiles', 1, 'Upload', 'POST', { form })
  }

  /** Describes a file the bot uploaded or owns, or any sticker/emoji file, with a download URL */
  get(fileId: Snowflake): Promise<BotFile> {
    return this.base.call<BotFile>('IFiles', 1, 'Get', 'GET', { query: { fileId } })
  }
}
