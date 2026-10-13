# CEE native update service

Prepared release infrastructure, not an activated deployment. See [the release runbook](../docs/tasks/2026-10-13-native-ota-release.md).

This isolated package uses HotUpdater **1.0.1**, Node 24/Hono, PostgreSQL through the official Kysely adapter, and immutable S3-compatible objects. It does not modify the existing web/native dependency trees.

```powershell
npm ci
npm test
npm run build
npm run typecheck:production-config
```

Tests run the pinned SQL migration in a local PGlite PostgreSQL engine and exercise real SDK handlers. They do not contact Neon, S3/R2 or Vercel. `schema:generate` only generates reviewed SQL. `db:migrate` refuses to run unless the operator explicitly sets `NATIVE_OTA_ALLOW_MIGRATIONS=true`; function startup never applies migrations.

Vercel project root: `native-update-server`. Public reads: `/api/native-updates/version`, `/release-catalogs/...`, `/artifacts/v1/...`. Management: `/api/native-updates/admin/...`, guarded by a separate bearer token. All public mutations and alternate management path aliases are rejected. Uploads/downloads use direct signed object-storage URLs, so large archives never pass through Vercel Functions.

`NATIVE_OTA_RELEASE_ENABLED` is absent/false by default. The GitHub workflow cannot publish until an operator enables it after APK confirmation, provisions reviewed infrastructure, and protects the `native-ota-production` environment.
