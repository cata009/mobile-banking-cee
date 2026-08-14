# Retire App 2027 future release

## Goal

For the PI / CZ Future App selector, remove the retired `App 2027` release completely. The remaining choices are `CZ Chatbot`, `CZ Robo`, and `Evo 2027`.

## Scope

- Delete the `release-future-app-2027` release definition and its `fx_app2027Homepage` feature manifest/configuration.
- Remove the release from project packs, selector compatibility, tests, and capability documentation.
- Preserve the shared 2027 homepage implementation, fixtures, and styling where Evo 2027 imports or depends on them. Rename only identifiers that are exclusive to the retired release when doing so is safe and necessary.
- Ensure an old URL containing `release=release-future-app-2027` falls back to a supported release rather than rendering the retired experience.

## Non-goals

- Do not change the UI, flow, fixtures, or behavior of Evo 2027.
- Do not alter the CZ Chatbot or CZ Robo releases.
- Do not touch unrelated local changes already present in the worktree.

## Verification

- Registry and selector tests assert that only the three supported PI/CZ Future releases are exposed.
- A legacy App 2027 URL is normalized to a supported release.
- Type checking, targeted tests, linting, and production build succeed.
