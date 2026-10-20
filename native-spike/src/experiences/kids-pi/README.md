# Native Kids family

`NativeKidsApp` composes independent SK, HU and RO React Native experiences. The integration owner selects `KIDS_PI/current/release-current`; no PI/Czech experience supplies a fallback. Entry props are country, scenario, onExit, screenTopInset, bottomInset and optional AppLanguage.

Source remains canonical:

- SK: `src/experiences/kids-pi/sk/baseline/composition.tsx`, `src/app/screens/kids/sk/data.ts`, `SkBulbankScreens.tsx` and `kidsMarketHomeConcepts`. Four tabs, original account identity/currency, education/tasks/More content and balance visibility. Source shortcut/task/card/More tiles have no executable action and remain inert.
- HU: Source HU data, card identity, spend/ledger/grouping/formatting helpers, learn topics/artwork/progress, payment/More country configurations; canonical `features/kids/hu/goals` state/create/detail/add-money/schedule reducers. Home/Earning/Saving/Payments/More, request/send threshold and pending statuses, tasks, complete lesson slides/quizzes, goals/contributions/CRUD/source-account/schedule, card reveal/freeze/search/transaction/settings, messages/contacts/settings/language/appearance. HU menu shape deliberately follows Source's BA-derived four-card composition while currency/runtime stay HU. Docs/tutorials and card settings remain Source-inert.
- RO: Original teen payees and `decidePayment`, data/types, RON helpers and card identity. Home/Goals/Payments/Card/Profile; trusted instant payment, restricted/large parent approval and weekly/payee caps; explicit parent demo approve/decline, request/top-up and task reward loop; goals/create/add/contributions/completion; card freeze/online/contactless/ATM state, transactions/insights/profile. No free IBAN input. Romanian copy stays Romanian because this Source composition has fixed Romanian copy.

Native fields invoke the OS input system. Source SVG icons/fonts and HU bitmap artwork are consumed unchanged. Seven Source theme choices apply their original linear-gradient stops/palette; the native color renderer interprets Source color-mix values without converting images. Disclosure waits for the native privacy port before displaying card data and invalidates pending authorization on Back/background/unmount. Missing biometric hardware offers explicit demo continuation; there are no real payments, parent messages or external sending.

Inactive Kids does not have a Source-developed child identity composition. The native family displays unavailability; the global selector should keep inactive launch disabled.

## Verification and limits

Two owned Jest suites cover twelve behavioral/rendering regressions: SK inert actions/tab content, RO payment decisions/approval/balance/control state, HU approval threshold and canonical goal source-balance readiness, quiz completion, disclosure privacy/late completion, and original theme colors/stops. Tests and zero-warning owned ESLint pass. Logs/ownership/exact hashes are recorded in `.codex-temp/native-demos-extension/kids-*`; the integration owner runs final combined native and Source gates after all editors freeze.

This is an initial functional native port, not complete visual acceptance. Presentation uses Kids-owned native composition and shared controls; full Source geometry, card branding/flip/frost, hero/weekly rings, theme ambient radial layers/motion/glass, lesson sheets, collapsing/sticky layouts, merchant enrichment/details, complete localized shared HU services and physical Android safe-area/keyboard/biometric parity remain verification/fidelity work. No APK/device/browser visual acceptance, publication or process-death persistence is claimed. Child Source shells keep these drafts session-local; the native family does likewise.
