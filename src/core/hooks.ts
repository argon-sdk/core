import type { BaseContext } from '../contexts/base'

/** Lifecycle hooks invoked during bot start, stop, and on unhandled errors */
export interface BotHooks {
  /** Called after commands are synced and before the event stream opens */
  onStart?: () => void | Promise<void>
  /** Called once the event stream has closed and in-flight handlers have settled */
  onStop?: () => void | Promise<void>
  /**
   * Called for every error thrown by a handler, with the context of the event being handled.
   * Without this hook errors are logged with `console.error`.
   */
  onError?: (error: Error, ctx?: BaseContext) => void | Promise<void>
}
