import type { ApiClient, BotCommand } from '../api/client'
import type { BuiltCommand } from './builder'
import type { Snowflake } from '../types'

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
      type: o.meta.type,
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

function hasChanged(remote: BotCommand, local: BuiltCommand, spaceId?: Snowflake | null): boolean {
  if (remote.description !== local.description) {
    return true
  }

  if (JSON.stringify(remote.nameLocalizations ?? {}) !== JSON.stringify(local.nameLocalizations)) {
    return true
  }

  if (JSON.stringify(remote.descriptionLocalizations ?? {}) !== JSON.stringify(local.descriptionLocalizations)) {
    return true
  }

  const remoteOptions = JSON.stringify(remote.options)
  const localOptions = JSON.stringify(commandToRegisterParams(local, spaceId).options)

  return remoteOptions !== localOptions
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
