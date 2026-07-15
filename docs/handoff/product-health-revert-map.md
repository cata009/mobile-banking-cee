# Product Health Revert Map

Baseline: `453e7e2`. Branch: `codex/product-health-hardening`.

Revert commits in reverse order inside one direction; do not revert shared foundations before their consumers.

| Direction | Commits |
| --- | --- |
| Access/security and reproducible gates | `2ead276`, `850602f`, `4c922f8`, `3f359e8`, `ce443cd`, `94f7785`, `ec73bd9` |
| Type/lint recovery and edge guards | `e4cc7cb`, `691fad2`, `05554f6`, `5a1edec`, `071f7a6`, `0d51488`, `954c752`, `8a9943f`, `2316dec`, `74215b9` |
| Navigation and route restoration | `8294918`, `5b4e5d5`, `60df526`; disappearing-product normalization is in `f3ea71f` |
| Product data authority | `96308de`, `d0d3a65`, `f3ea71f`, `ef5c106` |
| CZ Chat | `2e491f9`, `82e5ed8`, `7a4abd2` |
| HU Kids boundaries | `1f73436`, `0dd36c4`, `f227b68`, `e1a9fca` |
| Panels | `2642bf6`, `6244668` |
| Investments | `0320e4c`, `6825de6`, `211df28`, `5bf20f2`, `58075b0` |
| Assets/PNG and exporter safety | `c546875`, `dc48491`, `a27b189`, `1d02eda`, `305a310` |

Before any revert: run `npm run verify` and repeat the five-route smoke recorded in `current-session.md`.
