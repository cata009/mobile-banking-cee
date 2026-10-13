# Italy Mobile First Profile Implementation Plan

**Goal:** Implement every profile area and documented flow in Figma page `24268:238892`, opened from the Italy Home avatar.
**Architecture:** Shared React/CSS page primitives; independent feature state machines for personal data, settings and services; root Profile composes them and owns the profile hub, persona selection, apps/token, promotions, branches and push details. Repeated Figma frames are states of a flow, not duplicated screens.
**Spec:** User-supplied PROFILE Figma page in file `d2TyUaQNN6YsgznQaWymIR` and repository `AGENTS.md`.
**Stack:** Existing React 18, strict TypeScript, CSS, Vitest, local SVG/image assets.

## Constraints

- Work in the existing checkout; preserve all pending edits and never change the Git index or branch.
- One active editor per file. Root owns shared Profile primitives, hub and `features/profile/mobileFirstProfile.ts`; workers own their allocated data/settings/services paths.
- Preserve Figma labels, frame intent and transitions; download exact visible assets, reuse exact project matches, never use a screenshot as a UI asset.
- Keep executable validation/state policies in feature modules. All actions are prototype state; no real credentials, signatures, payments, messages or remote writes are invoked.
- No weak placeholders, no no-op buttons, no weakened TypeScript/audit/coverage thresholds.

## Tasks

- [x] Root: create shared `MobileFirstProfilePrimitives.tsx` / `mobile-first-profile.css`, tested through navigation and form behavior. API: `ProfilePage({title,onBack,onClose,children,footer?,description?})`, `ProfileRow({label,detail?,value?,onClick?,icon?})`, `ProfileButton({children,onClick?,type?,disabled?,secondary?})`, `ProfileField({label,...inputProps})`, `ProfileTabs({labels,value,onChange,label})`.
- [x] Data worker: personal data, contact book and identity-document flows; persistent feature state, validation, canonical source ledger, tests. Default component `MobileFirstProfileData({entry,onBack,onClose})`, entries `personal|contacts|identity`. Public `getProfileDataSnapshot()` / `subscribeProfileData(listener)` provide a stable personal-data snapshot for the hub.
- [x] Settings worker: all settings/security variants, validations and persisted prototype preferences; tests. Default component `MobileFirstProfileSettings({entry,onBack,onClose})`, entries `settings|security`.
- [x] Services worker: support, bank, appointments, DOL and communications; tests. Default component `MobileFirstProfileServices({entry,onBack,onClose})`, entries `support|bank|appointments|documents|communications`.
- [x] Root: hub and communication tabs, REB selection, My Apps, Mobile Token, promotions/partner, branch search/filter/details and push notification states. Test back/close, unread status, validation and durable updates.
- [x] Integration owner: connect Home avatar, route logout to the existing demo lifecycle and add the combined manifest paths. Root connects its PFM avatar to Profile without modifying other owners' screens.
- [x] Root: sequentially review each worker's exact delta and canonical flow ledger; repair visual and functional gaps. Run affected tests, strict TypeScript, scoped lint/format and module audit.
- [x] Integration owner: `npm run verify` on the combined final checkout after relevant editors finish; report any unrelated in-progress failures separately. Final acceptance: exit 0, all 227 suites / 2,665 tests, unchanged coverage thresholds, all audits and build passed on 12 October 2026.

## Review focus

Empty search results; invalid or expired OTP; cancel without saving; close nested flows without losing the caller; settings/personal-data persistence across remount; long text and keyboard focus; system bar / fixed-footer overlap; persona-dependent actions; signed/archived document state and notification read counts; privacy masking. Tests belong to each feature's owner and exercise actual outcomes.

