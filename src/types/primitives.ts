/**
 * Identifier string used across the API: a GUID for spaces, channels, users, files and interactions,
 * or a 64-bit integer written as a decimal string for messages (it does not fit a JS number).
 */
export type Snowflake = string

/** The Argon epoch (2025-01-01T00:00:00Z) in Unix milliseconds; heartbeat timestamps count from it */
export const ARGON_EPOCH_MS = Date.UTC(2025, 0, 1)
