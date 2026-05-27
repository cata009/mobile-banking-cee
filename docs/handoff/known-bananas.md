# Known Bananas

Known bananas are triaged risks that can sabotage a future session if forgotten.

## Active Known Bananas

| Banana | Impact | Triage |
| --- | --- | --- |
| Platform capability map says there is no product handoff/audit workflow | This remains true for product features, but repo-level AI handoff now exists | Do not treat AI OS docs as a banking product capability |
| Several active UI strings are hardcoded in English | Country/language confidence is lower than translation docs imply | Keep as task until translation coverage is expanded |
| Feature registry contains features that are not all rendered by active screens | Demo panel may imply more coverage than UI currently provides | Use feature coverage metadata and control panel warnings |
| Vite build warns about chunks larger than 500 kB | Build passes, but future load performance can degrade | Consider code splitting and asset strategy after architecture/control-panel work |
| Existing dev servers on `6000`/`6001` may be stale | Browser checks may show mixed old/new module state | Prefer a fresh dev server port for verification when metadata appears stale |
| SME and next design system are selectable but not implemented as real flows | Users may expect complete mobile screens after selecting them | Runtime now shows a planned-state placeholder until real screens are added |
| No local TypeScript CLI or `typecheck` script is installed | `npx tsc --noEmit` cannot be used as verification yet | Add `typescript` and scripts for `typecheck`, `lint`, and tests before broad refactors |
