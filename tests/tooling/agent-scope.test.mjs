import { expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { checkTaskScope, assertTaskCheckout, collectTaskChangedFiles } from '../../scripts/check-agent-scope.mjs'

const task = { owner: 'flows', ownedPaths: ['src/flows/**', 'tests/features/bulk-approval.test.ts'] }

it('permits owned additions and reports both old and new paths of an out-of-scope rename', () => {
  expect(checkTaskScope(task, ['src/flows/shared/new.ts', 'tests/features/bulk-approval.test.ts'])).toEqual([])
  expect(checkTaskScope(task, ['src/flows/old.ts', 'src/app/App.tsx'])).toEqual(['src/app/App.tsx'])
})

it('rejects traversal and prevents a similar directory prefix from acquiring ownership', () => {
  expect(checkTaskScope(task, ['src/flows-other/new.ts', '../outside.ts'])).toEqual([
    'src/flows-other/new.ts',
    '../outside.ts',
  ])
})

it('checks the assigned checkout independently of allowed paths', () => {
  expect(() => assertTaskCheckout({ worktreeRoot: '/assigned' }, '/other')).toThrow(/checkout/i)
  expect(() => assertTaskCheckout({ worktreeRoot: '/assigned' }, '/assigned')).not.toThrow()
})

it('compares the immutable task commits even after the base branch and checkout advance', () => {
  const prefix = join(tmpdir(), 'banking-agent-scope-')
  const root = mkdtempSync(prefix)
  if (!resolve(root).startsWith(resolve(prefix))) throw new Error('Unsafe test cleanup target')
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const commit = (message) => git('-c', 'user.name=Scope Test', '-c', 'user.email=scope@example.invalid', '-c', 'core.hooksPath=', 'commit', '-m', message)
  try {
    git('init')
    writeFileSync(join(root, 'README.md'), 'base\n')
    git('add', '.')
    commit('event base')
    const base = git('rev-parse', 'HEAD')
    mkdirSync(join(root, 'src/flows'), { recursive: true })
    writeFileSync(join(root, 'src/flows/task.ts'), 'task change\n')
    git('add', '.')
    commit('task head')
    const head = git('rev-parse', 'HEAD')
    git('checkout', '--detach', base)
    mkdirSync(join(root, 'src/app'), { recursive: true })
    writeFileSync(join(root, 'src/app/upstream.ts'), 'later upstream change\n')
    git('add', '.')
    commit('advanced upstream')
    const upstream = git('rev-parse', 'HEAD')
    writeFileSync(join(root, 'untracked.txt'), 'unrelated checkout data\n')
    expect(collectTaskChangedFiles(root, base, head)).toEqual(['src/flows/task.ts'])
    expect(checkTaskScope(task, collectTaskChangedFiles(root, base, head))).toEqual([])
    expect(collectTaskChangedFiles(root, upstream, head)).toEqual(['src/flows/task.ts'])
    expect(collectTaskChangedFiles(root, base)).toEqual(['src/app/upstream.ts', 'untracked.txt'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
