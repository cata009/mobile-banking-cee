# Card guard specification authoring

## Visual correction requested by the user

The user rejected the first embedded-card UI on 22 October 2026 and explicitly requested the Confluence style of the supplied all-in-one source. Replace that presentation with the source's dedicated writing mode: compact document action bar, contextual page title, one-line icon toolbar with grouped menus, a wide uninterrupted document canvas, and secondary metadata/settings hidden from the writing surface. Preserve the UniCredit shell/tokens and every working persistence/export behavior. Read mode is a document page, without duplicated nested card headings. Update/Close flush and return to read mode; saved status/history remain accessible. This direction supersedes the first generic toolbar layout and is approved for implementation by the user's message.

Approved by the user in chat on 22 October 2026, including end-to-end implementation without additional approval gates.

Add a Tiptap document editor to Card guard's Business analysis panel. Port the all-in-one editor's extension/toolbar, attachment-reference and autosave patterns into the existing Vite/React host. Keep UniCredit tokens, shared buttons, flow IDs, scenario order, executable policies, screen contracts and all existing exports.

Store one schema-validated rich JSON document, separate image assets and append-only revisions. Read mode, editor, Confluence copy and Word export consume that same document. Seed from the existing BA definition; never write to flow source from the browser. Autosave after 1500 ms with serialized requests, explicit errors, local recovery, conflict detection and a flush before export/Done. Restore appends a revision. Assets preserve original PNG/JPEG bytes and do not repeat in history.

Provide a local durable file service via Vite and a deployment handler supporting configured persistent disk. A serverless host without durable storage must report unavailable rather than pretend to save. Do not deploy or provision infrastructure in this task. Describe this deployment requirement clearly.

Word export preserves rich formatting, tables, lists, links, embedded user images and all existing captured scenario screens; no missing-image success. Confluence copy retains text formatting and explicitly directs users to Word for the complete image transfer. Backend endpoints validate document/asset limits, reject unsafe links or images, use same-origin mutations and existing access-cookie authentication outside local development.

Acceptance: edit, autosave, reload, inspect and restore history; insertion/reload/export of multiple images; export waits for the latest draft; stale saves cannot overwrite another revision; flow/navigation/DS regressions remain green. Test focused behavior, inspect the real browser and run npm run verify once on the combined final state.
