# Profile-based access to flow editing

Date: 2026-10-29  
Status: Approved by the user in this task

## Intent

Move personal sign-in out of the Flows library and into the existing IM profile control in the global header. This keeps library pages focused on flow discovery and lets an authorized person sign in from anywhere, then continue editing the flow already open.

## Goals

- Open a profile dialog from the IM header button.
- Reuse the current account controls for sign-in, password change, sign-out, and user administration.
- Remove the account access banner from the Flows library.
- Preserve the current route and flow selection after sign-in; existing per-flow permissions decide whether editing is available.
- Keep the current flow ID available to user administration while the dialog is opened from a flow detail.

## Non-goals and anti-goals

- Do not change authentication endpoints, role policy, flow permissions, or server behavior.
- Do not grant edit access merely because someone signs in.
- Do not change flow definitions, IDs, ordering, scenarios, exports, or read-only preview behavior.
- Do not add a separate profile route or copy the account form into the header.

## Approaches considered

1. **Profile dialog (chosen):** the IM button opens a Radix dialog containing the existing `AccountBar`. It has room for sign-in and the longer user administration form while preserving the current screen. The dialog receives the active flow ID on a flow detail.
2. **Anchored popover:** keeps the controls beside the avatar, but the form and administration controls need a tall, scrollable panel and constrained space.
3. **Separate profile route:** offers room for account management, but navigates away from the selected flow and adds a destination that is unnecessary for this small change.

## Constraints and implementation calls

- The profile button already lives in `DemoTopBar`; `PlatformProvider` is mounted above the app, and `AccountBar` already owns the collaboration login behavior.
- `FlowDetail` already requests the signed-in user's permissions and enables editing only when the server grants it. The dialog must not bypass that check.
- The Flows library and its tests already have local uncommitted work. Preserve it and make narrow, context-aware edits.
- Reuse the existing Radix Dialog dependency. Keep the dialog keyboard accessible, with an accessible title, Escape dismissal, and scrollable content.
- When the active route is a flow detail, pass its flow ID to `AccountBar` so its existing flow-specific access controls remain available.
- Preserve the flow ID and detail view in `resolveInitialNavigation` for direct flow links so the global profile control receives the same flow context as the library coordinator.

## Verification

Add or update focused tests proving that IM opens the personal account dialog, login updates the session without navigating away, and the Flows library no longer renders the account banner. Run the affected tests and `npm run audit:modules`, then have the integration owner run `npm run verify` on the combined checkout after other editors finish.

## Ownership and baseline

- Owner: `/root` (integration owner for this task).
- Base commit: `745956e19c87f52bfc84267fa328c48479ccf24e`.
- Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
- Initial pending changes: 192 paths were already modified or untracked when this task began. The complete baseline `git status --short` output is preserved in this task's tool history. Relevant existing pending paths include `src/app/screens/flow-library/FlowLibraryScreen.tsx`, `tests/screens/flow-library.test.tsx`, the untracked `src/features/flow-collaboration/` feature, and `tests/screens/flow-account.test.tsx`.
- Owned paths for this task: this design document; `docs/superpowers/plans/2026-10-29-flow-profile-access.md`; `src/app/components/demo/DemoTopBar.tsx`; `src/app/navigation/initialNavigation.ts`; `src/app/screens/flow-library/FlowLibraryScreen.tsx`; new `src/features/flow-collaboration/ProfileAccountDialog.tsx`; `tests/screens/flow-library.test.tsx`; and `tests/screens/flow-account.test.tsx`.
