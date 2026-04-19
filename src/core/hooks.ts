import type { BaseContext } from '../contexts/base'

/** Lifecycle hooks invoked during bot start, stop, and on unhandled errors */
export interface BotHooks {
  onStart?: () => void | Promise<void>
  onStop?: () => void | Promise<void>
  onError?: (error: Error, ctx?: BaseContext) => void | Promise<void>
}
