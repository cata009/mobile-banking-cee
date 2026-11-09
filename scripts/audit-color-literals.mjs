#!/usr/bin/env node
/**
 * Ratchet on colors written directly in UI code (#hex, rgb(), rgba()).
 *
 * A color typed into a component does not follow the single color source
 * (src/app/registry/colorTokens.ts), so changing the source would not reach it. This audit counts those
 * literals per file and fails when a file gains one. Existing ones are listed in
 * docs/design-system/color-literals-baseline.json and are removed by switching them to a token
 * (sourceColor('var(--uc-...)', dark) in React Native, var(--uc-...) on the web).
 *
 * Not counted: tests, data, registry, Evo 2027, Italy, Kids, and brand/product artwork (flags, logos, card
 * art, icons) whose colors are the artwork itself rather than interface colors.
 *
 * Usage: node scripts/audit-color-literals.mjs [--check | --write-baseline] [--top N]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const baselinePath = path.join(root, 'docs/design-system/color-literals-baseline.json')
const SKIP_DIR = new Set(['node_modules', 'dist', 'dist-host', 'android', 'ios', '.git', '__tests__', 'test-support', 'assets'])
const roots = ['native-spike/src', 'src/app', 'src/flows', 'src/features', 'src/experiences']
const EXCLUDE = [
  /\/pi\/it\//, // Italy: not integrated yet
  /\/evo-2027\//, // Evo 2027: scheduled later
  /kids/i, // Kids sub-apps keep their own themes
  /\.test\./,
  /\/registry\//,
  /\/data\//,
  /\/translations\//,
  /(Artwork|artwork|Flag|Logo|logo|CardArt|CardArtwork|canonicalIcons|catalogCompositions|Illustration|merchant|Merchant|brand|Brand|icons\/|\/images\/|colorTokens|colorRegistry|iconRegistry)/,
]
const literal = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(/g

const walk = (dir, acc = []) => {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) acc.push(full)
  }
  return acc
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/')

const counts = {}
for (const r of roots)
  for (const file of walk(path.join(root, r))) {
    const name = rel(file)
    if (EXCLUDE.some((re) => re.test(name))) continue
    const n = readFileSync(file, 'utf8').match(literal)?.length ?? 0
    if (n) counts[name] = n
  }
const total = Object.values(counts).reduce((a, b) => a + b, 0)
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
console.log(`Color literals in UI code: ${total} in ${sorted.length} files (Italy, Evo 2027, Kids and artwork excluded)`)
const top = args.includes('--top') ? Number(args[args.indexOf('--top') + 1]) : 8
for (const [file, n] of sorted.slice(0, top)) console.log(`  ${String(n).padStart(4)}  ${file}`)

if (args.includes('--write-baseline')) {
  mkdirSync(path.dirname(baselinePath), { recursive: true })
  writeFileSync(
    baselinePath,
    JSON.stringify(
      {
        note: 'Color literals accepted per file. A file may lose literals, never gain them. Regenerate with --write-baseline only after converting literals to tokens.',
        total,
        files: Object.fromEntries(sorted.sort((a, b) => a[0].localeCompare(b[0]))),
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`Wrote ${rel(baselinePath)}`)
}
if (args.includes('--check')) {
  if (!existsSync(baselinePath)) {
    console.error(`Missing ${rel(baselinePath)}. Run with --write-baseline.`)
    process.exit(1)
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).files
  const grew = Object.entries(counts).filter(([file, n]) => n > (baseline[file] ?? 0))
  const fewer = Object.entries(baseline).filter(([file, n]) => (counts[file] ?? 0) < n).length
  console.log(`Ratchet: ${total} literals (baseline ${JSON.parse(readFileSync(baselinePath, 'utf8')).total}), ${fewer} files improved.`)
  if (grew.length) {
    console.error('\nThese files gained color literals. Use a color token so the single source reaches them:')
    for (const [file, n] of grew) console.error(`  ${file}: ${baseline[file] ?? 0} -> ${n}`)
    process.exit(1)
  }
}
