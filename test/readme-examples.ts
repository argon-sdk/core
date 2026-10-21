// Compiled by `tsc` (not run): keeps the README examples in sync with the API
import {
  Bot,
  HttpError,
  Intent,
  bold,
  botLifecycle,
  button,
  call,
  checkboxInput,
  command,
  definePlugin,
  describe,
  expressions,
  file,
  integer,
  member,
  mention,
  message,
  modal,
  name,
  option,
  reaction,
  ready,
  richText,
  row,
  select,
  textInput,
  voice,
} from '../src'

declare const channelId: string
declare const messageId: string
declare const spaceId: string
declare const bytes: Uint8Array

const bot = new Bot('t', { intents: Intent.Typing }).plugin(
  definePlugin('myService', () => ({ log: (s: string) => s })),
)

bot.commands(
  command(name('hello'), describe('Say hi')).run(async (ctx) => {
    await ctx.reply(`hi, ${ctx.user.displayName}`)
  }),
  command(name('roll'), option(integer('Sides').choices({ d6: 6, d20: 20 }), name('sides'))).run(async (ctx, opts) => {
    await ctx.reply(`Rolled: ${Math.floor(Math.random() * opts.sides) + 1}`)
  }),
)

bot.on(message.create.fromHumans(), async (ctx) => {
  await ctx.reply(`echo: ${ctx.text}`)
  await ctx.react('👀')
  await ctx.send('hi')
  await ctx.reply(richText(bold('Welcome '), mention(ctx.userId!, '@you')))
  await ctx.reply('see attached', { attachments: [file(bytes, 'report.pdf'), 'id'] })
  await ctx.typing('thinking')
  ctx.myService.log('x')
  await ctx.reply('Pick one', {
    controls: [
      row(
        button.callback(name('Confirm')).on(async (c) => {
          await c.update('Confirmed!', { controls: [] })
        }),
        button.link(name('Docs')).href('https://argon.gl/docs'),
      ),
      row(
        select
          .string(name('Pick a role'))
          .options([{ label: 'Admin', value: 'admin' }])
          .on(async (c) => {
            await c.reply(`Selected: ${c.values.join(', ')}`)
          }),
      ),
    ],
  })
  try {
    await ctx.react('🔥')
  } catch (e) {
    if (e instanceof HttpError && e.code === 'already_reacted') return
    throw e
  }
})
bot.on(message.create.startsWith('!ping').inChannel(channelId), (ctx) => ctx.reply('pong'))
bot.on(message.create.mentions(), (ctx) => ctx.reply('you called?'))
bot.on(member.join, (ctx) => console.log('joined:', ctx.displayName, ctx.locale))
bot.on(reaction.add, (ctx) => console.log(ctx.isCustom ? ctx.emojiName : ctx.emoji))
bot.on(expressions.update, (ctx) => console.log('stickers changed in', ctx.spaceId))
bot.on('messageEdit', (ctx) => console.log('edited:', ctx.text))
bot.on(ready, (ctx) => console.log(`online as ${bot.me.username} in ${ctx.spaces.length} spaces`))
bot.on(botLifecycle.entitlementsUpdated, (ctx) => console.log('missing:', ctx.missing.join(', ')))
bot.on(voice.join, (ctx) => console.log(`${ctx.displayName} joined voice ${ctx.channelId}`))
bot.on(call.incoming, (ctx) => ctx.accept())
bot.on(button.interaction.prefix('vote'), async (ctx) => {
  console.log(ctx.data, ctx.userId, ctx.voiceState?.channelId)
})
bot.on(button.interaction.id('feedback'), (ctx) =>
  ctx.showModal(
    modal(
      'feedback',
      'Send feedback',
      textInput('message', 'Your message').style('paragraph').required(),
      checkboxInput('anonymous', 'Send anonymously'),
    ),
  ),
)
bot.on(modal.submit.id('feedback'), async (ctx) => {
  await ctx.reply(`Thanks! (${ctx.checked('anonymous') ? 'anonymous' : ctx.user.displayName})`)
})
bot.row(
  bot.button.callback(name('Confirm')).on((ctx) => {
    ctx.myService.log('clicked')
  }),
)

async function more() {
  await bot.api.messages.edit(channelId, messageId, { text: 'updated' })
  for await (const m of bot.api.messages.iterate(channelId, { max: 500 })) {
    console.log(m.text)
  }
  const { packs } = await bot.api.expressions.list(spaceId)
  const pack = await bot.api.expressions.createPack({ spaceId, kind: 'sticker', title: 'Cats', slug: 'cats' })
  await bot.api.expressions.addItem({ spaceId, packId: pack.packId, name: 'wave', file: file(bytes, 'wave.png') })
  await bot.api.files.upload(file(bytes, 'log.txt'), 'attachment')
  return packs
}
void more
