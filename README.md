# @argon-sdk/core

SDK for building [Argon Chat](https://argon.gl) bots.

## Install

```bash
bun add @argon-sdk/core
```

## Quick start

```ts
import { Bot, Intent, command, name, describe, message } from '@argon-sdk/core'

const bot = new Bot(process.env.BOT_TOKEN, {
  intents: Intent.Messages | Intent.Commands,
})

const hello = command(name('hello'), describe('Say hi')).run(async (ctx) => {
  await ctx.reply(`hi, ${ctx.user.displayName}`)
})

bot.commands(hello)

bot.on(message.create, async (ctx) => {
  await ctx.reply(`echo: ${ctx.text}`)
})

await bot.start()
```

## Two API styles

Every builder in the SDK supports two usage styles. Use whichever fits better.

### Token-based

Compact, declarative, great for simple definitions:

```ts
import { command, name, describe, option, string } from '@argon-sdk/core'

const greet = command(
  name('greet'),
  describe('Greet a user'),
  option(string('Who to greet'), name('target'), describe('Username')),
).run(async (ctx, opts) => {
  await ctx.reply(`Hello, ${opts.target}!`)
})
```

### Fluent

Chainable methods, good when you need full control:

```ts
import { CommandBuilder } from '@argon-sdk/core'

const greet = new CommandBuilder()
  .setName('greet')
  .setDescription('Greet a user')
  .addOption((o) => o.string().setName('target').setDescription('Who to greet'))
  .run(async (ctx, opts) => {
    await ctx.reply(`Hello, ${opts.target}!`)
  })
```

## Commands

Options are fully typed -- `opts.target` is `string`, `opts.count` is `number`, etc.

```ts
import { command, name, describe, option, string, integer } from '@argon-sdk/core'

const roll = command(
  name('roll'),
  describe('Roll dice'),
  option(integer('Number of sides').choices({ d6: 6, d20: 20 }), name('sides')),
).run(async (ctx, opts) => {
  const result = Math.floor(Math.random() * opts.sides) + 1
  await ctx.reply(`Rolled: ${result}`)
})

bot.commands(roll, greet)
```

## Events

Two ways to subscribe -- filter objects or string event names:

```ts
import { message, member, modal, reaction, button } from '@argon-sdk/core'

// Filter objects -- composable, type-safe
bot.on(message.create, async (ctx) => {
  await ctx.reply(`echo: ${ctx.text}`)
})

bot.on(member.join, async (ctx) => {
  console.log('new member:', ctx.userId)
})

bot.on(modal.submit, async (ctx) => {
  console.log('modal data:', ctx.values)
})

bot.on(button.interaction, async (ctx) => {
  console.log('button clicked:', ctx.id)
})

bot.on(reaction.add, async (ctx) => {
  console.log('reaction:', ctx.emoji)
})

// String event names -- simpler, still typed
bot.on('messageCreate', async (ctx) => {
  await ctx.reply(`echo: ${ctx.text}`)
})

bot.on('memberJoin', async (ctx) => {
  console.log('new member:', ctx.userId)
})

bot.on('modalSubmit', async (ctx) => {
  console.log('modal data:', ctx.values)
})
```

### Bot lifecycle

```ts
import { botLifecycle } from '@argon-sdk/core'

bot.on(botLifecycle.installing, async (ctx) => {
  console.log('installed into space', ctx.spaceId)
})

bot.on(botLifecycle.entitlementsUpdated, async (ctx) => {
  console.log(
    `space ${ctx.spaceId}: granted=${ctx.grantedEntitlements} required=${ctx.requiredEntitlements}`,
  )
})
```

`botLifecycle.entitlementsUpdated` fires whenever the space's granted entitlements drift from what the bot requires — handy for surfacing a re-authorize prompt. Always delivered, no intent needed.

### Voice & calls

Voice channel join/leave events are unprivileged (`Intent.Voice`). Call lifecycle events (`Intent.Calls`) are **verified-bot only**.

```ts
import { voice, call } from '@argon-sdk/core'

bot.on(voice.join, async (ctx) => {
  console.log(`${ctx.displayName} joined voice ${ctx.channelId}`)
})

bot.on(voice.leave, async (ctx) => {
  console.log(`${ctx.displayName} left voice ${ctx.channelId}`)
})

bot.on(call.incoming, async (ctx) => {
  await ctx.accept() // or ctx.reject('busy')
})

bot.on(call.ended, async (ctx) => {
  console.log('call ended:', ctx.callId)
})
```

The audio data plane (LiveKit room, Opus codec) is not part of `@argon-sdk/core` — it's handled by the separate `@argon-sdk/voice` plugin (analogous to `@discordjs/voice`).

Low-level API endpoints are accessible via `bot.api.voice`, `bot.api.calls`, `bot.api.voiceEgress` if you need them directly.

## Controls

### Buttons

Token-based -- label via `name()`:

```ts
import { row, button, name } from '@argon-sdk/core'

await ctx.reply('Pick one', {
  controls: [
    row(
      button.callback(name('Confirm')).id('confirm').on(async (ctx) => {
        await ctx.reply('Confirmed!')
      }),
      button.link(name('Docs')).href('https://argon.gl/docs'),
    ),
  ],
})
```

Fluent:

```ts
import { row, ButtonBuilder } from '@argon-sdk/core'

await ctx.reply('Pick one', {
  controls: [
    row(
      new ButtonBuilder('callback').label('Confirm').id('confirm').on(async (ctx) => {
        await ctx.reply('Confirmed!')
      }),
      new ButtonBuilder('link').label('Docs').href('https://argon.gl/docs'),
    ),
  ],
})
```

### Selects

Token-based -- placeholder via `name()`:

```ts
import { row, select, name } from '@argon-sdk/core'

const roleSelect = select.string(name('Pick a role'))
  .id('role')
  .options([
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ])
  .on(async (ctx) => {
    await ctx.reply(`Selected: ${ctx.values.join(', ')}`)
  })
```

Fluent -- one `SelectBuilder` for all types:

```ts
import { SelectBuilder } from '@argon-sdk/core'

const roleSelect = new SelectBuilder('stringSelect')
  .id('role')
  .placeholder('Pick a role')
  .options([
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ])
  .on(async (ctx) => {
    await ctx.reply(`Selected: ${ctx.values.join(', ')}`)
  })

const userPicker = new SelectBuilder('userSelect')
  .id('target')
  .placeholder('Pick a user')
  .on(async (ctx) => {
    await ctx.reply(`Picked: ${ctx.values[0]}`)
  })
```

Other select types: `select.user()`, `select.archetype()`, `select.channel()`.

```ts
await ctx.reply('Choose:', { controls: [row(roleSelect)] })
```

## Modals

### Token-based

```ts
import { modal, textInput, checkboxInput } from '@argon-sdk/core'

const feedback = modal(
  'feedback',
  'Send feedback',
  textInput('message', 'Your message').style('paragraph').required(),
  checkboxInput('anonymous', 'Send anonymously'),
)

await ctx.showModal(feedback)
```

### Fluent

```ts
import { ModalBuilder } from '@argon-sdk/core'

const feedback = new ModalBuilder()
  .setId('feedback')
  .setTitle('Send feedback')
  .addControl((c) => c.textInput().setId('message').setLabel('Your message').setStyle('paragraph').setRequired())
  .addControl((c) => c.checkbox().setId('anonymous').setLabel('Send anonymously'))
  .build()

await ctx.showModal(feedback)
```

## Rich text

### Token-based

```ts
import { richText, bold, plain, italic, url } from '@argon-sdk/core'

const msg = richText(
  bold('Welcome'),
  plain(' to the server! Read the '),
  url('https://argon.gl/rules', 'rules'),
  plain('.'),
)

await ctx.reply(msg.text, { entities: msg.entities })
```

### Fluent

```ts
import { richText } from '@argon-sdk/core'

const msg = richText()
  .bold('Welcome')
  .plain(' to the server! Read the ')
  .url('https://argon.gl/rules', 'rules')
  .plain('.')
  .build()

await ctx.reply(msg.text, { entities: msg.entities })
```

## Middleware

```ts
bot.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  console.log(`${ctx.event} took ${Date.now() - start}ms`)
})
```

## License

MIT
