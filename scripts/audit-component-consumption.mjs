#!/usr/bin/env node
/**
 * Report-only audit: how much of the UI consumes the shared component library
 * (native-spike/src/universal) versus defining look-alikes locally.
 *
 * It does not fail the build. It is the measuring instrument for aligning
 * Demo, Flows and Tools with the library, family by family.
 *
 * Usage: node scripts/audit-component-consumption.mjs [--json out.json] [--include-it] [--include-evo]
 *        [--list-standalone] [--check | --write-baseline]
 *   --check            fail when a new standalone look-alike appears (npm run audit:consumption)
 *   --write-baseline   record the accepted set; run only after aligning components
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
const includeIt = args.includes('--include-it')
const includeEvo = args.includes('--include-evo')
const SKIP = new Set(['node_modules', 'dist', 'dist-host', 'android', 'ios', '.git', '__tests__', 'test-support'])

const walk = (dir, acc = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.tsx$/.test(entry.name) && !/\.test\./.test(entry.name)) acc.push(full)
  }
  return acc
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/')

// Component families, matched on the component name.
const FAMILIES = [
  // Toggle/checkbox/radio first: ToggleButton is a toggle, not a button.
  ['toggle/checkbox/radio', /(Toggle|ToggleButton|Switch|Checkbox|Radio|RadioChoices)$/],
  ['button', /(Button|Btn|Cta)$/],
  ['header', /(Header|Toolbar|TopBar|AppBar)$/],
  ['card', /Card$/],
  ['banner', /Banner$/],
  ['chip/pill/tag', /(Chip|Chips|Pill|Pills|Tag|Badge)$/],
  ['field/input', /(Field|Input|TextField|SearchBar|SearchField|Select|Dropdown)$/],
  ['sheet/dialog/modal', /(Sheet|Dialog|Modal|Popup|Panel)$/],
  ['row/list item', /(Row|ListItem|Item)$/],
  ['divider', /Divider$/],
  ['avatar/logo', /(Avatar|Logo)$/],
  ['carousel/tabs', /(Carousel|Tabs|Indicator)$/],
  ['toast/feedback', /(Toast|Snackbar|Progress|Skeleton|Loader)$/],
]
const familyOf = (name) => FAMILIES.find(([, re]) => re.test(name))?.[0] ?? null

// 1. Library components: everything exported from native-spike/src/universal.
const universalDir = path.join(root, 'native-spike/src/universal')
const libraryFiles = walk(universalDir).filter((f) => !/\.web\.tsx$/.test(f))
const library = new Map() // name -> file
for (const file of libraryFiles) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g)) library.set(m[1], rel(file))
}

// 2. Consumer areas.
const areaOf = (file) => {
  const r = rel(file)
  let m
  if ((m = r.match(/^native-spike\/src\/experiences\/pi\/([a-z]+)\//))) return `demo/${m[1]}`
  if (r.startsWith('native-spike/src/experiences/kids-pi/')) return 'demo/kids'
  if (r.startsWith('native-spike/src/app/')) return 'demo/shell'
  if ((m = r.match(/^src\/flows\/([a-z]+)\//))) return `flows/${m[1]}`
  if (r.startsWith('src/app/screens/flow-library/')) return 'flows/library-previews'
  if (r.startsWith('src/app/screens/tools/')) return 'tools'
  return null
}
const consumerRoots = ['native-spike/src/experiences', 'native-spike/src/app', 'src/flows', 'src/app/screens/flow-library', 'src/app/screens/tools']
const consumers = consumerRoots.flatMap((r) => walk(path.join(root, r))).filter((f) => areaOf(f))

const stats = {} // family -> {libraryUses, libraryNames:Set, local: Map(name -> [areas])}
const areaTotals = {} // area -> {libraryUses, localDefs}
const bump = (family) => (stats[family] ??= { libraryUses: 0, libraryNames: new Set(), local: new Map() })
const details = []

for (const file of consumers) {
  const area = areaOf(file)
  if (!includeIt && area === 'demo/it') continue
  // Evo 2027 is a later-phase evolution of the app; excluded until it is scheduled.
  if (!includeEvo && rel(file).includes('/cz/evo-2027/')) continue
  const text = readFileSync(file, 'utf8')
  const totals = (areaTotals[area] ??= { libraryUses: 0, webCopyUses: 0, localDefs: 0, files: 0 })
  totals.files++
  // Only the native demo consumes native-spike/src/universal. In Flows and Tools a
  // same-named component is the web copy, so it is reported separately and never as library use.
  const isNativeConsumer = area.startsWith('demo/')
  for (const [name] of library) {
    const family = familyOf(name)
    const uses = text.match(new RegExp(`<${name}\\b`, 'g'))?.length ?? 0
    if (!uses) continue
    if (!isNativeConsumer) {
      totals.webCopyUses += uses
      continue
    }
    totals.libraryUses += uses
    if (family) {
      const s = bump(family)
      s.libraryUses += uses
      s.libraryNames.add(name)
    }
  }
  for (const m of text.matchAll(/(?:^|\n)\s*(?:export\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)\s*(?:=|\()/g)) {
    const name = m[1]
    const family = familyOf(name)
    if (!family || library.has(name)) continue
    // Only count real components: the file must return JSX near the definition.
    const after = text.slice(m.index, m.index + 1800)
    if (!/<[A-Za-z]/.test(after)) continue
    totals.localDefs++
    const s = bump(family)
    const list = s.local.get(name) ?? []
    list.push(area)
    s.local.set(name, list)
    // Classify: does the body compose a library component (a legitimate wrapper),
    // or is it standalone (a candidate to align with the library)?
    const rest = text.slice(m.index + m[0].length)
    const next = rest.search(/\n(?:export\s+)?(?:function|const)\s+[A-Z][A-Za-z0-9]*\s*(?:=|\()/)
    const body = next === -1 ? rest : rest.slice(0, next)
    // Only a library component of the SAME family counts as composition: wrapping an
    // icon does not make a hand-rolled sheet or row a legitimate wrapper.
    const composes = [...library.keys()].filter((n) => familyOf(n) === family && new RegExp(`<${n}\\b`).test(body))
    const rawPrimitives = ['Modal', 'Pressable', 'TouchableOpacity', 'TextInput', 'ScrollView'].filter((p) => new RegExp(`<${p}\\b`).test(body))
    details.push({
      name,
      family,
      area,
      file: rel(file),
      line: text.slice(0, m.index + (m[0].startsWith('\n') ? 1 : 0)).split('\n').length,
      composes,
      rawPrimitives,
      body,
    })
  }
}

// A local component that renders an already-aligned local adapter (one that composes a
// library component of its own family) is aligned too. Resolve to a fixed point.
for (let changed = true; changed; ) {
  changed = false
  const aligned = new Set(details.filter((d) => d.composes.length > 0).map((d) => d.name))
  for (const d of details) {
    if (d.composes.length > 0) continue
    const via = [...aligned].find((n) => n !== d.name && new RegExp(`<${n}\\b`).test(d.body))
    if (via) {
      d.composes.push(`local:${via}`)
      changed = true
    }
  }
}

console.log(`Library components: ${library.size} (native-spike/src/universal)`)
console.log(`Consumer files scanned: ${consumers.length}${includeIt ? '' : ' (IT excluded)'}\n`)
const rows = Object.entries(stats)
  .map(([family, s]) => ({
    family,
    libraryUses: s.libraryUses,
    libraryComponents: s.libraryNames.size,
    localDefinitions: [...s.local.values()].reduce((n, a) => n + a.length, 0),
    examples: [...s.local.keys()].slice(0, 6),
  }))
  .sort((a, b) => b.localDefinitions - a.localDefinitions)
console.log('family'.padEnd(24), 'library uses'.padEnd(13), 'lib comps'.padEnd(10), 'local look-alikes')
for (const r of rows)
  console.log(r.family.padEnd(24), String(r.libraryUses).padEnd(13), String(r.libraryComponents).padEnd(10), r.localDefinitions, r.examples.length ? `e.g. ${r.examples.join(', ')}` : '')
console.log('\narea'.padEnd(26), 'files'.padEnd(7), 'library uses'.padEnd(13), 'web-copy uses'.padEnd(14), 'local look-alikes')
for (const [area, t] of Object.entries(areaTotals).sort((a, b) => b[1].localDefs - a[1].localDefs))
  console.log(area.padEnd(25), String(t.files).padEnd(7), String(t.libraryUses).padEnd(13), String(t.webCopyUses).padEnd(14), t.localDefs)

console.log('\nlocal look-alikes: compose a library component vs standalone')
console.log('family'.padEnd(24), 'composes library'.padEnd(18), 'standalone')
for (const family of [...new Set(details.map((d) => d.family))]) {
  const all = details.filter((d) => d.family === family)
  const standalone = all.filter((d) => d.composes.length === 0)
  console.log(family.padEnd(24), String(all.length - standalone.length).padEnd(18), standalone.length)
}
if (args.includes('--list-standalone')) {
  console.log('\nstandalone look-alikes')
  for (const d of details.filter((x) => x.composes.length === 0).sort((a, b) => a.family.localeCompare(b.family)))
    console.log(`${d.family.padEnd(22)} ${d.name.padEnd(36)} ${d.file}:${d.line}  [${d.rawPrimitives.join(',') || '-'}]`)
}

if (jsonOut) {
  writeFileSync(
    jsonOut,
    JSON.stringify(
      {
        library: Object.fromEntries(library),
        families: rows,
        areas: areaTotals,
        details: details.map(({ body: _body, ...rest }) => rest),
      },
      null,
      2,
    ),
  )
  console.log(`\nWrote ${jsonOut}`)
}

// Ratchet: standalone look-alikes in product UI may be removed but never added.
// Scope: native demo and the phone-preview flows. Flow Library chrome and Tools are
// admin interfaces, so they are reported above but not enforced here.
const baselinePath = path.join(root, 'docs/design-system/consumption/baseline.json')
const enforced = (d) => d.area.startsWith('demo/') || /^flows\/(ba|ro|rs|shared)$/.test(d.area)
const keyOf = (d) => `${d.file}#${d.name}`
const currentKeys = [...new Set(details.filter((d) => enforced(d) && d.composes.length === 0).map(keyOf))].sort()
if (args.includes('--write-baseline')) {
  mkdirSync(path.dirname(baselinePath), { recursive: true })
  writeFileSync(
    baselinePath,
    JSON.stringify(
      {
        note: 'Standalone look-alikes accepted as of this baseline. Remove entries as they are aligned; never add. Regenerate with --write-baseline only after aligning components.',
        scope: 'native demo (IT and Evo 2027 excluded) and phone-preview flows',
        standalone: currentKeys,
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`\nWrote ${rel(baselinePath)} with ${currentKeys.length} entries`)
}
if (args.includes('--check')) {
  if (!existsSync(baselinePath)) {
    console.error(`\nMissing ${rel(baselinePath)}. Run with --write-baseline.`)
    process.exit(1)
  }
  const accepted = new Set(JSON.parse(readFileSync(baselinePath, 'utf8')).standalone)
  const added = currentKeys.filter((k) => !accepted.has(k))
  const resolved = [...accepted].filter((k) => !currentKeys.includes(k))
  console.log(`\nConsumption ratchet: ${currentKeys.length} standalone look-alikes (baseline ${accepted.size}), ${resolved.length} resolved.`)
  if (added.length) {
    console.error('\nNew standalone look-alikes of library components. Use the library component or add a variant to it:')
    for (const k of added) console.error(`  ${k}`)
    process.exit(1)
  }
}
