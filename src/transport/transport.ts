import type { SseEvent } from '../events'

/** Abstract transport layer that yields incoming SSE events */
export interface Transport {
  start(signal: AbortSignal): AsyncIterable<SseEvent>
}
