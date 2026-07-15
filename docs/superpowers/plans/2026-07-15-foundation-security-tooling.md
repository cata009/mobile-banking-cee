# Foundation Security And Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a reproducible verification gate and repair the source-known access-cookie vulnerability before broader refactoring.

**Architecture:** The root owns TypeScript, ESLint, Vitest, and CI. The Figma audit transpiles tracked TypeScript in memory when ignored output is absent. The access handler requires independent configuration, uses timing-safe comparisons, rejects unsafe redirects, and removes the client-cookie attempt counter.

**Tech Stack:** React 18.3.1, Vite 6.4.3, TypeScript 5.9.3, ESLint 9.39.5, typescript-eslint 8.64.0, Vitest 3.2.7, Node 22 CI, npm 11.6.2.

## Global Constraints

- Preserve stakeholder-visible banking flows.
- Do not deploy or mutate Vercel configuration in this phase.
- Do not mutate or delete images.
- Do not weaken strict TypeScript rules.
- Witness RED before every production-code change.
- Keep tooling, Figma reproducibility, security, and CI in separate commits.

---

### Task 1: Verification Contract And Toolchain

**Files:**
- Create: `tests/tooling/verification-contract.test.mjs`
- Modify: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`
- Create: `.nvmrc`, `eslint.config.js`, `vitest.config.ts`

**Interfaces:**
- Consumes: existing root package.
- Produces: `typecheck`, `lint`, `test`, `audit:all`, and `verify` commands.

- [ ] **Step 1: Write the RED contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));

test("root package exposes the complete verification contract", () => {
  for (const script of ["typecheck", "lint", "test", "audit:all", "verify"]) {
    assert.equal(typeof pkg.scripts[script], "string", `missing ${script}`);
  }
  assert.equal(pkg.packageManager, "npm@11.6.2");
  assert.deepEqual(pkg.engines, { node: ">=22 <25" });
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/tooling/verification-contract.test.mjs`

Expected: FAIL with `missing typecheck`.

- [ ] **Step 3: Install pinned tooling**

```powershell
npm install --save-exact vite@6.4.3
npm install --save-dev --save-exact typescript@5.9.3 @types/react@18.3.31 @types/react-dom@18.3.7 @types/node@22.20.1 eslint@9.39.5 @eslint/js@9.39.5 typescript-eslint@8.64.0 vitest@3.2.7 jsdom@26.1.0 @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1
```

- [ ] **Step 4: Add package scripts and runtime contract**

Set `packageManager` to `npm@11.6.2`, `engines.node` to `>=22 <25`, and add:

```json
{
  "typecheck": "tsc --noEmit",
  "lint": "eslint src api scripts tests vite.config.ts vitest.config.ts eslint.config.js",
  "test": "vitest run",
  "audit:all": "npm run audit:card-details && npm run audit:investments && npm run audit:figma-bridge && npm run audit:templates && npm run audit:platform",
  "verify": "npm run typecheck && npm run lint && npm test && npm run audit:all && npm run build"
}
```

- [ ] **Step 5: Configure TypeScript, Vitest, and ESLint**

Add Node and Vitest types without removing current strict flags. Vitest defaults to Node and includes `tests/**/*.test.{ts,tsx}`. ESLint flat config ignores generated/imported archives and applies JS/TS recommended rules; TypeScript owns unused diagnostics, while `no-debugger` and `no-constant-binary-expression` remain errors.

- [ ] **Step 6: Run GREEN and repair diagnostics at source**

```powershell
node --test tests/tooling/verification-contract.test.mjs
npm run typecheck
npm run lint
```

Expected: PASS without weakening compiler flags. Ambiguous runtime diagnostics receive characterization tests before behavior changes.

- [ ] **Step 7: Commit tooling**

```powershell
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts eslint.config.js .nvmrc tests/tooling/verification-contract.test.mjs
git commit -m "build: add reproducible verification toolchain"
```

---

### Task 2: Clean-Clone Figma Bridge Audit

**Files:**
- Create: `tests/tooling/figma-bridge-clean-clone.test.ts`
- Modify: `scripts/audit-figma-bridge.mjs`

**Interfaces:**
- Consumes: TypeScript runtime library and tracked Component-E `code.ts`.
- Produces: a Figma audit independent of ignored `code.js` and nested `node_modules`.

- [ ] **Step 1: Write RED**

```ts
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

test("figma bridge audit runs without ignored Component-E output", () => {
  expect(existsSync(resolve("screenshots/FIgma plugins/Component-E/code.js"))).toBe(false);
  expect(() => execFileSync(process.execPath, ["scripts/audit-figma-bridge.mjs"], { stdio: "pipe" })).not.toThrow();
});
```

- [ ] **Step 2: Run RED**

Run: `npm test -- tests/tooling/figma-bridge-clean-clone.test.ts`

Expected: FAIL with `ENOENT ... Component-E\\code.js`.

- [ ] **Step 3: Implement tracked-source loading**

Import `typescript`. `loadPluginCode(plugin)` reads `code.js` when tracked/present; otherwise it transpiles tracked `code.ts` with target ES2020 and module None via `ts.transpileModule`. Use the returned string in static and VM audits. Never write generated output.

- [ ] **Step 4: Run GREEN and commit**

```powershell
npm test -- tests/tooling/figma-bridge-clean-clone.test.ts
npm run audit:figma-bridge
git add scripts/audit-figma-bridge.mjs tests/tooling/figma-bridge-clean-clone.test.ts
git commit -m "test: make figma bridge audit clone-safe"
```

---

### Task 3: Access-Gate Security RED Tests

**Files:**
- Create: `tests/security/access.test.ts`

**Interfaces:**
- Consumes: `api/access.js` default handler.
- Produces: API-level coverage for missing configuration, former-secret forgery, redirects, and failed login.

- [ ] **Step 1: Create an in-memory request/response harness**

The request exposes method, headers, URL, and body. The response captures status, headers, JSON body, and `end()`. Reload `api/access.js` with `vi.resetModules()` after environment changes.

- [ ] **Step 2: Add exact failing assertions**

```ts
expect(unconfigured.status).toBe(503);
expect(forgedCookie.body).toEqual({ authenticated: false });
expect(maliciousReturn.headers.Location).toBe("/");
expect(failedLogin.status).toBe(401);
expect(failedLogin.body).not.toHaveProperty("remainingAttempts");
expect(failedLogin.headers["Set-Cookie"]).toBeUndefined();
```

The forged cookie uses former value `CE&EE2025-`; configured tests use `test-password` and independent `test-cookie-secret-0123456789abcdef`.

- [ ] **Step 3: Run RED**

Run: `npm test -- tests/security/access.test.ts`

Expected: failures prove the fallback forgery, unsafe return, and client-cookie attempt state.

---

### Task 4: Repair Access Gate

**Files:**
- Modify: `api/access.js`, `src/app/components/security/AccessGate.tsx`, `public/access.html`, `README.md`
- Create: `.env.example`
- Test: `tests/security/access.test.ts`

**Interfaces:**
- Consumes: Task 3 contract.
- Produces: fail-closed presentation access with independent secrets.

- [ ] **Step 1: Require `ACCESS_PASSWORD` and `ACCESS_COOKIE_SECRET`**

Resolve them inside the handler. Missing values or a secret shorter than 32 characters return HTTP 503. Never reuse a password as secret.

- [ ] **Step 2: Compare safely**

Use equal-length UTF-8 buffers and `crypto.timingSafeEqual` for signature and password comparisons; unequal lengths return false.

- [ ] **Step 3: Remove fake durable throttling**

Delete attempt cookies, counters, block messages, and remaining-attempt fields. Failed login always returns the same 401. README assigns durable throttling to Vercel Firewall/server-side infrastructure.

- [ ] **Step 4: Normalize redirects**

Reject backslashes, control characters, absolute/protocol-relative URLs, `/api/`, and `/access.html` in server and static access form.

- [ ] **Step 5: Remove source-known local password**

Development uses only `VITE_LOCAL_ACCESS_PASSWORD`. When absent, render a local configuration message. `.env.example` contains names and safe placeholders, never working credentials.

- [ ] **Step 6: Run GREEN and commit**

```powershell
npm test -- tests/security/access.test.ts
npm run typecheck
npm run lint
git add api/access.js src/app/components/security/AccessGate.tsx public/access.html .env.example README.md tests/security/access.test.ts
git commit -m "fix: harden stakeholder access gate"
```

---

### Task 5: CI And Foundation Handoff

**Files:**
- Create: `.github/workflows/verify.yml`
- Modify: `docs/handoff/current-session.md`, `docs/handoff/next-tasks.md`, `docs/handoff/known-bananas.md`, `docs/handoff/state-of-the-world.md`

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: clean-install CI and evidence-backed continuation.

- [ ] **Step 1: Add GitHub Actions**

Use checkout/setup-node v4, Node 22 with npm cache, `npm ci`, then `npm run verify`; grant `contents: read` and cancel superseded branch runs.

- [ ] **Step 2: Run complete gate**

```powershell
npm ci
npm run verify
git diff --check
git status --short
```

Expected: exit 0 throughout; only documented empty `react-vendor` and chunk-size warnings may remain.

- [ ] **Step 3: Record limitations and commit**

Document that production remains vulnerable until independent Vercel secrets and the fixed deployment are applied, and static assets remain public because this is a presentation gate.

```powershell
git add .github/workflows/verify.yml docs/handoff/current-session.md docs/handoff/next-tasks.md docs/handoff/known-bananas.md docs/handoff/state-of-the-world.md
git commit -m "ci: enforce foundation verification"
```

## Phase Acceptance

- Clean worktree Figma audit passes without ignored files.
- Former fallback cannot authenticate.
- Unsafe redirects resolve to `/`.
- Failed attempts are not represented as durable client-cookie throttling.
- `npm run verify` covers types, lint, tests, all audits, and build.
- CI runs the same clean-install gate.
- No deploy or image mutation occurs.
