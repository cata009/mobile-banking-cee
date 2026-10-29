import { sql, type Generated, type Kysely } from 'kysely'
import { getMigrations } from 'better-auth/db/migration'
import type { authOptions } from './auth.js'

export type Role = 'viewer' | 'editor' | 'admin'
export interface Database {
  user: {
    id: string; name: string; email: string; emailVerified: boolean; username: string | null
    role: string | null; banned: boolean | null; mustChangePassword: boolean
    createdAt: Date; updatedAt: Date
  }
  session: { id: string; token: string; userId: string; expiresAt: Date; createdAt: Date; updatedAt: Date }
  account: { id: string; userId: string; providerId: string; accountId: string; password: string | null; updatedAt: Date }
  platform_lock: { id: number }
  platform_audit: { id: string; actorId: string | null; action: string; subjectId: string; createdAt: Generated<Date>; details: string }
  platform_spec: { flowId: string; currentRevisionId: string }
  platform_spec_revision: {
    id: string; flowId: string; number: number; baseRevisionId: string | null; restoredFromRevision: string | null
    authorId: string | null; createdAt: Generated<Date>; format: string; schemaVersion: number; sourceSnapshot: string; document: string
  }
  platform_flow_access: { flowId: string; userId: string; role: 'viewer' | 'editor'; canComment: boolean }
  platform_thread: { id: string; flowId: string; anchorId: string; quote: string; sourceSnapshot: string; kind: 'comment' | 'question'; status: 'open' | 'resolved'; ownerId: string | null; decision: string; authorId: string; version: number; createdAt: Generated<Date>; updatedAt: Generated<Date> }
  platform_message: { id: string; threadId: string; authorId: string; text: string; createdAt: Generated<Date> }
}

export async function migrateDatabase(db: Kysely<Database>, options: ReturnType<typeof authOptions>) {
  const migration = await getMigrations(options)
  await migration.runMigrations()
  await db.schema.createTable('platform_lock').ifNotExists().addColumn('id', 'integer', (c) => c.primaryKey()).execute()
  await db.insertInto('platform_lock').values({ id: 1 }).onConflict((c) => c.column('id').doNothing()).execute()
  await db.schema.createTable('platform_audit').ifNotExists()
    .addColumn('id', 'text', (c) => c.primaryKey())
    .addColumn('actorId', 'text')
    .addColumn('action', 'text', (c) => c.notNull())
    .addColumn('subjectId', 'text', (c) => c.notNull())
    .addColumn('createdAt', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('details', 'text', (c) => c.notNull())
    .execute()
  await db.schema.createTable('platform_spec').ifNotExists()
    .addColumn('flowId', 'text', (c) => c.primaryKey())
    .addColumn('currentRevisionId', 'text', (c) => c.notNull()).execute()
  await db.schema.createTable('platform_spec_revision').ifNotExists()
    .addColumn('id', 'text', (c) => c.primaryKey())
    .addColumn('flowId', 'text', (c) => c.notNull().references('platform_spec.flowId'))
    .addColumn('number', 'integer', (c) => c.notNull())
    .addColumn('baseRevisionId', 'text')
    .addColumn('restoredFromRevision', 'text')
    .addColumn('authorId', 'text')
    .addColumn('createdAt', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('format', 'text', (c) => c.notNull())
    .addColumn('schemaVersion', 'integer', (c) => c.notNull())
    .addColumn('sourceSnapshot', 'text', (c) => c.notNull())
    .addColumn('document', 'text', (c) => c.notNull())
    .addUniqueConstraint('platform_spec_revision_number', ['flowId', 'number']).execute()
  await db.schema.createTable('platform_flow_access').ifNotExists()
    .addColumn('flowId', 'text', (c) => c.notNull())
    .addColumn('userId', 'text', (c) => c.notNull().references('user.id'))
    .addColumn('role', 'text', (c) => c.notNull())
    .addColumn('canComment', 'boolean', (c) => c.notNull())
    .addPrimaryKeyConstraint('platform_flow_access_pk', ['flowId', 'userId']).execute()
  await db.schema.createTable('platform_thread').ifNotExists()
    .addColumn('id', 'text', (c) => c.primaryKey())
    .addColumn('flowId', 'text', (c) => c.notNull())
    .addColumn('anchorId', 'text', (c) => c.notNull())
    .addColumn('quote', 'text', (c) => c.notNull())
    .addColumn('sourceSnapshot', 'text', (c) => c.notNull())
    .addColumn('kind', 'text', (c) => c.notNull())
    .addColumn('status', 'text', (c) => c.notNull())
    .addColumn('ownerId', 'text', (c) => c.references('user.id'))
    .addColumn('decision', 'text', (c) => c.notNull())
    .addColumn('authorId', 'text', (c) => c.notNull().references('user.id'))
    .addColumn('version', 'integer', (c) => c.notNull())
    .addColumn('createdAt', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`)).execute()
  await db.schema.createIndex('platform_thread_flow').ifNotExists().on('platform_thread').column('flowId').execute()
  await db.schema.createTable('platform_message').ifNotExists()
    .addColumn('id', 'text', (c) => c.primaryKey())
    .addColumn('threadId', 'text', (c) => c.notNull().references('platform_thread.id'))
    .addColumn('authorId', 'text', (c) => c.notNull().references('user.id'))
    .addColumn('text', 'text', (c) => c.notNull())
    .addColumn('createdAt', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`)) .execute()
  await db.schema.createIndex('platform_message_thread').ifNotExists().on('platform_message').column('threadId').execute()
}
