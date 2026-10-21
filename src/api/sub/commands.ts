import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** Defines a single option for a slash command */
export interface CommandOption {
  name: string
  description: string
  nameLocalizations?: Record<string, string>
  descriptionLocalizations?: Record<string, string>
  /** A `CommandOptionType` value: String 0, Integer 1, Boolean 2, User 3, Channel 4, Role 5, Number 6 */
  type: number
  required?: boolean
  choices?:
    | {
        name: string
        value: unknown
        nameLocalizations?: Record<string, string>
      }[]
    | null
  subOptions?: CommandOption[] | null
}

/** Parameters for registering a slash command (an upsert by name and scope). Names are 1–32 characters and lower-cased */
export interface RegisterCommandParams {
  name: string
  description: string
  nameLocalizations?: Record<string, string>
  descriptionLocalizations?: Record<string, string>
  spaceId?: Snowflake | null
  options?: CommandOption[]
  defaultPermission?: boolean | null
}

/** Parameters for updating an existing slash command */
export interface UpdateCommandParams {
  commandId: Snowflake
  description: string
  nameLocalizations?: Record<string, string>
  descriptionLocalizations?: Record<string, string>
  options?: CommandOption[]
  defaultPermission?: boolean | null
}

/** Represents a registered bot slash command */
export interface BotCommand {
  commandId: Snowflake
  name: string
  description: string
  nameLocalizations?: Record<string, string>
  descriptionLocalizations?: Record<string, string>
  spaceId: Snowflake | null
  defaultPermission: boolean
  options: CommandOption[]
}

export class CommandsApi {
  constructor(private readonly base: BaseApiClient) {}

  list(): Promise<{ commands: BotCommand[] }> {
    return this.base.call<{ commands: BotCommand[] }>('ICommands', 1, 'List', 'GET')
  }

  listForSpace(spaceId: Snowflake): Promise<{ commands: BotCommand[] }> {
    return this.base.call<{ commands: BotCommand[] }>('ICommands', 1, 'ListForSpace', 'GET', {
      query: { spaceId },
    })
  }

  register(params: RegisterCommandParams): Promise<{
    commandId: Snowflake
    name: string
    spaceId: Snowflake | null
  }> {
    return this.base.call('ICommands', 1, 'Register', 'POST', { body: params })
  }

  update(params: UpdateCommandParams): Promise<BotCommand> {
    return this.base.call<BotCommand>('ICommands', 1, 'Update', 'PATCH', {
      body: params,
    })
  }

  delete(commandId: Snowflake): Promise<{ deleted: boolean }> {
    return this.base.call<{ deleted: boolean }>('ICommands', 1, 'Delete', 'DELETE', {
      query: { commandId },
    })
  }
}
