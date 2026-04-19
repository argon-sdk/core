import type { ApiClient, BotMember } from '../api/client'
import type { CommandInteractionPayload } from '../events'
import type { Archetype } from '../types'
import type { Channel } from '../types'
import type { Snowflake, User } from '../types'
import type { RegisterControlHandler, RegisterSelectHandler } from './base'

import { InteractionContext } from './interaction'
import { EventType } from '../events'

/** Context for slash command interaction events */
export class CommandContext extends InteractionContext {
  private readonly payload: CommandInteractionPayload

  constructor(
    api: ApiClient,
    eventId: string,
    payload: CommandInteractionPayload,
    registerControlHandler: RegisterControlHandler,
    registerSelectHandler: RegisterSelectHandler,
    services: Map<string, unknown> = new Map(),
  ) {
    super(api, eventId, EventType.CommandInteraction, registerControlHandler, registerSelectHandler, services)
    this.payload = payload
  }

  get interactionId(): Snowflake {
    return this.payload.interactionId
  }
  get channelId(): Snowflake {
    return this.payload.channelId
  }
  get spaceId(): Snowflake {
    return this.payload.spaceId
  }
  get userId(): Snowflake {
    return this.payload.user.userId
  }
  get user(): User {
    return this.payload.user
  }
  get commandId(): Snowflake {
    return this.payload.commandId
  }
  get commandName(): string {
    return this.payload.commandName
  }

  get rawOptions(): Record<string, unknown> {
    const map: Record<string, unknown> = {}

    for (const opt of this.payload.options) {
      map[opt.name] = opt.value
    }

    return map
  }

  resolveOption(key: string, type: 'user'): Promise<BotMember | undefined>
  resolveOption(key: string, type: 'channel'): Promise<Channel | undefined>
  resolveOption(key: string, type: 'role'): Promise<Archetype | undefined>
  async resolveOption(
    key: string,
    type: 'user' | 'channel' | 'role',
  ): Promise<BotMember | Channel | Archetype | undefined> {
    const id = this.payload.options.find((o) => o.name === key)?.value as Snowflake | undefined

    if (!id) {
      return undefined
    }

    if (type === 'user') {
      return this.api.spaces.getMember(this.spaceId, id).catch(() => undefined)
    }

    if (type === 'channel') {
      const { channels } = await this.api.channels.list(this.spaceId)
      return channels.find((c) => c.channelId === id)
    }

    return this.api.archetypes.get(this.spaceId, id).catch(() => undefined)
  }
}
