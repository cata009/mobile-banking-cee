# Profile-based access to flow editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move personal flow sign-in from the Flows library into a profile dialog opened by IM, and preserve authorized editing of the current flow.

**Architecture:** Add a focused profile dialog in `features/flow-collaboration` that composes the existing `AccountBar`. Mount it from `DemoTopBar`, passing the active flow ID when the current route is a flow detail, and remove the account panel from `FlowLibraryScreen`.

**Tech Stack:** React, TypeScript, Radix Dialog, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-29-flow-profile-access-design.md`

## Global Constraints

- Do not change authentication endpoints, role policy, flow permissions, or server behavior.
- Do not grant edit access merely because someone signs in.
- Preserve flow definitions, IDs, ordering, scenarios, exports, and read-only preview behavior.
- Keep the current route and flow selection after sign-in.
- Keep the profile dialog keyboard accessible, with an accessible title, Escape dismissal, and scrollable content.
- Make narrow edits that preserve the checkout's existing uncommitted changes; do not stage or commit unrelated work.

## Review Focus

- **Anonymous user:** IM opens the dialog and sign-in is available; test that the button opens it and displays the existing sign-in control.
- **Successful login:** granted edit access appears without leaving the active flow; test through the real in-memory platform API and `usePersonalSpecAccess`.
- **Unavailable account service:** the existing status text and sign-in affordance remain available inside the dialog; test with the default unavailable platform context.
- **Admin on a flow detail:** the dialog passes the active flow ID so existing per-flow grants remain manageable; test the flow-specific role control.
- **Dialog dismissal:** Escape closes the dialog and returns focus to IM; test using Radix's dialog behavior.

---

### Task 1: Connect the profile account dialog to IM

**Files:**
- Create: `src/features/flow-collaboration/ProfileAccountDialog.tsx`
- Modify: `src/app/components/demo/DemoTopBar.tsx`
- Modify: `src/app/navigation/initialNavigation.ts`
- Test: `tests/screens/flow-account.test.tsx`

**Interfaces:**
- Produces `ProfileAccountDialog({ flowId, children }: { flowId?: string; children: React.ReactElement })`.
- Renders `children` as the Radix `Dialog.Trigger`, and renders the existing `AccountBar` inside a labelled, scrollable dialog.
- Passes `flowId` unchanged to `AccountBar`. `DemoTopBar` supplies it only when the current route is a flow-library detail with an ID.

- [x] **Step 1: Write the failing profile dialog tests**

Add tests that render `DemoTopBar` without a platform provider and verify the IM trigger opens an accessible dialog with the existing unavailable status and sign-in action, then Escape closes it and restores focus. Add a second test using the in-memory API and an admin account: obtain the initial route from `resolveInitialNavigation` for a direct flow link, sign in, assert `usePersonalSpecAccess` reports Edit access while the current flow route remains selected, and verify user administration exposes the flow-specific role control.

- [x] **Step 2: Run the tests to verify they fail for the current header**

Run: `npm test -- tests/screens/flow-account.test.tsx -t "profile dialog"`  
Expected: FAIL because the IM button does not open a dialog.

- [x] **Step 3: Implement `ProfileAccountDialog` and connect it to IM**

Use Radix Dialog with a named title, description, Escape/overlay dismissal, and a content area capped at viewport height with vertical scrolling. Keep account behavior in `AccountBar`, forward `flowId`, and wrap the existing IM button as the trigger. Preserve deep-linked flow IDs and `view: 'detail'` in the initial route; derive `flowId` from `currentRoute` only for a flow-library detail.

- [x] **Step 4: Run the profile tests to verify they pass**

Run: `npm test -- tests/screens/flow-account.test.tsx -t "profile dialog"`  
Expected: PASS, including accessible dismissal, the real permission lookup, route retention, and flow-specific admin control.

### Task 2: Remove personal access controls from the Flows library

**Files:**
- Modify: `src/app/screens/flow-library/FlowLibraryScreen.tsx`
- Test: `tests/screens/flow-library.test.tsx`

**Interfaces:**
- `FlowLibraryScreen` retains its current signed-in-user key for `FlowDetail`; only the `AccountBar` render and imports are removed.

- [x] **Step 1: Write the failing library test**

Add one `FlowLibraryScreen` test that verifies the library no longer renders the account region or its `Personal sign in` button.

- [x] **Step 2: Run the test to verify it fails for the current UI**

Run: `npm test -- tests/screens/flow-library.test.tsx -t "account banner"`  
Expected: FAIL because the Flows screen still renders `AccountBar`.

- [x] **Step 3: Remove the account panel from Flows**

Remove `AccountBar` and its import from `FlowLibraryScreen`, preserving the session-dependent `FlowDetail` key and all existing index/detail handlers.

- [x] **Step 4: Run the focused tests**

Run: `npm test -- tests/screens/flow-library.test.tsx tests/screens/flow-account.test.tsx`  
Expected: PASS; profile opens/closes accessibly, sign-in retains granted editing, existing account behavior passes, and Flows contains no account banner.

- [x] **Step 5: Run module and combined verification**

Run: `npm run audit:modules`, then `npm run verify` once on the combined checkout after the related editors are finished. Report failures with their command and exact test/audit name; do not adjust existing thresholds or assertions.

Observed result: `npm run audit:modules` passed for 365 files. `npm run verify` ran the platform tests, typechecks, lint, formatting, and coverage; it stopped at coverage with 1 failure in `tests/components/native-demo-surface.test.tsx > plain data shell to Native root bridge > keeps the current view mounted until a rebuilt Native module is ready` (4,094 passed, 1 failed). The failure is outside this task's owned files; no unrelated test was changed.
