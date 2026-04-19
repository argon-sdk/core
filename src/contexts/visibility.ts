import type { ApiClient } from '../api/client'
import type { Archetype } from '../types'
import type { Snowflake } from '../types'
import type { Visibility } from '../types'

import { VisibilityScope } from '../types'

/** Resolves archetype-based visibility for a user in a space */
export async function resolveVisibility(
  api: ApiClient,
  spaceId: Snowflake,
  userId: Snowflake,
  filter?: (archetype: Archetype) => boolean,
): Promise<Visibility> {
  const member = await api.spaces.getMember(spaceId, userId)
  let archetypeIds = member.archetypeIds

  if (filter) {
    const { archetypes } = await api.archetypes.list(spaceId)
    const allowed = new Set(archetypes.filter(filter).map((a) => a.archetypeId))
    archetypeIds = archetypeIds.filter((id) => allowed.has(id))
  }

  return { scope: VisibilityScope.Archetypes, archetypeIds }
}
