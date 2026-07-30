# CZ Future Robo Advisor design

## Approved sources

- Figma `Investments - CEE - DBN`, section `12928:73212` (`SBL-XXXX CZ Robo Advisor — V2 DS-compliant`).
- The supplied continuation handoff for `Mobile PI CZ - Future - Robo`.
- Existing Mobile PI Investments and shared flow components in this repository.

The Figma section and handoff are the approved visible direction. Baseline Investments remains unchanged.

## Runtime boundary

Robo Advisor is a second isolated CZ Future preview, parallel to `CZ - Chatbot`. It receives its own release and feature IDs and is available only for Mobile PI, Czech Republic, current design system, active application. Selecting it does not activate the chatbot.

The global route remains `investments`; `InvestmentsPortfolioScreen` owns the Robo sub-flow just as it already owns product detail, history handoffs, and buy/sell sub-flows. This keeps integration portable and avoids inventing a global route taxonomy for an Investments-local journey.

## Journey

The initial portfolio remains the existing Mobile PI Investments experience. In the Robo preview it gains a DS-consistent `Investment goals` entry. The Robo surface supports:

1. Intro and conditional first-goal contact check.
2. Existing investor profile check:
   - valid profile can continue and may optionally update;
   - missing/expired profile blocks continuation and hands off to the existing MiFID update.
3. Goal type, name, target and time horizon.
4. One-off, regular, and combined funding, each using one unified setup screen with its cash account.
5. One-to-three suitable strategies, strategy-specific projection, suitable portfolios, and portfolio holdings.
6. Review with conditional funding fields, provisional document labels, explicit investment-risk disclosure, terms acceptance, shared secure signing, processing, and success.
7. Goal overview and management entry points for adding money, monthly investment, withdrawal, goal settings, transactions and orders.

## Data and legal honesty

All values are deterministic demo data. Goal category is organizational and does not drive portfolio eligibility. Portfolio suitability is presented as a mock result of profile, goal and horizon, not as a claim of real advice.

No unsupported cost amount, eligibility threshold, guaranteed return, or separate legal-document screen is introduced. Projection values are labelled illustrative and not guaranteed. The review includes only provisional document names until Business/Legal confirms the final set. Contact validation remains a conditional first-goal step and is not expanded into an unconfirmed business rule.

## Design-system reuse

Reuse `PageHeader`, `PrimaryButton`, `TextField`, `NavigationRow`, `SectionHeadingDivider`, `ToggleButton`, `AppIcon`, `StandardSignScreen`, and the Investments chart/period visual language. New composition is limited to Robo-specific cards and projections; typography, tokens, spacing, controls, safe area, and scroll behavior come from the existing system.

## Verification

- Registry tests prove isolation from baseline and Chatbot.
- Model tests prove valid/expired profile behavior and the three funding variants.
- Component tests traverse creation, projection, portfolio, review, sign/success, and goal management.
- Focused typecheck/lint/build and browser smoke verify the integrated preview.
