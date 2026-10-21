import type { Snowflake } from '../types'

/** File contents with a name; `Blob`/`File` objects work too */
export interface FileData {
  data: Blob | ArrayBuffer | ArrayBufferView | string
  /** File name shown to users */
  name: string
  contentType?: string
}

/** A file to send: an id from `files.upload()`, a `Blob`/`File`, or raw data with a name */
export type InputFile = Snowflake | Blob | FileData

/** Describes file contents for upload, e.g. `file(await Bun.file('a.png').bytes(), 'a.png')` */
export function file(data: FileData['data'], name: string, contentType?: string): FileData {
  return { data, name, contentType }
}

/** True when `input` carries contents (as opposed to an uploaded file id) */
export function isFileContent(input: InputFile): input is Blob | FileData {
  return typeof input !== 'string'
}

/** Appends `input` to `form` as a file part */
export function appendFilePart(form: FormData, field: string, input: Blob | FileData): void {
  if (input instanceof Blob) {
    const name = (input as Blob & { name?: string }).name || 'file'
    form.append(field, input, name)
    return
  }

  const blob =
    input.data instanceof Blob
      ? input.data
      : new Blob([input.data as Uint8Array], input.contentType ? { type: input.contentType } : {})

  form.append(field, blob, input.name)
}

/** A random id for message de-duplication; kept below 2^53 so it survives JSON round trips */
export function randomMessageId(): string {
  return String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1)
}
