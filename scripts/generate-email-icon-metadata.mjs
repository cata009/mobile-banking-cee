import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { format, resolveConfig } from 'prettier'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'src/features/marketing-email/appIconMetadata.ts')
const server = await createServer({
  configFile: false,
  root,
  cacheDir: path.join(root, '.codex-temp/email-icon-metadata-cache'),
  plugins: [react()],
  resolve: { alias: { '@': path.join(root, 'src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
})
try {
  const { ICON_INVENTORY } = await server.ssrLoadModule('/src/app/components/icons/iconRegistry.ts')
  const entries = ICON_INVENTORY.map((icon) => ({
    name: icon.name,
    label: icon.label,
    category: icon.category,
    source: icon.source,
    width: icon.previewWidth,
    height: icon.previewHeight,
    usage: icon.usage,
  }))
  const source = `/** Generated from the live DS ICON_INVENTORY. Regenerate: node scripts/generate-email-icon-metadata.mjs. No UI runtime imports. */
import type { IconName } from '@/app/components/icons/iconNames'
export interface AppIconMetadata { name: IconName; label: string; category: string; source: 'custom' | 'lucide'; width: number; height: number; usage: readonly string[] }
export const APP_ICON_METADATA: readonly AppIconMetadata[] = ${JSON.stringify(entries, null, 2)}\n`
  const formatted = await format(source, { ...(await resolveConfig(output)), parser: 'typescript' })
  if (process.argv.includes('--check')) {
    if ((await fs.readFile(output, 'utf8')) !== formatted)
      throw new Error('Email icon metadata is stale. Regenerate it from the current DS registry.')
    console.log(`Email icon metadata matches ${entries.length} DS application icons.`)
  } else {
    await fs.writeFile(output, formatted)
    console.log(`Generated pure metadata for ${entries.length} DS application icons.`)
  }
} finally {
  await server.close()
}
