import type { BotMember } from '../api/client'
import type { BuiltCommandOption } from '../commands'
import type { CommandInteractionPayload, CommandOptionValue } from '../events'
import type { Archetype, Channel, Snowflake } from '../types'
import type { ContextDeps } from './base'

import { InteractionContext } from './interaction'
import { EventType } from '../events'
import { ArgonError, HttpError } from '../errors'

/** Context for slash command interaction events */
export class CommandContext extends InteractionContext<CommandInteractionPayload> {
  constructor(deps: ContextDeps, eventId: string, payload: CommandInteractionPayload) {
    super(deps, eventId, EventType.CommandInteraction, payload)
  }

  get commandId(): Snowflake {
    return this.payload.commandId
  }
  get commandName(): string {
    return this.payload.commandName
  }
  /** Options as sent; user/channel/role options carry ids */
  get options(): CommandOptionValue[] {
    return this.payload.options
  }

  /** Option values by name, unresolved (user/channel/role options are ids) */
  get rawOptions(): Record<string, string | number | boolean> {
    return Object.fromEntries(this.payload.options.map((o) => [o.name, o.value]))
  }

  /** Fetches the member, channel or archetype an option points at; `undefined` if absent or gone */
  resolveOption(key: string, type: 'user'): Promise<BotMember | undefined>
  resolveOption(key: string, type: 'channel'): Promise<Channel | undefined>
  resolveOption(key: string, type: 'role'): Promise<Archetype | undefined>
  async resolveOption(
    key: string,
    type: 'user' | 'channel' | 'role',
  ): Promise<BotMember | Channel | Archetype | undefined> {
    const id = this.payload.options.find((o) => o.name === key)?.value

    if (typeof id !== 'string' || id === '') {
      return undefined
    }

    try {
      if (type === 'user') {
        return await this.api.spaces.getMember(this.spaceId, id)
      }

      if (type === 'channel') {
        const { channels } = await this.api.channels.list(this.spaceId)
        return channels.find((c) => c.channelId === id)
      }

      return await this.api.archetypes.get(this.spaceId, id)
    } catch (error) {
      if (error instanceof HttpError && error.statusCode === 404) {
        return undefined
      }

      throw error
    }
  }

  /**
   * @internal Builds the typed `opts` object for a command handler: user/channel/role options are fetched
   * in parallel; a required one that cannot be resolved throws.
   */
  async resolveOptions(options: BuiltCommandOption[]): Promise<Record<string, unknown>> {
    const raw = this.rawOptions

    const entries = await Promise.all(
      options.map(async ({ key, meta }) => {
        if (meta.type !== 'user' && meta.type !== 'channel' && meta.type !== 'role') {
          return [key, raw[key]] as const
        }

        const value = await this.resolveOption(key, meta.type as 'user')

        if (value === undefined && meta.required) {
          throw new ArgonError(`Command /${this.commandName}: could not resolve ${meta.type} option "${key}"`)
        }

        return [key, value] as const
      }),
    )

    return Object.fromEntries(entries)
  }
}
