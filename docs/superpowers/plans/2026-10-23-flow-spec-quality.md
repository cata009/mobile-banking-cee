# Card guard editor quality pass

User explicitly requested another end-to-end review and implementation/refactoring for quality and UX. Continue inline under the existing authorization; preserve the approved Confluence composition, UniCredit design system, flow IDs and cloud storage contract. No commit, push or deployment.

Owner/base/initial pending files and pre-edit source snapshots: `docs/tasks/2026-10-23-flow-spec-quality.json`, `.codex-temp/flow-spec-quality/before/`.

## Approach

Reproduce concrete lifecycle defects before correcting them. Refactor narrowly at the boundaries that make those fixes easier to maintain. Improve the existing editor's status, recovery and version-history interactions rather than invent a new visual direction. Use existing buttons, tokens, icons and dialog primitives. Keep data and image exports lossless.

## Execution

- [ ] Audit runtime and the real host; independently review backend/client integrity. Record confirmed defects and UX weaknesses.
- [ ] Add regression cases for confirmed lifecycle/transport problems, observe failures, then fix them without weakening existing contracts.
- [ ] Extract focused presentation units where useful; improve history navigation/preview, state messages and editor keyboard behavior with accessibility and narrow-screen acceptance.
- [ ] Verify existing and new interactions in the real host, including failures/recovery and private cloud transport as affected.
- [ ] Review the final exact delta; run affected tests then one sequential full `npm run verify` on the stable combined state. Update the user guide and evidence.

## Ledger

- Initial checkout contains77 pending files from the approved editor/cloud work and the independent email builder; preserved. Source snapshots were recorded before tests or implementation edits.
- Current implementation uses Tiptap3, a Confluence writing dialog, optimistic revision checks, local recovery and private Blob storage. This pass retains those choices.
