# My Banker (Serbia) — handoff for a follow-up discussion

**What this is.** A self-contained briefing on a feature built into the UniCredit CEE mobile-banking demo app, and on the argument that developed around the business requirement behind it. It is written so that an agent with no access to the original session can pick up the discussion. Written 2026-09-11. The original working session was in Romanian; continue in whichever language suits — the specification, the code and the question bank are in English.

**Who you are talking to.** A product/design lead on the UniCredit CEE mobile-banking prototype platform. They own the demo app used to show concepts to stakeholders in eight CEE markets. They did not write the business requirement; they received it and have concluded it is conceptually wrong. They want to challenge it with the business owners and are preparing for that conversation.

**What they need from you.** Sharpening of the argument, rehearsal of the meeting, counter-arguments the business will raise, and judgement on where to concede. They are not looking for validation — they have already rejected two versions of this work for being too weak, so expect and welcome pushback in both directions.

---

## 1. The platform, in one page

- React + TypeScript + Vite + Tailwind demo app: a mobile-banking prototype for UniCredit in RO, CZ, SK, HU, **RS**, BA, BA_BL, SI.
- Everything is driven by a **demo context**: product (PI / SME / Kids), country, release, banking scenario, language, theme. A top bar switches them; the URL encodes the full state as a deep link.
- **Releases** are the mechanism for showing future concepts beside today's app: `release-current` is the baseline, and each future concept is its own release bundle gated by feature flags. Existing examples: `release-future-cz-coapping` (chatbot), `release-future-cz-robo` (robo-advisor), `release-future-evo-2027` (Evo 2027 homepage, CZ only).
- Everything a release changes must be gated so the other seven markets stay untouched.

---

## 2. The original business requirement (verbatim substance)

Delivered by the Serbian business team as user stories US-6.1 to US-6.5. Condensed below, keeping every acceptance criterion that matters to the argument.

### US-6.1 — Product list by profile
Screen loads recommendation data automatically on entry, with a loading indicator. Product list is driven by the active client-type attribute **B00CLT**. Theme and navigation adapt to profile type. If the analysis fails, render a safe fallback (empty state, no crash).

- **Individuals (FL):** Term Deposit, **Cash Loan**, **Mortgage**, **Credit Card**, Investment Fund, **Overdraft** — four of six are credit products.
- **Companies (PL):** Term Deposit, Working Capital Loan, Investment Loan, Factoring, FX forward, Overdraft, Guarantees — six of seven are credit or risk products.

### US-6.2 — Peer grouping for individuals
- Age derived from date-of-birth field **B00DOB**. Bands: `<25`, `25–34`, `35–44`, `45–54`, `55+`.
- Monthly income derived from field **B70AMT**. Bands: `≤1,499 EUR`, `1,500–2,499`, `2,500–3,499`, `≥3,500`.
- Peers are selected **only when both bands match**.
- A peer group is valid only with **at least 5 clients**; the UI displays the number of similar clients used.
- Below 5 (including 0): percentages display as **"no info"**, no error, and no peer count under the threshold is displayed.

### US-6.3 — Peer grouping for companies
Industry from **B00FRY** shown as "code – NACE description"; revenue from `financial_reports` for the last reporting year, banded `≤5,000k EUR`, `5,001–15,000k`, `15,001–50,000k`, `≥50,001k`. Same minimum of 5. **Declared out of scope by the user — this release serves individuals only.**

### US-6.4 — % of peers using a product
- Usage aggregated across the peer set per product; percentage = `(peers using the product / total peers) × 100`.
- Shown on each card, e.g. "68% of similar clients".
- Below the minimum group size, all products show "no info".
- **The product list is sorted in descending order by peer adoption percentage**; "no info" rows sort last.
- Existing client products are checked against the catalogue and marked **"Active" / "In use"**; the rest are marked **"Recommended"**. Both stay visible. Retail and business catalogues use different product keys.
- **Transparency:** an informational banner explaining the peer-based concept, **directly below the screen header and above the product list**, showing the number of similar clients (or "no info") and, for individuals, the **actual age range and income range** of the matched group.

### US-6.5 — Product detail, rates, terms, simulation, request
- Each product card expands and collapses individually. Collapsed: name, % of peer usage, status label. Expanded: full description, purpose ("namena"), rate, term range, and simulation inputs.
- **Rates, term ranges and purpose come from the Core system / product catalogue.** The app contains no business logic for determining rates — it reads and displays whatever parameterisation Core defines. Rate parameterisation (whether it varies by amount, term, or is fixed) is owned by Core. Rates are configurable business data, never hard-coded in the UI.
- Client adjusts amount, currency (RSD/EUR) and duration within the product's term range. The app retrieves the applicable rate for that combination from Core, then calculates: **indicative return** for deposit/fund products, **indicative monthly instalment (annuity)** for lending products. Values update dynamically with clear labels.
- Each eligible expanded card has a **"Send request"** CTA opening an inquiry pop-up pre-filled with product context plus a free-text field. Confirm or cancel; cancel loses no data.
- On confirmation an e-mail goes to the client's assigned **RM** with client identifier, product name, amount/term/free text; the client sees a success state. **If the e-mail fails, the client still sees success and the failure is logged** — client experience is not blocked by a delivery issue.
- **Tracking:** card view, card expand, simulation run and request submission logged as distinct events with client ID, product and timestamp, for later engagement/conversion reporting.

---

## 3. What was built

Fully implemented, verified, on branch `main` (uncommitted working tree at time of writing).

### Release and gating
| Item | Value |
|---|---|
| Release id | `release-future-rs-my-banker`, label **My Banker** |
| Feature flag | `fx_rsMyBanker` — RS + PI only, `current` design system |
| Runtime screen | `my-banker` |
| Registry screen id | `pi.my-banker.recommendations` |
| Reach it | Top bar → PI - Serbia → Future App → My Banker |

### Files created
```
src/data/myBankerCore.ts                             mocked Core system
src/app/screens/my-banker/myBankerState.ts           all business rules, pure functions
src/app/screens/my-banker/MyBankerScreen.tsx         the screen
src/app/screens/my-banker/MyBankerHero.tsx           position + transparency banner
src/app/screens/my-banker/MyBankerProductCard.tsx    lead + row variants, simulation
src/app/screens/my-banker/MyBankerPeerStrip.tsx      peer group drawn as dots
src/app/screens/my-banker/MyBankerEntryCard.tsx      entry module (inside Investments)
src/app/screens/my-banker/MyBankerRequestSheet.tsx   inquiry sheet
src/app/screens/my-banker/myBankerRmNotification.ts  RM e-mail mock (never rejects)
src/app/components/TabbedScreen.tsx                  adds the tab bar to a detail screen
src/translations/myBanker.ts                         EN base + sr overrides
tests/screens/my-banker-state.test.ts                24 tests
tests/screens/my-banker-screen.test.tsx              7 tests
docs/my-banker-rs-handoff.md                         this document
```

### Architecture, in the order data flows
1. **`myBankerCore.ts` — the mocked Core system.** Client attributes (`clientId`, B00CLT type, B00DOB, B70AMT monthly income in EUR); a 38-peer sample; a six-product retail catalogue. Each product carries: icon, simulation kind (`return` / `installment` / `revolving`), amount ranges per currency, term range, a **rate card** (rows of currency × amount window × term window → annual rate), and `peerTypical` (the group's typical contract). The rate card is the only place a rate exists — the app looks one up and never computes one, which is the literal reading of US-6.5.
2. **`myBankerState.ts` — every rule as a pure function.** Age derivation from B00DOB, the five age bands, four income bands, peer matching on both bands, the ≥5 minimum (`isPublishable`), adoption percentages, descending sort with "no info" last, mapping the client's real portfolio to catalogue keys, rate resolution, annuity / compound-return / revolving-interest maths, clamping to range and step, the coverage calculation, lead selection, and the tracking event log.
3. **The screen** runs the analysis on entry over ~1.5s, narrated in three steps that match the real work (read profile → match band → count products).

### The demo data
- Matched band for the shipped persona: **35–44 years, 2,500–3,499 EUR → 24 peers.**
- Adoption, as computed from the peer table: Overdraft **63%** (15/24), Credit card **54%** (13/24), Cash loan **46%** (11/24), Term deposit **38%** (9/24), Mortgage **21%** (5/24), Investment fund **17%** (4/24).
- `peerTypical` per product: term deposit 420,000 RSD / 12m · cash loan 780,000 RSD / 48m · mortgage 72,000 EUR / 240m · credit card 120,000 RSD · investment fund 180,000 RSD / 60m · overdraft 65,000 RSD.
- RM: **Marko Jovanović**, `marko.jovanovic@unicreditgroup.rs`.
- **Demo lever for the "no info" state:** the banking scenario `retail-prospect` switches to a persona in the `<25 / ≤1,499 EUR` band, which holds only 3 peers — under the minimum. No special-casing in the screen.

### Navigation changes this release makes (all flag-gated)
The user explicitly authorised these; they do not follow from the requirement.
- **Spending leaves the tab bar** and becomes an icon in the Home header rail, next to hide-amounts (`HomeHeader onSpendingClick`, which already existed).
- **Investments takes the freed tab** (`BottomNavigation` gains an `investments` item and a `MY_BANKER_NAV_ITEMS` set; `TabbedScreen` gives the investments screen the tab bar; `bottomInset` keeps its action bar clear of it).
- **The Home investments accordion moves into that tab** (`AccountSummary excludeCategoryKeys`).
- **The My Banker entry module sits above the portfolio tabs** inside Investments (`InvestmentsPortfolioScreen headerSlot`).

### Verification status
- `npx tsc --noEmit` clean.
- **1007 tests across 104 files pass**, including 31 new ones.
- ESLint: 165 warnings, **identical to the `main` baseline** — the feature adds none. The repo's 150 budget was already exceeded before this work.
- Two failures that pre-exist on clean `main` and are unrelated: `tests/screens/rs-property-insurance.test.tsx` (35 failures) and `npm run audit:assets` (asset baseline 232 vs 250 files).

### Deep links for demos
```
# The screen, English
http://localhost:4004/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-my-banker&bank=retail-multi-account-card&theme=light&lang=en&screen=my-banker

# The "no info" state (peer group below the minimum)
…&bank=retail-prospect&screen=my-banker

# Force a portfolio so most products read as recommendations
…&count_accounts=1&count_debit_cards=1&count_credit_cards=1&count_deposits=0&count_savings=1&count_loans=0&count_mortgages=0&count_investments=0
```
Dev server: `.claude/launch.json` → "Mobile Banking CEE 4004". Local access gate password `CE&EE2025-`.

---

## 4. How the UX got to where it is — three versions, two rejections

This matters: do not re-propose what was already rejected.

**Version 1 — rejected as "a catalogue with percentages".** Header, a bordered explanation box, then six identical cards each with name, "63% of similar clients", a status chip and a thin progress bar. The user's verdict: no hierarchy, no moment, the percentage is abstract, the loud teal "In use" chips drew the eye to exactly the products that no longer matter, and the expanded card was a wall where the rate and the result had equal weight.

**Version 2 — rejected as still being about other people.** Rebuilt around position: a hero saying "you have 1 of 6 products people like you use" with one progress segment per product; one **lead card** arguing for the most-used product the client lacks; the rest as compact rows; the peer group drawn as **one dot per peer** so "15 of 24" is countable rather than asserted; a **result-first calculator** (the figure large at the top, the inputs that move it underneath); the simulation seeded from `peerTypical` with the group average marked on the duration slider; the analysis narrated during its 1.5s.

**The critique that forced version 3, in the user's words:** *"'15 of 24 clients like you use overdraft' has ZERO UX value. Nobody cares that 15 other people have an overdraft."*

**Version 3 — current.** The hierarchy is inverted. The headline on the lead card is now what the product does **for this client's money**, composed from the live simulation:

> **"A 65 000 RSD buffer for the days between an expense and your salary — 1 294 RSD a month only while you use it."**

The peer percentage dropped to a small grey line underneath, beside the rate: *"15 of 24 people like you have it · from 21.5% p.a."* It is still on screen only because US-6.4 requires it. Every product has its own `rationale` string in the translations with `{amount}`, `{figure}`, `{months}`, `{total}` placeholders filled from the simulation.

**Where the peer data now genuinely earns its place:** as **calibration**. The simulation opens on the group's typical contract (65,000 RSD for an overdraft, 780,000 over 48 months for a cash loan) instead of an invented default, and the group average stays marked on the slider so every adjustment is a move relative to what comparable clients chose. This use is invisible, uncontroversial, and needs no percentage on screen. **Concede this early in any discussion — it is true and it buys credibility for the rest.**

---

## 5. The conceptual critique — the substance of the argument

### 5.1 The premise fails before the model does
Credit demand is **event-driven**: someone wants to buy something, or has to pay something, and does not have the money. The trigger is an event outside the bank plus a gap. The bank does not create that demand; its job is to be **present, and cheapest, at the moment the demand appears**.

Peer adoption answers a different question — *who is statistically likely to hold this product* — which is a **targeting** question, useful internally for campaign lists. The client's question is *I have a need right now, what is my best option* — a **timing and cost** question. Peer adoption has no bearing on the second.

The one-line formulation to put on the table:

> **Peer adoption tells us who is likely to hold a credit product. It tells us nothing about who needs one today. Credit is a moment business, and this specification has no concept of a moment.**

### 5.2 Is the peer analysis explicitly required for credit products?
**Yes, with no carve-out.** US-6.1 lists four credit products out of six for individuals; US-6.4 requires the percentage per product and ranks by it; US-6.5 explicitly requires the lending instalment simulation and a "Send request" CTA. The PL list is six credit/risk products out of seven. This is not a drafting oversight — the peer engine was specified as a cross-sell engine for lending.

### 5.3 Seven structural flaws in the model
1. **The unit of comparison is ownership, not outcome.** Holding a product is not a state anyone aspires to; it is how a bank sees its inventory of clients. Clients compare themselves on outcomes — what they pay, what they set aside, what they earn. Most of the other flaws follow from this one.
2. **The matching variables predict the sale, not the need.** Age + income are commercial segmentation variables. Two 38-year-olds on 2,800 EUR — one supporting three children, one single with savings — land in the same group with the same recommendation. Need is predicted by cash-flow volatility, balance troughs and expense shocks, which the bank holds and the spec ignores.
3. **Demand is confused with suitability.** "63% hold it" measures what the bank sold, including everyone mis-sold, in distress, or regretting it. The bank's own sales history is presented back to the client as advice — and it self-reinforces: what sold most gets recommended most, gets sold most.
4. **Ranking by adoption is the inverse of personalisation.** Sorting descending guarantees the most common product leads for everyone in a band. A base-rate ranking is a bestseller list. A product that is exactly right for one client but rare in their band can never reach the top of their list.
5. **No suitability guard anywhere.** No affordability check at display time, no suppression for clients in stress, no ability to say "this is not for you" — on a surface where four of six products are credit and every card carries a request button.
6. **The minimum of 5 is an anonymity threshold used as a publication threshold.** With n=5 a single client moves the figure by 20 points; the confidence interval spans most of the range. It is printed as a fact.
7. **The bands are calibrated for another market.** Income is banded in EUR (≤1,499 / 1,500–2,499 / 2,500–3,499 / ≥3,500) in a country whose average net salary is roughly 800–900 EUR and whose salaries are paid in RSD, so most of the retail base collapses into one bucket and exchange-rate movement alone moves clients between bands. Age bands are static: crossing 45 changes a client's recommendations overnight.

Taken together, points 2–4 describe a 1990s campaign-targeting model — two-variable segmentation plus a popularity ranking — delivered straight to the client, percentages exposed.

### 5.4 The asymmetry worth naming out loud
The single protective rule in the entire specification (the ≥5 minimum) protects **the anonymity of the peers**. Nothing in it protects **the client receiving the recommendation**. That tells you which risk was assessed.

### 5.5 Where peer comparison is legitimate
The mechanism is real — descriptive norms move behaviour in energy consumption, tax compliance, pension enrolment. It works when the behaviour is one the person already wants but is uncertain about, when it is **protective** (saving, insuring, paying on time), and when the norm answers "am I doing OK?". It fails for **borrowing**: nobody aspires to be normally indebted, and "most people like you have an overdraft" has a second reading — "most people like you run out of money before payday" — that no copy rewrite removes.

The three changes that would make the same engine defensible:
1. **Compare outcomes, not holdings.** *"You paid 14,200 RSD in fees last year; clients like you pay 6,000."*
2. **Match on behaviour, not demography.** Balance troughs, salary-to-expense gaps, idle balances — already in the core.
3. **Suppress credit without a need signal.** Lending surfaces only against an affordability check and an observed cost the client is already paying. The strongest example available from existing data: *"we see 24,000 RSD leaving your account every month to another lender at a rate we can beat"* — event-driven refinancing, verifiable, immediately intelligible.

### 5.6 Regulatory note
Prompting credit on the basis that peers hold it is the kind of nudge consumer-credit supervision scrutinises, and the specification contains no affordability assessment at the point of prompting. This is flagged as a design and compliance concern to route to legal — **not as legal advice**, and it should be stated that way in the meeting.

---

## 6. The question bank

Thirty questions prepared for the meeting with the business owners, published as a shareable page: **https://claude.ai/code/artifact/188786a9-bbb0-49f3-a5a1-0d23e0605077**

**Method, which matters as much as the content.** None of the questions argues. Each asks the team to supply something the specification assumes and does not contain. A requirement defended against criticism hardens; one asked to fill its own gaps changes. Each question carries the acceptance criterion it tests, which removes the "that is not what we meant" exit. The silences are the deliverable: the questions with no answer in the room become the change request, written by them.

### Round 0 — does the premise hold at all?
- **P01.** Pull the last fifty loans we issued in this segment and write down what triggered each one. How many were triggered by the client learning that a similar client held the same product?
- **P02.** A client needs 800,000 RSD for a car on the 12th of the month. Does this feature reach them on the 12th? What in the specification knows the moment has arrived?
- **P03.** A client takes a loan from this screen. Either they would have taken it anyway once the need appeared — so we changed the timing, not the value — or they would not have, and we generated borrowing with no underlying need. Which of the two is the business case, and are we willing to write it into the benefits section?
- **P04.** If 63% adoption is a reason to take a product, is 12% a reason not to? Are we prepared to display "only 12% of clients like you hold this" on a product we want to sell?
- **P05.** Would we deploy this mechanic on something the bank earns nothing from — a cheaper package, a fee waiver? If we would only use it to sell credit, what do we actually believe it does?
- **P06.** When a client genuinely needs money, what do they compare us against — another bank's rate, the merchant's instalment plan, family, selling something? Where in this feature is the comparison that actually happens in their head?
- **P07.** Which signals do we already hold that predict credit need — a declined authorisation, a balance trough before payday, an instalment leaving to another lender every month? Why is not one of them in this specification?
- **P08.** Describe the win in the client's own words, a month later. What would they tell a friend we did for them?

### Round 1 — what the percentage actually measures
- **Q01.** Our percentage counts clients who *hold* a product. Does our data separate the ones it worked for from the ones who defaulted, revolved permanently or complained — and if not, what are we telling the client 63% of people did?
- **Q02.** If a product was mis-sold in 2019 and the client still holds it, does it raise today's recommendation score?
- **Q03.** A client who opened an overdraft and never drew on it counts as a user. On a screen about what similar people *do*, should holding and using be the same number?
- **Q04.** Once we recommend a product to a whole band, adoption rises, which strengthens the recommendation, which raises adoption. What breaks that loop?

### Round 2 — who counts as "like me"
- **Q05.** Two 38-year-olds on 2,800 EUR — one supporting three children, one single with 20,000 saved — get the same recommendation. Which attribute in the spec tells them apart?
- **Q06.** We hold salary dates, balance troughs, commitments and two years of transactions. Why do we match on the two attributes that predict what we sell rather than what the client needs?
- **Q07.** Income bands are in EUR; salaries are paid in RSD. When the rate moves, clients cross bands with nothing changed in their lives. Acceptable in a model we call analysis?
- **Q08.** What share of our retail base falls into the bottom income band? If it is most of them, what is that band discriminating between?
- **Q09.** A client turns 45 and their recommendations change overnight. What changed about the client?

### Round 3 — what the ranking optimises for
- **Q10.** Five age bands times four income bands is twenty possible lists in fixed order; subtract what each client holds and that is the entire personalisation surface. Do we still describe it to clients as analysis of them? *(This is arithmetic, not opinion — it cannot be argued with.)*
- **Q11.** Sorting by adoption guarantees the most common product leads for everyone in a band. Is popularity the ranking objective, or relevance?
- **Q12.** Can a product that is exactly right for one client but uncommon in their band ever reach the top of that client's list?

### Round 4 — credit
- **Q13.** Write the reason we are giving a client to borrow, in one sentence, exactly as it will appear on screen. Are we comfortable reading it to the supervisor, and to a client who later cannot repay?
- **Q14.** Where in this flow is the affordability assessment our responsible-lending policy requires before we prompt a client toward credit?
- **Q15.** What is the suppression rule for clients already showing stress — persistent overdraft use, missed payments, high utilisation? The spec has none. Is that deliberate?
- **Q16.** "Most clients like you have an overdraft" and "most clients like you run out of money before payday" are the same fact. Which will the client hear?
- **Q17.** Has legal reviewed peer adoption specifically as a promotional trigger for lending, or only the privacy of the aggregate?

### Round 5 — the person receiving it
- **Q18.** Describe one moment in a client's life where learning that 15 of 24 similar clients hold an overdraft changes their decision. If we cannot, who is the screen for?
- **Q19.** Would a relationship manager say this sentence out loud, across a desk, to a client's face? If not, why is it acceptable in the app, where the client cannot answer back?
- **Q20.** A client takes the product on this recommendation and it goes badly. They ask why we suggested it. Is "63% of clients like you had it" an answer we can stand behind?

### Round 6 — the statistics we print as fact
- **Q21.** At a minimum group of five, one client moves the figure by twenty points. What confidence interval sits behind a number we print as fact, and what is the smallest sample at which we will print one?
- **Q22.** The five-client rule protects the anonymity of the peers. Which rule protects the client receiving the recommendation?

**The three to ask first if time is short:** P03 (the counterfactual — there is no third option), P04 (the symmetry test — they will refuse, which concedes the percentage is decoration), Q19 (no banker would say it out loud).

---

## 7. Open questions and unfinished business

1. **The user's position.** They believe the concept has near-zero chance of success as specified and want to force a reassessment. They are not asking whether to raise it — they are preparing how.
2. **The percentage cannot be removed** without a business mandate; US-6.4 requires it explicitly. Everything done so far demotes it as far as the acceptance criteria allow.
3. **A deliberate interpretation worth defending or revisiting:** descending adoption order is implemented **within two groups** (recommended first, then already-held) rather than across one flat list. The intent of the AC is served; the letter is arguable.
4. **"Actual age range and income range"** is rendered as the band's real numbers ("35–44 years", "2 500–3 499 EUR / month") rather than the observed min/max of matched peers. Either reading is defensible.
5. **The demo scenario undersells it:** the default portfolio holds five of six products, leaving a single recommendation. Zeroing the product counts in the control panel shows the full picture. An option not yet taken: change the shipped persona to hold two products.
6. **Not built, proposed:** the behaviour-triggered version — need signals from transactions, refinancing triggered by an instalment leaving to another lender, affordability-gated credit surfacing.
7. **Pre-existing repo issues, not caused by this work:** `tests/screens/rs-property-insurance.test.tsx` fails 35 tests on clean `main`; `npm run audit:assets` fails on a stale baseline; ESLint is over its own 150-warning budget at 165.

---

## 8. Useful openings for the follow-up conversation

- "Rehearse the meeting with me. You play the business owner defending the requirement; I will ask P03, P04 and Q19."
- "What will they counter with, and which of their counters are actually fair?"
- "Where am I overreaching? Which parts of this critique would a good BA dismantle?"
- "Help me write the one-page change request built only from the questions they could not answer."
- "Design the behaviour-triggered alternative properly: which signals, what thresholds, what the screen says."
- "If the business refuses to change anything, what is the smallest set of changes that makes it defensible to ship?"
