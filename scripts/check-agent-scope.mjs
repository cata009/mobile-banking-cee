import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

function safeRepoPath(path) {
  const normalized = path.replaceAll('\\', '/')
  return !normalized.startsWith('/') && !normalized.includes(':') && !normalized.split('/').includes('..')
}

export function checkTaskScope(task, changedFiles) {
  if (!task.owner || !Array.isArray(task.ownedPaths) || !task.ownedPaths.length)
    throw new Error('Task owner and ownedPaths are required')
  const allowed = task.ownedPaths
  if (allowed.some((path) => !safeRepoPath(path))) throw new Error('Unsafe task ownership path')
  return changedFiles.filter((file) => {
    const path = file.replaceAll('\\', '/')
    if (!safeRepoPath(path)) return true
    return !allowed.some(
      (pattern) =>
        pattern === '**' || pattern === path || (pattern.endsWith('/**') && path.startsWith(pattern.slice(0, -2))),
    )
  })
}

export function assertTaskCheckout(task, checkoutRoot) {
  if (task.worktreeRoot && resolve(task.worktreeRoot).toLowerCase() !== resolve(checkoutRoot).toLowerCase()) {
    throw new Error('The current checkout is not the task-assigned checkout')
  }
}

export function collectTaskChangedFiles(root, base, head) {
  for (const ref of [base, head].filter(Boolean)) {
    if (ref.startsWith('-')) throw new Error('Invalid comparison ref')
    execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd: root, stdio: 'ignore' })
  }
  const comparisonBase = head ? execFileSync('git', ['merge-base', base, head], { cwd: root, encoding: 'utf8' }).trim() : base
  const tracked = execFileSync('git', ['diff', '--no-ext-diff', '--no-renames', '--name-only', '-z', comparisonBase, ...(head ? [head] : [])], { cwd: root, encoding: 'utf8' })
  const added = head ? '' : execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' })
  return [...new Set((tracked + added).split('\0').filter(Boolean))]
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const taskPath = process.argv[process.argv.indexOf('--task') + 1]
  if (!process.argv.includes('--task') || !taskPath)
    throw new Error('Usage: check-agent-scope --task task.json [--base commit]')
  const task = JSON.parse(readFileSync(taskPath, 'utf8'))
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
  if (!process.env.CI) assertTaskCheckout(task, root)
  const baseIndex = process.argv.indexOf('--base')
  const base = baseIndex >= 0 ? process.argv[baseIndex + 1] : 'HEAD'
  if (!base || base.startsWith('-')) throw new Error('Invalid comparison base')
  const headIndex = process.argv.indexOf('--head')
  const head = headIndex >= 0 ? process.argv[headIndex + 1] : undefined
  const files = collectTaskChangedFiles(root, base, head)
  const violations = checkTaskScope(task, files)
  if (violations.length) throw new Error(`Changes outside ${task.owner} ownership:\n${violations.join('\n')}`)
  console.log(`Task scope ok: owner=${task.owner}, changedFiles=${files.length}`)
}
