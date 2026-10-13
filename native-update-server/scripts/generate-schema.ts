import { writeFile, mkdir } from 'node:fs/promises'
import { coreMigrationSql, migrationVersion } from '../src/schema.js'
const directory = new URL('../migrations/', import.meta.url)
await mkdir(directory, { recursive: true })
await writeFile(new URL(`${migrationVersion}.sql`, directory), coreMigrationSql())
console.log(`Generated ${migrationVersion}.sql from pinned SDK; no database contacted.`)
