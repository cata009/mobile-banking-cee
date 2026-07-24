# Kids Serbia — „Nikola, 12-18" — Design Spec

**Date:** 2026-07-24
**Status:** Approved
**Author:** ZCode session

## Context & goal

The repo has two existing Kids concept forks: SK (Bulbank document-inspired) and HU (CEE Light Restyle, described by the operator as „ok facut" / well-made). A third — RO Teens — was produced by another AI agent and judged „mediocru / arată ca naibi" (mediocre / looks like hell). Serbia Kids was previously deleted (2026-07-07) and is currently a planned placeholder.

**Goal:** build a **Kids Serbia** concept that is measurably **superior to both RO and HU** — a self-contained, payments-with-approval + educational-coach app for the 12-18 segment, in Serbian Latin script, RSD currency. It must reuse HU's proven theming engine by import (HU untouched), avoid every flaw that made RO mediocre, and wire correctly into all registries (including three that RO skipped).

## Audience & persona

- **Segment:** 12-18 (grows-with-you tone — mature enough for real payments toward 18, guided enough for an educational coach toward 12).
- **Persona:** Nikola, 14, Belgrade. Parent: Tata (Milan).
- **Currency:** RSD, locale `sr-RS`, **Latin script** (`sr-Latn` convention in copy).

## Two signature features (balanced)

### Feature #1 — Payments with approval (beats RO)

`pick approved payee → amount with chips → live decision → result`.

- **No IBAN entry** — the child pays only against Tata's approved payee list.
- **Live decision engine** `decidePayment(amount, payee, ctx)` — pure, ordered, and **balance-aware** (RO's was balance-blind):
  1. `amount <= 0` → `blocked`
  2. `amount > payee.perPayeeLimit` → `blocked`
  3. `amount > weeklyRemaining` → `blocked`
  4. `amount > balance` → `blocked` *(new vs RO — RO green-lit payments the balance couldn't cover)*
  5. `payee.alwaysNeedsApproval` → `needs-approval`
  6. `!payee.trusted && amount > instantThreshold` → `needs-approval`
  7. else → `instant`
- Instant payments decrement balance and add to weekly spend; large ones become pending approvals; approval moves the money (closes the loop).
- **Real Serbian merchant marks** (SVG, not emoji): Maxi, Gomex, Yuh, Netflix, Spotify, DM, Miloš Kafić, etc.

### Feature #2 — „Uči" educational coach (beats HU on interactivity)

- 5 financial modules × 3-4 lessons each: **Budžet**, **Štednja i kamata**, **Bezbedne kupovine** (anti-fraud), **Ciljevi**, **Vrednost novca**.
- Each lesson = slides + quiz with immediate feedback; completion → small RSD reward credited to balance + badge.
- This is the second leg RO lacked entirely (RO had no Learn module).

## Why this beats RO — the five flaws, fixed

| RO flaw | Serbia fix |
|---|---|
| One visual primitive (`RoCard`) for every surface | Real component vocabulary: `HeroCard` (themed gradient), `GlassCard` (translucent), `ListCard` (grouped), `StatTile`, `Banner` — with visual hierarchy |
| Dead hero on first load (default theme = gray bg + centered text + 👋) | Boot on a non-default preset → hero alive from second one, with atmospheric motion layer |
| Emoji as the icon system (📱🎧🛹) | `AppIcon` (lucide set) for goals/actions + SVG brand marks for merchants |
| No motion, static success moments | Overlay enter/exit transitions, animated `SpendRing` arc, success choreography (scale/glow) on instant payment + goal completion |
| Hardcoded dates `2026-07-23` / „Azi" that rot instantly | `dayKey`/`dayLabel` derived from `new Date()` at creation time |

**Additionally (RO missed these):**
- Concept registry is the **single source of truth** for greeting/hero/nav (RO shipped dead duplicated data — "split-brain").
- `decidePayment` is **balance-aware** AND **unit-tested** (RO's was neither).
- Three registries RO skipped (`projectPackRegistry`, `screenRegistry`, `flowRegistry`) are wired correctly.

## Architecture

```
src/app/screens/kids/rs/            # self-contained (like RO; never imports RO, never edits HU)
├── RsTeensApp.tsx                  # shell: state via reducer/context (NOT a 515-line god component)
├── money.ts                        # RSD helpers (sr-RS locale, comma decimal, " RSD" suffix)
├── types.ts                        # RS domain types
├── payees.ts                       # Serbian payee catalog + decidePayment() (balance-aware, pure)
├── data.ts                         # seed: Nikola, balance, tx, goals, tasks, approvals, learn progress
├── chrome.tsx                      # header + bottom nav with raised "Plati" hero tab
├── ui/
│   ├── cards.tsx                   # HeroCard, GlassCard, ListCard, StatTile, Banner
│   ├── atoms.tsx                   # Avatar, StatusPill, SpendRing (animated arc), AmountField, DecisionBadge
│   └── merchantLogos.tsx           # Serbian brand marks (SVG)
├── learn/
│   ├── topics.ts                   # 5-module curriculum + lessons + quizzes
│   └── LearnScreens.tsx            # Learn index, topic, lesson+quiz player, reward
└── screens/
    ├── home.tsx                    # hero balance, quick actions, approval rail, animated spend ring, recent activity
    ├── payments.tsx                # payments hub: quick-pay grid, actions, subscriptions, "how approval works"
    ├── payFlow.tsx                 # the star: pick payee → amount (live decision) → result
    ├── approvals.tsx               # inbox + "simulate Tata's decision" (closes the loop)
    ├── moneyFlows.tsx              # Traži novac / top-up from Tata
    ├── goals.tsx                   # list / detail / create
    ├── card.tsx                    # visual card, freeze, online/contactless/ATM toggles, limits
    ├── activity.tsx                # day-grouped tx list + transaction detail
    ├── insights.tsx                # spending by category
    └── profile.tsx                 # Nikola header, parent link, chores→reward loop, theme entry
```

**HU reuse (import, untouched):** `HuThemeShell`, `getHuTheme`/`getHuThemeStyle`, `HU_THEME_PRESETS`, `HuThemeMotionLayer`, the `--hu-theme-*` CSS vars and keyframes in `src/styles/theme.css`.

## Wiring (3 files edited + 3 fixed that RO skipped)

1. `src/data/kidsMarketHomeConcepts.ts` — add `"RS"` to `KidsHomeCountry`, `"rs-teen-fintech"` to `KidsHomeStyle`, `"RS"` to `KIDS_HOME_COUNTRIES`, an `RS:` concept entry (single source of truth — consumed by the app, not dead data).
2. `src/app/screens/kids/KidsMarketHomeApp.tsx` — dispatch `rs-teen-fintech` → `<RsTeensApp />` + import.
3. `src/app/navigation/routePolicy.ts` — add `|| country === "RS"` to KIDS_PI eligibility + `"theme"` status-bar variant.
4. `src/app/registry/projectPackRegistry.ts` — add RS to `KIDS_MARKET_CONCEPT_COUNTRIES` + screen map (RO skipped this).
5. `src/app/registry/screenRegistry.ts` — add `kids.rs.home-concept` entry (RO skipped this).
6. `src/app/registry/flowRegistry.ts` — add RS to the kids bottom-nav comparison flow (RO skipped this).

## Testing

- **Dedicated `decidePayment` matrix test** (instant / needs-approval / blocked × trust × thresholds × balance × weekly cap) — RO had zero tests here.
- RS render test (hero, nav, „Plati" / „Traži novac" present).
- Pay-flow interaction test (click „Plati" → curated payee picker appears).
- Learn module completion → reward test.
- `KIDS_HOME_COUNTRIES` pockets test updated with RS entry.
- `route-policy.test.ts` updated with RS assertion.
- Full verify chain: `typecheck`, `lint`, full test suite, all audits, `build`.

## Boundaries (honest limits — same as HU/RO)

- Deterministic front-end mock only. No banking backend, no real payment execution, no persistence beyond session state, no real parent approval, no real biometrics, no ledger posting.
- This does not add real activation, legal consent, wallet/card operations, notifications, or audit trails — consistent with the existing SK/HU/RO kids concepts.
