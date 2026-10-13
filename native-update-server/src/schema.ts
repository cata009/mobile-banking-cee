import { coreTarget, generateEngineSql } from '@hot-updater/plugin-core'

export const migrationVersion = '0001-hot-updater-1.0.1'
export function coreMigrationSql() {
  return (
    `-- ${migrationVersion}: reviewed core schema; no runtime auto-migration.\n` +
    generateEngineSql('postgresql', coreTarget.schema, coreTarget.settings)
      .map((statement) => (statement.trim().endsWith(';') ? statement : `${statement};`))
      .join('\n') +
    '\n'
  )
}
