import type { Archetype, ArchetypeMember } from '../../types'
import type { BaseApiClient } from '../base'
import type { Snowflake } from '../../types'

export class ArchetypesApi {
  constructor(private readonly base: BaseApiClient) {}

  async list(spaceId: Snowflake): Promise<{ archetypes: Archetype[] }> {
    const result = await this.base.call<{
      archetypes: Array<Omit<Archetype, 'permissions'> & { permissions: string | null }>
    }>('IArchetypes', 1, 'List', 'GET', { query: { spaceId } })

    return {
      archetypes: result.archetypes.map((a) => ({
        ...a,
        permissions: a.permissions !== null ? BigInt(a.permissions) : null,
      })),
    }
  }

  async get(spaceId: Snowflake, archetypeId: Snowflake): Promise<Archetype> {
    const result = await this.base.call<Omit<Archetype, 'permissions'> & { permissions: string | null }>(
      'IArchetypes',
      1,
      'Get',
      'GET',
      { query: { spaceId, archetypeId } },
    )

    return {
      ...result,
      permissions: result.permissions !== null ? BigInt(result.permissions) : null,
    }
  }

  listMembers(
    spaceId: Snowflake,
    archetypeId: Snowflake,
  ): Promise<{ archetypeId: Snowflake; members: ArchetypeMember[] }> {
    return this.base.call('IArchetypes', 1, 'ListMembers', 'GET', {
      query: { spaceId, archetypeId },
    })
  }
}
