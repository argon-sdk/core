/**
 * Module-augmentable map of plugin services available on context.
 *
 * @deprecated Since v1.2, plugins are tracked via the `Bot<TDecorators>` generic
 * — augmenting this interface is no longer required. Kept for backward compatibility
 * with `BaseContext.service<K>()` lookups.
 */
export interface Services {}

/**
 * A named plugin that builds a service instance for dependency injection.
 *
 * @typeParam TName - Literal property name the plugin attaches under (e.g. `'t'`).
 * @typeParam TValue - Value type produced by `build()` (e.g. `FluentHelper`).
 *
 * @example
 * ```ts
 * import { definePlugin, type Plugin } from '@argon-sdk/core'
 *
 * export function locales(t: FluentHelper): Plugin<'t', FluentHelper> {
 *   return definePlugin('t', () => t)
 * }
 * ```
 */
export interface Plugin<TName extends string = string, TValue = unknown> {
  readonly name: TName
  build(): TValue
}
