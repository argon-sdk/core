import type { Plugin } from './plugin'

/**
 * Authoring helper for typed plugins. Preserves the literal `name` type without
 * forcing `as const`, so `Bot<TDecorators>.plugin(...)` can accumulate the
 * plugin's shape into the bot's decorator map.
 *
 * @example
 * ```ts
 * import { definePlugin } from '@argon-sdk/core'
 *
 * export const locales = (t: FluentHelper) => definePlugin('t', () => t)
 * // locales(t) : Plugin<'t', FluentHelper>
 * ```
 */
export function definePlugin<TName extends string, TValue>(name: TName, build: () => TValue): Plugin<TName, TValue> {
  return { name, build }
}
