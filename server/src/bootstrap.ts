import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { openRuntime } from './runtime.js'

if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Run bootstrap in an interactive terminal; do not pass credentials in command arguments')
if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new Error('This bootstrap command is for the local development database only')
let muted = false
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) process.stdout.write(chunk); callback() } })
const input = createInterface({ input: process.stdin, output, terminal: true })
let runtime: Awaited<ReturnType<typeof openRuntime>> | undefined
try {
  const username = (await input.question('Admin username: ')).trim()
  const name = (await input.question('Display name: ')).trim()
  process.stdout.write('Password (12–128 characters, hidden): ')
  muted = true
  const password = await input.question('')
  muted = false
  process.stdout.write('\n')
  runtime = await openRuntime([], true)
  await runtime.app.bootstrapAdmin({ username, name, password })
  console.log('Local administrator created. No account was created on the published website.')
} finally {
  muted = false
  input.close()
  await runtime?.close()
}
