import { describe, expect, test } from 'bun:test'

import { command, name, describe as desc, option, string } from '../src'
import { syncCommands } from '../src/commands/sync'

function fakeApi(remote: unknown[]) {
  const calls: string[] = []
  const api = {
    commands: {
      list: async () => ({ commands: remote }),
      listForSpace: async () => ({ commands: remote }),
      register: async () => {
        calls.push('register')
        return {}
      },
      update: async () => {
        calls.push('update')
        return {}
      },
      delete: async () => {
        calls.push('delete')
        return {}
      },
    },
  }

  return { api: api as any, calls }
}

describe('syncCommands', () => {
  const greet = command(name('greet'), desc('Greet'), option(string('Who'), name('target'))).run(() => {})

  test('does not update a command whose remote copy only differs in key order and nulls', async () => {
    const { api, calls } = fakeApi([
      {
        commandId: 'c1',
        name: 'greet',
        description: 'Greet',
        nameLocalizations: null,
        options: [{ type: 0, required: true, description: 'Who', name: 'target', choices: null, subOptions: null }],
      },
    ])

    await syncCommands(api, [greet])
    expect(calls).toEqual([])
  })

  test('registers new, updates changed and deletes stale commands', async () => {
    const { api, calls } = fakeApi([
      { commandId: 'c1', name: 'greet', description: 'Old', options: [] },
      { commandId: 'c2', name: 'stale', description: 'x', options: [] },
    ])
    const ping = command(name('ping'), desc('Ping')).run(() => {})

    await syncCommands(api, [greet, ping])
    expect(calls.sort()).toEqual(['delete', 'register', 'update'])
  })
})
