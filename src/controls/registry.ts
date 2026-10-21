import type { ControlHandler, SelectHandler } from './base'
import type { Row } from './row'

import { CONTROL_HANDLERS, SELECT_HANDLERS } from './base'

/** Default number of inline handlers kept per kind before the oldest are evicted */
export const DEFAULT_MAX_INLINE_HANDLERS = 5_000

/**
 * Holds handlers attached inline with `button(...).on(...)` / `select(...).on(...)`.
 *
 * Handlers are registered whenever their controls are sent (through a context or `bot.api`),
 * live in memory only, and are evicted least-recently-used beyond `maxEntries`. For controls
 * that must keep working after a restart, use a persistent route instead:
 * `bot.on(button.interaction.prefix('vote'), handler)`.
 */
export class ControlRegistry {
  private readonly buttons = new Map<string, ControlHandler>()
  private readonly selects = new Map<string, SelectHandler>()

  constructor(private readonly maxEntries: number = DEFAULT_MAX_INLINE_HANDLERS) {}

  register(rows: Row[]): void {
    for (const row of rows) {
      for (const [id, handler] of row[CONTROL_HANDLERS] ?? []) {
        remember(this.buttons, id, handler, this.maxEntries)
      }

      for (const [id, handler] of row[SELECT_HANDLERS] ?? []) {
        remember(this.selects, id, handler, this.maxEntries)
      }
    }
  }

  button(id: string): ControlHandler | undefined {
    return touch(this.buttons, id)
  }

  select(id: string): SelectHandler | undefined {
    return touch(this.selects, id)
  }

  get size(): number {
    return this.buttons.size + this.selects.size
  }
}

function remember<V>(map: Map<string, V>, key: string, value: V, max: number): void {
  map.delete(key)
  map.set(key, value)

  while (map.size > max) {
    const oldest = map.keys().next().value

    if (oldest === undefined) {
      break
    }

    map.delete(oldest)
  }
}

function touch<V>(map: Map<string, V>, key: string): V | undefined {
  const value = map.get(key)

  if (value !== undefined) {
    map.delete(key)
    map.set(key, value)
  }

  return value
}

/** Generates a control id for handlers attached without an explicit `.id()` */
export function autoControlId(): string {
  return `argon:${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}
