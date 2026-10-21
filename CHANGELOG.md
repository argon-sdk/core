# Changelog

## 1.3.0

Catches up with Bot API 1.9–1.12 and fixes the wire format against the current server
(`argon-server` `src/Argon.Api/BotApi`, `src/Argon.Core/Features/BotApi`). Several fixes change the public API.

### Bot API 1.9–1.12

- **1.9** Interactions carry the user's voice channel: `ctx.voiceState`.
- **1.10** Users carry `locale` (`ctx.locale` on interactions, messages, members, voice events; `fromLocale` on
  incoming calls). GIF and link preview entities.
- **1.11** `bot.api.expressions` (packs, items, quota) and `bot.api.files` (upload, get); `Intent.Expressions`,
  the `expressions.update` event, `Entitlement.CreateExpressions` and the other new entitlement bits.
- **1.12** Attachments in `messages.send()` / `ctx.reply()` (file ids, `Blob`s or `file(data, name)`, sent as
  multipart); `attachments` on messages; custom emoji reactions (`reactions.addCustom/removeCustom`,
  `ctx.react({ itemId })`, `customEmojiId` / `emojiName` / `emojiUrl` on reaction events).

### Wire format fixes

- 64-bit ids (message ids, entitlement masks) are parsed without precision loss and handled as strings.
- Controls are sent as `[{ controls: [...] }]` rows with numeric types and variants; buttons use `id`.
- Modals are sent as `components` with numeric types and a required text input style.
- Command options are registered with numeric types.
- Event payloads match the server: message `sender` is a user object, select/modal events use `customId`,
  `channelCreate` carries `channel`, entitlement masks and presence/user flags are numbers, typing kinds are
  normalized, `messageEdit` carries the new text, heartbeat time uses the Argon epoch.
- `modal.submit.id('…')` now matches the modal's own id (the server reports the modal interaction id; the SDK
  maps it back).
- Empty response bodies, non-JSON error pages and empty 401s no longer crash response parsing.

### Behaviour changes

- Every matching `bot.on()` subscription runs; previously a handler that did not call `next()` silently
  blocked all later ones. Handlers passed to one `on()` still chain.
- Events are processed concurrently (`concurrency`, default 32) instead of one at a time.
- Intents are derived from subscriptions; `intents` adds to them.
- The bot ignores its own messages, typing and reactions (`ignoreSelf: false` to opt out); `bot.me` holds its
  profile.
- Interactions: slow handlers are deferred after 2.5 s and unanswered interactions acknowledged when handlers
  finish; `reply()` works any time (it no longer throws "Already responded").
- Inline control handlers are registered for controls sent through any API path, get an id automatically,
  run after `bot.use()` middleware and are kept in a bounded LRU. `button.interaction.prefix()` /
  `ctx.data` route persistent `prefix:data` ids.
- Plugins are per bot instance and checked for name clashes.
- `HttpError` carries `code` and `endpoint`; handler errors reach `onError(error, ctx)` or `console.error`.
- Client-side rate limiting follows the server's per-interface budgets and concurrency limit; idempotent
  requests are retried after network errors and 502–504; `slow_mode` is not retried.
- The event stream stops on 400/401/403 instead of reconnecting forever, and joins multi-line `data:` fields.
- Command sync no longer re-updates unchanged commands; required user/channel/role options that cannot be
  resolved throw instead of passing `undefined`.

### Removed

- `visibility`, `whisper()` and `visibilityFor()`: the Bot API has no message visibility, so "whispers" were
  posted publicly.
- `SelectBuilder.placeholderLocalizations()`: not part of the API.

### New helpers

`ctx.send()`, `ctx.react()`, `ctx.unreact()`, `ctx.typing()`, `ctx.update()` on buttons/selects,
`bot.api.messages.edit()` and `.iterate()`, message filters `.startsWith()`, `.from()`, `.inChannel()`,
`.inSpace()`, `.mentions()`, `.fromHumans()`, `bot.dispatch()` for tests, `hasEntitlement()`,
`entitlementNames()`, `hasUserFlag()`.
