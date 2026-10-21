import type { ApiClient, BotCommand } from '../api/client'
import type { BuiltCommand } from './builder'
import type { Snowflake } from '../types'

import { CommandOptionType } from '../events/types'

const OPTION_TYPES = {
  string: CommandOptionType.String,
  integer: CommandOptionType.Integer,
  boolean: CommandOptionType.Boolean,
  user: CommandOptionType.User,
  channel: CommandOptionType.Channel,
  role: CommandOptionType.Role,
  number: CommandOptionType.Number,
} as const

function nonEmpty<T extends Record<string, unknown>>(obj: T): T | undefined {
  return Object.keys(obj).length > 0 ? obj : undefined
}

function commandToRegisterParams(c: BuiltCommand, spaceId?: Snowflake | null) {
  return {
    name: c.name,
    description: c.description,
    nameLocalizations: nonEmpty(c.nameLocalizations),
    descriptionLocalizations: nonEmpty(c.descriptionLocalizations),
    spaceId: spaceId ?? null,
    options: c.options.map((o) => ({
      name: o.key,
      description: o.meta.description,
      nameLocalizations: nonEmpty(o.nameLocalizations),
      descriptionLocalizations: nonEmpty(o.descriptionLocalizations),
      type: OPTION_TYPES[o.meta.type],
      required: o.meta.required,
      choices: o.meta.choices
        ? Object.entries(o.meta.choices).map(([choiceKey, value]) => ({
            name: o.choiceLocalizations[choiceKey]?.name ?? choiceKey,
            value,
            nameLocalizations: nonEmpty(o.choiceLocalizations[choiceKey]?.nameLocalizations ?? {}),
          }))
        : undefined,
    })),
  }
}

/** Normalizes a JSON-like value so key order, `null`, `undefined` and empty containers don't count as changes */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonical)
  }

  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}

    for (const key of Object.keys(value).sort()) {
      const item = canonical((value as Record<string, unknown>)[key])

      if (item === undefined || item === null) {
        continue
      }

      if (Array.isArray(item) && item.length === 0) {
        continue
      }

      if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0) {
        continue
      }

      out[key] = item
    }

    return out
  }

  return value
}

function same(a: unknown, b: unknown): boolean {
  // Wrapped, so a top-level null and an empty object compare equal as well
  return JSON.stringify(canonical({ value: a })) === JSON.stringify(canonical({ value: b }))
}

function hasChanged(remote: BotCommand, local: BuiltCommand, spaceId?: Snowflake | null): boolean {
  return (
    remote.description !== local.description ||
    !same(remote.nameLocalizations, local.nameLocalizations) ||
    !same(remote.descriptionLocalizations, local.descriptionLocalizations) ||
    !same(remote.options, commandToRegisterParams(local, spaceId).options)
  )
}

export async function syncCommands(
  api: ApiClient,
  commands: BuiltCommand[],
  spaceId?: Snowflake | null,
): Promise<void> {
  const { commands: existing } = spaceId ? await api.commands.listForSpace(spaceId) : await api.commands.list()

  const existingByName = new Map<string, BotCommand>(existing.map((c) => [c.name, c]))
  const localByName = new Map<string, BuiltCommand>(commands.map((c) => [c.name, c]))

  for (const local of commands) {
    const remote = existingByName.get(local.name)

    if (!remote) {
      await api.commands.register(commandToRegisterParams(local, spaceId))
      continue
    }

    if (hasChanged(remote, local, spaceId)) {
      await api.commands.update({
        commandId: remote.commandId,
        description: local.description,
        nameLocalizations: nonEmpty(local.nameLocalizations),
        descriptionLocalizations: nonEmpty(local.descriptionLocalizations),
        options: commandToRegisterParams(local, spaceId).options,
      })
    }
  }

  for (const remote of existing) {
    if (!localByName.has(remote.name)) {
      await api.commands.delete(remote.commandId)
    }
  }
}
