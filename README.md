# @argon-sdk/core

SDK for building [Argon Chat](https://argon.gl) bots. Covers Bot API 1.12.

## Install

```bash
bun add @argon-sdk/core
```

## Quick start

```ts
import { Bot, command, name, describe, message } from '@argon-sdk/core'

const bot = new Bot(process.env.BOT_TOKEN!)

const hello = command(name('hello'), describe('Say hi')).run(async (ctx) => {
  await ctx.reply(`hi, ${ctx.user.displayName}`)
})

bot.commands(hello)

bot.on(message.create.fromHumans(), async (ctx) => {
  await ctx.reply(`echo: ${ctx.text}`)
})

await bot.start() // resolves when the bot stops
```

The bot subscribes to the intents its handlers need (here `Messages` and `Commands`), ignores its own
messages, and acknowledges interactions you don't answer yourself.

## Two API styles

Every builder supports two styles: compact tokens, or chainable methods.

```ts
import { command, name, describe, option, string, CommandBuilder } from '@argon-sdk/core'

// Token-based
const greet = command(
  name('greet'),
  describe('Greet a user'),
  option(string('Who to greet'), name('target')),
).run(async (ctx, opts) => {
  await ctx.reply(`Hello, ${opts.target}!`)
})

// Fluent
const greet2 = new CommandBuilder()
  .setName('greet')
  .setDescription('Greet a user')
  .addOption((o) => o.string().setName('target').setDescription('Who to greet'))
  .run(async (ctx, opts) => {
    await ctx.reply(`Hello, ${opts.target}!`)
  })
```

## Commands

Options are fully typed: `opts.target` is `string`, `opts.sides` is `number`. User, channel and role options
arrive resolved (a member, channel or archetype), fetched in parallel.

```ts
import { command, name, describe, option, integer, user } from '@argon-sdk/core'

const roll = command(
  name('roll'),
  describe('Roll dice'),
  option(integer('Number of sides').choices({ d6: 6, d20: 20 }), name('sides')),
).run(async (ctx, opts) => {
  await ctx.reply(`Rolled: ${Math.floor(Math.random() * opts.sides) + 1}`)
})

bot.commands(roll)
bot.commands(adminOnly, { spaceId: '…' }) // space-scoped commands
```

Commands are synced on `start()`: new ones are registered, changed ones updated, removed ones deleted.

## Events

Subscribe with a filter, or with an event name:

```ts
import { message, member, reaction, button, expressions } from '@argon-sdk/core'

bot.on(message.create, async (ctx) => {
  await ctx.react('👀')
})

bot.on(message.create.startsWith('!ping').inChannel(channelId), (ctx) => ctx.reply('pong'))
bot.on(message.create.mentions(), (ctx) => ctx.reply('you called?')) // mentions of the bot

bot.on(member.join, (ctx) => console.log('joined:', ctx.displayName, ctx.locale))
bot.on(reaction.add, (ctx) => console.log(ctx.isCustom ? ctx.emojiName : ctx.emoji))
bot.on(expressions.update, (ctx) => console.log('stickers changed in', ctx.spaceId))

bot.on('messageEdit', (ctx) => console.log('edited:', ctx.text))
```

Filters chain: `message.create` has `.text()`, `.startsWith()`, `.from()`, `.inChannel()`, `.inSpace()`,
`.mentions()` and `.fromHumans()`; every filter has `.and(predicate)`. The raw payload is always at `ctx.payload`.

**Every matching subscription runs**, in registration order. Handlers passed to one `on()` form a chain,
so a guard can stop the handlers after it:

```ts
const adminsOnly = async (ctx, next) => {
  if (isAdmin(ctx.userId)) await next()
}

bot.on(message.create.startsWith('!ban'), adminsOnly, banHandler) // banHandler runs only for admins
bot.on(message.create, logMessage)                                  // runs for every message regardless
```

`bot.group(filter, use => …)` routes an event to the first branch whose predicate matches, and `otherwise()`
runs only when no earlier subscription matched.

### Intents

Intents are derived from your subscriptions. Members, Presence and Calls events need privileged intents
(Calls only for verified bots); events you only consume through `bot.use()` middleware need their intent
listed explicitly:

```ts
const bot = new Bot(token, { intents: Intent.Typing })
```

### Bot lifecycle

```ts
import { botLifecycle, ready } from '@argon-sdk/core'

bot.on(ready, (ctx) => console.log(`online as ${bot.me.username} in ${ctx.spaces.length} spaces`))
bot.on(botLifecycle.installing, (ctx) => console.log('installed into', ctx.spaceId))
bot.on(botLifecycle.entitlementsUpdated, (ctx) => console.log('missing:', ctx.missing.join(', ')))
```

### Voice & calls

```ts
import { voice, call } from '@argon-sdk/core'

bot.on(voice.join, (ctx) => console.log(`${ctx.displayName} joined voice ${ctx.channelId}`))
bot.on(call.incoming, (ctx) => ctx.accept()) // verified bots only; ctx.fromLocale picks a voice
```

Interactions carry the user's voice channel as `ctx.voiceState`. The audio data plane lives in the separate
`@argon-sdk/voice` plugin.

## Messages

```ts
import { richText, bold, mention, file } from '@argon-sdk/core'

await ctx.reply('hi')                                    // replies to the message
await ctx.send('hi')                                     // plain message in the same channel
await ctx.reply(richText(bold('Welcome '), mention(ctx.userId!, '@you')))
await ctx.reply('see attached', {
  attachments: [file(await Bun.file('report.pdf').bytes(), 'report.pdf'), uploadedFileId],
})
await ctx.typing('thinking')

await bot.api.messages.edit(channelId, messageId, { text: 'updated' })

for await (const m of bot.api.messages.iterate(channelId, { max: 500 })) {
  // newest first
}
```

Message ids are 64-bit integers and are handled as strings everywhere.

## Controls

### Buttons

```ts
import { row, button, name } from '@argon-sdk/core'

await ctx.reply('Pick one', {
  controls: [
    row(
      button.callback(name('Confirm')).on(async (ctx) => {
        await ctx.update('Confirmed!', { controls: [] }) // edit the message holding the button
      }),
      button.link(name('Docs')).href('https://argon.gl/docs'),
    ),
  ],
})
```

Inline `.on()` handlers live in memory: they stop working when the bot restarts. For buttons that must keep
working, give them an id of the form `prefix:data` and route the prefix:

```ts
button.callback(name('Vote')).id(`vote:${pollId}`)

bot.on(button.interaction.prefix('vote'), async (ctx) => {
  await recordVote(ctx.data, ctx.userId) // ctx.data === pollId
})
```

### Selects

```ts
import { row, select, name } from '@argon-sdk/core'

const roleSelect = select
  .string(name('Pick a role'))
  .options([
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ])
  .on(async (ctx) => {
    await ctx.reply(`Selected: ${ctx.values.join(', ')}`)
  })

await ctx.reply('Choose:', { controls: [row(roleSelect)] })
```

Other select types: `select.user()`, `select.archetype()`, `select.channel()`. A row holds up to 5 buttons
or exactly one select; a message holds up to 5 rows.

## Modals

```ts
import { modal, textInput, checkboxInput } from '@argon-sdk/core'

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
```

The user has 60 seconds to submit.

## Interactions

Clients wait for an acknowledgement of a command, click or select: `ctx.ack()`, `ctx.defer()` (loading
state) or `ctx.showModal()`. You rarely need to call them: if a handler is still running after 2.5 s the bot
defers for you, and once handlers finish it acknowledges whatever is left unanswered. `ctx.reply()` is
independent of that and can be called any time. Tune it with `interactions: { autoDeferAfter }`.

## Stickers, emoji and files

```ts
const { packs, version } = await bot.api.expressions.list(spaceId)
const pack = await bot.api.expressions.createPack({ spaceId, kind: 'sticker', title: 'Cats', slug: 'cats' })
await bot.api.expressions.addItem({ spaceId, packId: pack.packId, name: 'wave', file: file(png, 'wave.png') })

await ctx.react({ itemId: emoji.itemId }) // custom emoji reaction
const uploaded = await bot.api.files.upload(file(bytes, 'log.txt'), 'attachment')
```

Writing expressions needs the CreateExpressions entitlement.

## Errors

API failures throw `HttpError` (alias `ApiError`) with the status, the endpoint and the API's error code:

```ts
try {
  await ctx.react('🔥')
} catch (e) {
  if (e instanceof HttpError && e.code === 'already_reacted') return
  throw e
}
```

Errors thrown by handlers go to `hooks.onError(error, ctx)`, or to `console.error` without that hook.
Requests stay inside the server's rate limits on their own; 429s are retried after `Retry-After`, and
idempotent requests are retried after network errors.

## Middleware

```ts
bot.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  console.log(`${ctx.event} took ${Date.now() - start}ms`)
})
```

Events are handled concurrently (32 at a time by default, see `concurrency`).

## Writing a plugin

Plugins inject a value that becomes available on every context and on the bot, typed through the
`Bot<TDecorators>` generic. No `declare module` augmentation is needed.

```ts
import { definePlugin } from '@argon-sdk/core'

export const myPlugin = (config: Config) => definePlugin('myService', () => buildService(config))
```

```ts
const bot = new Bot(token).plugin(myPlugin(cfg))

bot.on(message.create, (ctx) => {
  ctx.myService.doThing() // typed automatically
})
```

For nested handlers (button/select callbacks), construct controls via the bot-bound factories so decorators
thread through:

```ts
bot.row(
  bot.button.callback(name('Confirm')).on((ctx) => {
    ctx.myService.log('clicked') // typed
  }),
)
```

## Testing

`bot.dispatch(event)` runs an event through the bot without a connection, and `fetch` can be replaced in the
options, so handlers can be tested without the network.

## License

MIT
