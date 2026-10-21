import { describe, expect, test } from 'bun:test'

import {
  Intent,
  button,
  definePlugin,
  message,
  modal,
  otherwise,
  richText,
  bold,
  row,
  select,
  textInput,
  checkboxInput,
  command,
  name,
  option,
  integer,
} from '../src'
import { buttonEvent, messageEvent, modalSubmitEvent, testBot } from './helpers'

describe('Bot dispatch', () => {
  test('every matching subscription runs, even when earlier ones do not call next()', async () => {
    const { bot } = testBot()
    const seen: string[] = []

    bot.on(message.create, () => {
      seen.push('first')
    })
    bot.on(message.create.text('hi'), () => {
      seen.push('second')
    })

    await bot.dispatch(messageEvent('hi'))
    expect(seen).toEqual(['first', 'second'])
  })

  test('handlers inside one subscription form a chain', async () => {
    const { bot } = testBot()
    const seen: string[] = []

    bot.on(
      message.create,
      (_ctx, _next) => {
        seen.push('guard')
      },
      () => {
        seen.push('guarded')
      },
    )

    await bot.dispatch(messageEvent('x'))
    expect(seen).toEqual(['guard'])
  })

  test('bot.use() middleware can stop later subscriptions', async () => {
    const { bot } = testBot()
    const seen: string[] = []

    bot.use((ctx, next) => (ctx.event === 'messageCreate' ? undefined : next()))
    bot.on(message.create, () => {
      seen.push('handler')
    })

    await bot.dispatch(messageEvent('x'))
    expect(seen).toEqual([])
  })

  test('otherwise() only runs when nothing matched', async () => {
    const { bot } = testBot()
    const seen: string[] = []

    bot.on(message.create.text('hi'), () => {
      seen.push('hi')
    })
    bot.use(
      otherwise(message.create, () => {
        seen.push('fallback')
      }),
    )

    await bot.dispatch(messageEvent('hi'))
    await bot.dispatch(messageEvent('other'))
    expect(seen).toEqual(['hi', 'fallback'])
  })

  test('reports handler errors with the context instead of swallowing them', async () => {
    const errors: string[] = []
    const { bot } = testBot(
      {},
      { hooks: { onError: (error, ctx) => void errors.push(`${ctx?.event}: ${error.message}`) } },
    )

    bot.on(message.create, () => {
      throw new Error('boom')
    })

    await bot.dispatch(messageEvent('x'))
    expect(errors).toEqual(['messageCreate: boom'])
  })

  test('message filters', async () => {
    const { bot } = testBot()
    const seen: string[] = []

    bot.on(message.create.fromHumans().startsWith('!'), (ctx) => {
      seen.push(`${ctx.userId}:${ctx.text}`)
    })

    await bot.dispatch(messageEvent('!ping'))
    await bot.dispatch(messageEvent('!ping', 'b1', 1))
    await bot.dispatch(messageEvent('ping'))
    expect(seen).toEqual(['u1:!ping'])
  })
})

describe('Bot intents', () => {
  test('derives intents from subscriptions and commands', () => {
    const { bot } = testBot()
    bot.on(message.create, () => {})
    bot.commands(command(name('ping')).run(() => {}))

    expect(bot.intents).toBe(Intent.Messages | Intent.Commands | Intent.ControlInteractions)
  })

  test('keeps explicit intents', () => {
    const { bot } = testBot({}, { intents: Intent.Typing })
    expect(bot.intents & Intent.Typing).toBe(Intent.Typing)
  })
})

describe('Bot plugins', () => {
  test('exposes plugin values on contexts and the bot, per instance', async () => {
    const { bot: plain } = testBot()
    const { bot } = testBot()
    const withPlugin = bot.plugin(definePlugin('greeter', () => ({ hello: (n: string) => `hello ${n}` })))
    let greeting = ''

    withPlugin.on(message.create, (ctx) => {
      greeting = ctx.greeter.hello(ctx.user!.displayName)
    })

    await withPlugin.dispatch(messageEvent('x'))
    expect(greeting).toBe('hello U1')
    expect(withPlugin.greeter.hello('a')).toBe('hello a')

    let leaked: unknown = 'unset'
    plain.on(message.create, (ctx) => {
      leaked = (ctx as unknown as Record<string, unknown>).greeter
    })
    await plain.dispatch(messageEvent('x'))
    expect(leaked).toBeUndefined()
  })

  test('rejects names that clash with context properties', () => {
    const { bot } = testBot()
    expect(() => bot.plugin(definePlugin('reply', () => 1))).toThrow('clashes')
  })
})

describe('Messages', () => {
  test('reply() replies to the message, keeps ids exact and sends rich text', async () => {
    const { bot, requests } = testBot({ 'IMessages/v1/Send': () => ({ messageId: '1', attachments: [] }) })

    bot.on(message.create, async (ctx) => {
      await ctx.reply(richText(bold('hi')))
    })

    await bot.dispatch(messageEvent('x'))
    const body = requests[0]!.body as Record<string, unknown>
    expect(requests[0]!.path).toBe('IMessages/v1/Send')
    expect(body.replyTo).toBe('7351234567890123456')
    expect(body.text).toBe('hi')
    expect(body.entities).toEqual([{ type: 10, offset: 0, length: 2, version: 1 }])
    expect(typeof body.randomId).toBe('string')
  })

  test('sends file contents as multipart', async () => {
    const { bot, requests } = testBot()

    await bot.api.messages.send({
      channelId: 'c1',
      text: 'files',
      attachments: [
        '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
        { data: 'hello', name: 'a.txt', contentType: 'text/plain' },
      ],
      controls: [row(button.link().label('Docs').href('https://argon.gl'))],
    })

    const form = requests[0]!.form!
    expect(form.get('channelId')).toBe('c1')
    expect(form.getAll('attachments')).toHaveLength(2)
    expect(form.getAll('attachments')[0]).toBe('3f2504e0-4f89-11d3-9a0c-0305e82c3301')
    expect((form.getAll('attachments')[1] as File).name).toBe('a.txt')
    expect(JSON.parse(String(form.get('controls')))).toEqual([
      { controls: [{ type: 0, variant: 1, label: 'Docs', url: 'https://argon.gl' }] },
    ])
  })
})

describe('Controls', () => {
  test('serialize to the wire shape', () => {
    const r = row(button.callback(name('OK')).id('ok').colour(0.6, 0.2, 120))
    expect(r.controls).toEqual([{ type: 0, variant: 0, label: 'OK', id: 'ok', colour: { l: 0.6, c: 0.2, h: 120 } }])

    const s = row(
      select
        .string(name('Pick'))
        .id('pick')
        .options([{ label: 'A', value: 'a' }]),
    )
    expect(s.controls).toEqual([
      { type: 1, customId: 'pick', placeholder: 'Pick', options: [{ label: 'A', value: 'a' }] },
    ])
  })

  test('rejects mixed rows', () => {
    expect(() => row(button.callback(name('A')).id('a'), select.user().id('u'))).toThrow('either')
  })

  test('inline handlers run on click, get an id automatically, and run after middleware', async () => {
    const { bot, requests } = testBot({ 'IMessages/v1/Send': () => ({ messageId: '5', attachments: [] }) })
    const seen: string[] = []

    bot.use(async (_ctx, next) => {
      seen.push('middleware')
      await next()
    })
    bot.on(message.create, async (ctx) => {
      await ctx.reply('pick', {
        controls: [
          row(
            button.callback(name('Go')).on(() => {
              seen.push('clicked')
            }),
          ),
        ],
      })
    })

    await bot.dispatch(messageEvent('x'))
    const rows = (requests[0]!.body as { controls: Array<{ controls: Array<{ id: string }> }> }).controls
    const id = rows[0]!.controls[0]!.id
    expect(id).toStartWith('argon:')

    seen.length = 0
    await bot.dispatch(buttonEvent(id))
    expect(seen).toEqual(['middleware', 'clicked'])
  })

  test('controls sent through bot.api register their handlers too', async () => {
    const { bot } = testBot({ 'IMessages/v1/Send': () => ({ messageId: '5', attachments: [] }) })
    let clicked = false

    await bot.api.messages.send({
      channelId: 'c1',
      text: 'x',
      controls: [
        row(
          button
            .callback(name('Go'))
            .id('go')
            .on(() => {
              clicked = true
            }),
        ),
      ],
    })

    await bot.dispatch(buttonEvent('go'))
    expect(clicked).toBe(true)
  })

  test('prefix routes match ids and expose the data part', async () => {
    const { bot, paths } = testBot()
    const votes: Array<string | null> = []

    bot.on(button.interaction.prefix('vote'), (ctx) => {
      votes.push(ctx.data)
    })

    await bot.dispatch(buttonEvent('vote:42'))
    await bot.dispatch(buttonEvent('vote'))
    await bot.dispatch(buttonEvent('voter:1'))
    expect(votes).toEqual(['42', null])
    expect(paths().filter((p) => p === 'IInteractions/v1/Ack')).toHaveLength(3)
  })
})

describe('Interactions', () => {
  test('slow handlers are deferred, then acknowledged when they finish', async () => {
    const { bot, paths } = testBot({}, { interactions: { autoDeferAfter: 10 } })

    bot.on(button.interaction, async () => {
      await Bun.sleep(40)
    })

    await bot.dispatch(buttonEvent('x'))
    expect(paths()).toEqual(['IInteractions/v1/Defer', 'IInteractions/v1/Ack'])
  })

  test('replying after the auto-defer works and an explicit ack is not repeated', async () => {
    const { bot, paths } = testBot(
      { 'IMessages/v1/Send': () => ({ messageId: '1', attachments: [] }) },
      { interactions: { autoDeferAfter: 5 } },
    )

    bot.on(button.interaction, async (ctx) => {
      await Bun.sleep(20)
      await ctx.reply('done')
      await ctx.ack()
    })

    await bot.dispatch(buttonEvent('x'))
    expect(paths()).toEqual(['IInteractions/v1/Defer', 'IMessages/v1/Send', 'IInteractions/v1/Ack'])
  })

  test('modal submits are routed by the modal id and expose values', async () => {
    const { bot } = testBot({ 'IInteractions/v1/Modal': () => ({ modalInteractionId: 'm-1' }) })
    const results: unknown[] = []

    bot.on(button.interaction, async (ctx) => {
      await ctx.showModal(modal('feedback', 'Feedback', textInput('text', 'Text'), checkboxInput('anon', 'Anonymous')))
    })
    bot.on(modal.submit.id('feedback'), (ctx) => {
      results.push(ctx.value('text'), ctx.checked('anon'))
    })

    await bot.dispatch(buttonEvent('open'))
    await bot.dispatch(modalSubmitEvent('m-1', { text: 'great', anon: 'true' }))
    expect(results).toEqual(['great', true])
  })

  test('modals are sent in the wire shape', async () => {
    const { bot, requests } = testBot({ 'IInteractions/v1/Modal': () => ({ modalInteractionId: 'm' }) })

    await bot.api.interactions.showModal('i1', modal('f', 'Title', textInput('t', 'Text').style('paragraph')))
    expect(requests[0]!.body).toEqual({
      interactionId: 'i1',
      modal: {
        customId: 'f',
        title: 'Title',
        components: [
          {
            type: 0,
            customId: 't',
            label: 'Text',
            style: 1,
            required: null,
            minLength: null,
            maxLength: null,
          },
        ],
      },
    })
  })
})

describe('Commands', () => {
  test('options are typed and passed through', async () => {
    const { bot } = testBot()
    let got: unknown = null

    bot.commands(
      command(name('roll'), option(integer('Sides'), name('sides'))).run((_ctx, opts) => {
        got = opts.sides
      }),
    )

    await bot.dispatch({
      id: '9',
      type: 'commandInteraction',
      data: {
        interactionId: 'i',
        commandId: 'cmd',
        commandName: 'roll',
        channelId: 'c1',
        spaceId: 's1',
        user: { userId: 'u1', username: 'u', displayName: 'U', avatarUrl: null, flags: 0, locale: null },
        options: [{ name: 'sides', type: 1, value: 20 }],
        voiceState: null,
      },
    })

    expect(got).toBe(20)
  })
})
