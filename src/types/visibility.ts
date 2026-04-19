import type { Snowflake } from './primitives'

/** Scope determining who can see a message */
export const VisibilityScope = {
  User: 0,
  Archetypes: 1,
} as const

/** Union of visibility scope numeric values */
export type VisibilityScope = (typeof VisibilityScope)[keyof typeof VisibilityScope]

/** Message visibility rule targeting a specific user or set of archetypes */
export type Visibility =
  | { scope: typeof VisibilityScope.User; userId: Snowflake }
  | { scope: typeof VisibilityScope.Archetypes; archetypeIds: Snowflake[] }
