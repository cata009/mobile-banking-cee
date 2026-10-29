# iPhone Duo implementation plan

Goal: executable content-driven adaptation on port 4004 using the existing baseline and preserved device IDs.
Spec: `docs/tasks/2026-10-29-iphone-duo.md`.
Architecture: a plain preview geometry crosses the existing React18/React19 data bridge; native wrappers constrain actual screens and modals without changing feature policies. System chrome remains outside bank content.

- [x] Characterize geometry and device-label changes with failing tests.
- [x] Rename profiles, apply report fixtures and an approximate system strip; preserve the clean workbench UI.
- [x] Pass geometry through both application bridges; share screen/modal bounds and full-bleed backgrounds.
- [x] Apply content-family widths, retain linear Home/lists/forms and limit multi-region layouts to related content/options.
- [x] Match the hardware silhouette to Apple's visual references and preserve review poses in URLs.
- [x] Restore open-device rotation, reorient system chrome, and preserve input/step state across every profile transition.
- [x] Apply the user-specified LVL1 backgrounds and full-glass vertical Spending section surfaces, including drill-ins.
- [x] Address independent review findings: provider-only screen context, local readable form/success roots, and fallback safe bounds for other preview contexts.
- [ ] Verify actual baseline navigation and relevant overlays in closed/open views; preserve normal phones.
- [ ] Run affected tests, native checks, module audit, then the combined verify sequentially; record limitations and exact delta.
