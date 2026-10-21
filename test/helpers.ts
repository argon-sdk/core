import type { SseEvent } from '../src'

import { Bot } from '../src'

export interface Recorded {
  method: string
  path: string
  body: unknown
  form: FormData | null
}

/** A bot wired to a fake HTTP server that records requests and answers from `routes` */
export function testBot(
  routes: Record<string, (req: Recorded) => unknown> = {},
  options: ConstructorParameters<typeof Bot>[1] = {},
) {
  const requests: Recorded[] = []

  const fetchImpl = async (input: string, init: RequestInit) => {
    const url = new URL(input)
    const path = url.pathname.replace(/^\//, '')
    const form = init.body instanceof FormData ? init.body : null
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : null
    const req: Recorded = { method: String(init.method), path, body, form }
    requests.push(req)

    const route = routes[path]
    const result = route ? route(req) : undefined
    return result === undefined ? new Response(null, { status: 200 }) : Response.json(result)
  }

  const bot = new Bot('token', { fetch: fetchImpl, rateLimits: { limits: {} }, ...options })
  return { bot, requests, paths: () => requests.map((r) => r.path) }
}

const user = (userId: string, flags = 0) => ({
  userId,
  username: userId,
  displayName: userId.toUpperCase(),
  avatarUrl: null,
  flags,
  locale: 'ru',
})

export function messageEvent(text: string, senderId = 'u1', flags = 0): SseEvent {
  return {
    id: '1',
    type: 'messageCreate',
    data: {
      spaceId: 's1',
      channelId: 'c1',
      message: {
        messageId: '7351234567890123456',
        replyId: null,
        channelId: 'c1',
        spaceId: 's1',
        text,
        entities: [],
        timeSent: '2026-10-21T10:00:00Z',
        sender: user(senderId, flags),
        controls: null,
        reactions: null,
        crosspost: null,
        webhook: null,
        attachments: null,
      },
    },
  }
}

export function buttonEvent(controlId: string): SseEvent {
  return {
    id: '2',
    type: 'controlInteraction',
    data: {
      interactionId: 'i1',
      controlType: 0,
      messageId: '7351234567890123456',
      channelId: 'c1',
      spaceId: 's1',
      user: user('u1'),
      controlId,
      voiceState: null,
    },
  }
}

export function modalSubmitEvent(customId: string, values: Record<string, string>): SseEvent {
  return {
    id: '3',
    type: 'modalSubmit',
    data: {
      interactionId: 'i9',
      customId,
      channelId: 'c1',
      spaceId: 's1',
      user: user('u1'),
      values: Object.entries(values).map(([k, v]) => ({ customId: k, values: [v] })),
      voiceState: null,
    },
  }
}
