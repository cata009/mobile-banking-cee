# Risk Map

Last updated: 2026-05-27

## High Risk

| Risk | Why It Matters | Current Mitigation |
| --- | --- | --- |
| Reintroducing a catch-all `variant` concept | Future PI/SME and next DS work becomes hard to reason about | Runtime now uses explicit product, release, baseline, and design-system state |
| Demo control panel implies capability coverage that is not implemented | Stakeholders or AI may over-trust incomplete areas | Add coverage/status metadata and visible warnings later |
| Generated/imported visual assets are large and fragile | Refactors can break pixel-level demo fidelity | Keep screen registries and avoid broad rewrites |

## Medium Risk

| Risk | Why It Matters | Current Mitigation |
| --- | --- | --- |
| Translation docs are stricter than current coverage | Localization confidence is uneven | Track translation coverage as future capability |
| No tests beyond build | Runtime regressions can slip through | Use build now; add targeted tests later |
| Larger-platform integration contract is not formal yet | Extraction may become painful | Define project model and embeddable contract before runtime split |

## Low Risk

| Risk | Why It Matters | Current Mitigation |
| --- | --- | --- |
| AI OS docs may become stale | Future sessions lose continuity | Banana Loop requires docs triage |
