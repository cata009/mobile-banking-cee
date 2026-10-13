import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createServer } from 'vite'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const output = resolve(repoRoot, '.codex-temp/universal-demo')
const server = await createServer({
  configFile: false,
  root: repoRoot,
  resolve: { alias: { '@': resolve(repoRoot, 'src') } },
  server: { middlewareMode: true, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
try {
  // These roots share dependency cycles in the existing registries. Evaluate in order.
  const catalogModule = await server.ssrLoadModule('/src/universal/catalog.ts')
  const snapshotModule = await server.ssrLoadModule('/src/universal/experiences/pi/it/searchSnapshot.ts')
  const journeyModule = await server.ssrLoadModule('/src/universal/navigation/italySearchJourney.ts')
  const authorityModule = await server.ssrLoadModule('/src/app/platform/banking/productDataAuthority.ts')
  const searchModule = await server.ssrLoadModule('/src/features/search/mobileFirstSearch.ts')
  const catalog = catalogModule.buildUniversalCatalog()
  const counts = authorityModule.DEFAULT_VISIBLE_PRODUCT_OVERRIDES
  const snapshot = snapshotModule.getItalySearchSnapshot(counts)
  const dependencies = journeyModule.getItalySearchDependencies(snapshot.entries)
  const readiness = journeyModule.getSearchMigrationReadiness(snapshot.entries, new Set())
  const queries = ['Andrea', 'Spotify', 'Bonifico', 'Budget', 'Mutuo', 'PIN', 'Titoli', 'Documenti'].map((query) => ({
    query,
    results: searchModule
      .searchMobileFirst(snapshot.entries, query)
      .map((entry) => ({ id: entry.id, title: entry.title, target: entry.target })),
  }))
  const report = {
    schemaVersion: 1,
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim(),
    catalog,
    italySearch: {
      productCounts: counts,
      financialRevision: snapshot.financialRevision,
      entries: snapshot.entries,
      dependencies,
      routeReadiness: readiness,
      sampleQueries: queries,
    },
  }
  await mkdir(output, { recursive: true })
  await writeFile(resolve(output, 'migration-report.json'), JSON.stringify(report, null, 2) + '\n')
  const contexts = catalog.contexts
    .map(
      (row) =>
        `<tr><td>${escape(row.experienceId)}</td><td>${escape(row.country)}</td><td>${escape(row.designSystem)}</td><td>${escape(row.release)}</td><td>${row.screenCandidates.length}</td><td>${escape(row.migrationStatus)}</td></tr>`,
    )
    .join('')
  const destinations = dependencies
    .map(
      (row) =>
        `<tr><td>${escape(row.kind)}</td><td>${escape(JSON.stringify(row.target))}</td><td>${escape(row.returnTo)}</td><td>Pending native port</td></tr>`,
    )
    .join('')
  const samples = queries
    .map(
      (row) =>
        `<details><summary>${escape(row.query)} — ${row.results.length} results</summary><ul>${row.results.map((result) => `<li>${escape(result.title)} <code>${escape(JSON.stringify(result.target))}</code></li>`).join('')}</ul></details>`,
    )
    .join('')
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Universal demo migration inventory</title><style>body{font:15px/1.5 system-ui;margin:32px;color:#262626;background:#fff}main{max-width:1200px;margin:auto}h1{font-size:28px}h2{margin-top:36px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{padding:10px;text-align:left;border-bottom:1px solid #ddd;vertical-align:top}th{background:#f5f5f5}code{font-size:12px;word-break:break-word}.note{background:#f5f5f5;padding:16px;border-left:4px solid #007a91}details{margin:12px 0}summary{cursor:pointer}</style><main><h1>Universal demo migration inventory</h1><p class="note">Inventory is incomplete by design: ${escape(catalog.inventoryGaps.join(', '))}. Registry/source references are not a native parity claim. No native destination is accepted in this report.</p><p>${catalog.experiences.length} experiences · ${catalog.contexts.length} release contexts · ${catalog.preparedPacks.length} prepared packs · ${catalog.uncataloguedRoutes.length} uncatalogued runtime routes.</p><h2>Experience contexts</h2><table><thead><tr><th>Experience</th><th>Market</th><th>Design system</th><th>Release</th><th>Registered app screens</th><th>Migration</th></tr></thead><tbody>${contexts}</tbody></table><h2>Italy Home → Search dependency closure</h2><p>${snapshot.entries.length} canonical results · ${dependencies.length} distinct destinations. Native route coverage: ${readiness.ready ? 'ready' : 'not ready'}.</p><p>Product mix: <code>${escape(JSON.stringify(counts))}</code>. Imported accounts and current ledger data are included.</p><table><thead><tr><th>Kind</th><th>Target payload</th><th>Back destination</th><th>Native status</th></tr></thead><tbody>${destinations}</tbody></table><h2>Canonical sample queries</h2>${samples}<h2>Remaining runtime route inventory</h2><p><code>${escape(catalog.uncataloguedRoutes.join(', '))}</code></p></main></html>`
  await writeFile(resolve(output, 'migration-report.html'), html)
  process.stdout.write(
    `${catalog.experiences.length} experiences; ${catalog.contexts.length} contexts; ${snapshot.entries.length} Italy search results; ${dependencies.length} distinct search destinations.\nReports: ${output}\n`,
  )
} finally {
  await server.close()
}
