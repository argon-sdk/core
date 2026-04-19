import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

/** Defines a single option for a slash command */
export interface CommandOption {
  name: string
  description: string
  nameLocalizations?: Record<string, string>
  descriptionLocalizations?: Record<string, string>
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'number'
  required?: boolean
  choices?: {
    name: string
    value: unknown
    nameLocalizations?: Record<string, string>
  }[]
  subOptions?: CommandOption[]
}

/** Parameters for registering a new slash command */
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
