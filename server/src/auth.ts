import { betterAuth } from 'better-auth'
import { admin, username } from 'better-auth/plugins'
import { adminAc, userAc } from 'better-auth/plugins/admin/access'
import type { Kysely } from 'kysely'
import type { Database } from './database.js'
import type { BetterAuthOptions } from 'better-auth'

export interface AuthConfiguration { origin: string; secret: string }

export function authOptions(db: Kysely<Database>, config: AuthConfiguration) {
  return {
    database: { db, type: 'postgres', transaction: !db.isTransaction },
    baseURL: config.origin,
    basePath: '/api/platform/auth',
    secret: config.secret,
    trustedOrigins: [config.origin],
    telemetry: { enabled: false },
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12, maxPasswordLength: 128 },
    plugins: [username({ usernameValidator: (value) => /^[a-zA-Z0-9_.-]{3,40}$/.test(value), maxUsernameLength: 40 }), admin({ defaultRole: 'viewer', roles: { viewer: userAc, editor: userAc, admin: adminAc } })],
    user: { additionalFields: { mustChangePassword: { type: 'boolean', defaultValue: true, input: false } } },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30, cookieCache: { enabled: false } },
    advanced: {
      cookiePrefix: 'cee-platform',
      useSecureCookies: new URL(config.origin).protocol === 'https:',
      // The parent connection validates before requests. Kysely cannot lease
      // an introspection connection from an already-open Transaction.
      database: { validateSchema: !db.isTransaction },
    },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 20, customRules: { '/sign-in/username': { window: 60, max: 10 } } },
    logger: { level: 'error' },
  } satisfies BetterAuthOptions
}

export function createAuth(db: Kysely<Database>, config: AuthConfiguration) {
  return betterAuth(authOptions(db, config))
}
