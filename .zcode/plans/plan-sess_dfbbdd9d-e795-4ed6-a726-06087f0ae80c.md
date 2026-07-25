## Obiectiv
Ștergere completă a experimentului Serbia Kids (RS Teens) — toate urmele de cod, date, registre, teste, CSS, și docs care țin de Kids Serbia. Serbia ca țară generală (PI retail banking) rămâne neschimbată.

## Ce se șterge (Kids RS doar)

### 1. Directorul `src/app/screens/kids/rs/` complet (25 fișiere, ~5,250 linii)
Toate: `RsTeensApp.tsx`, `cards.ts`, `chrome.tsx`, `data.ts`, `money.ts`, `payees.ts`, `types.ts`, `learn/*`, `screens/*`, `ui/*`.

### 2. CSS: `src/styles/rs-kids.css` + importul din `src/styles/index.css:4`

### 3. Date: `src/data/kidsMarketHomeConcepts.ts`
- Scoate `"RS"` din `KidsHomeCountry` type union.
- Scoate `"rs-teen-fintech"` din `KidsHomeStyle` union.
- Scoate `"RS"` din `KIDS_HOME_COUNTRIES` array.
- Șterge intrarea RS concept (~liniile 248-297).

### 4. Registre (6 fișiere)
- **`projectPackRegistry.ts:21`**: scoate `"RS"` din `KIDS_MARKET_CONCEPT_COUNTRIES`.
- **`projectPackRegistry.ts:26`**: șterge `RS: "kids.rs.home-concept"` din `KIDS_MARKET_SCREEN_BY_COUNTRY`.
- **`screenRegistry.ts:447-460`**: șterge intrarea `"kids.rs.home-concept"`.
- **`flowRegistry.ts:274`**: scoate `"RS"` din `countries` pe flow-ul `kids.market-home-bottom-nav`.
- **`flowRegistry.ts:281`**: șterge intrarea `{ screenId: "kids.rs.home-concept", ... }`.
- **`demoTypes.ts:155`**: scoate `"kids.rs.home-concept"` din `ScreenId` union.
- **`routePolicy.ts:72`**: scoate `RS` din lista țărilor Kids elegibile (păstrez SK/HU/RO).
- **`routePolicy.ts:82`**: scoate `RS` din `resolveRouteStatusBarVariant` pentru KIDS_PI.

### 5. Dispatcher: `KidsMarketHomeApp.tsx`
- **Linia 33**: șterge `import RsTeensApp from "./rs/RsTeensApp";`.
- **Liniile 77-78**: șterge `if (concept.style === "rs-teen-fintech") { return <RsTeensApp />; }`.

### 6. Teste (3 fișiere)
- **`tests/screens/rs-kids-decide-payment.test.ts`**: șterge fișierul complet.
- **`tests/screens/kids-market-home.test.tsx`**: șterge block-ul RS Teens tests (liniile 130, 159-174) + scoate `'RS'` din tipul `renderKids`.
- **`tests/navigation/route-policy.test.ts:96`**: șterge aserțiunea pentru RS Kids.

### 7. Docs/spec
- **`docs/superpowers/specs/2026-07-24-kids-serbia-teens-design.md`**: șterge fișierul.
- **Docs handoff** (`current-session.md`, `next-tasks.md`, `state-of-the-world.md`, `known-bananas.md`, `PROJECT_MODEL.md`, `platform-capability-map/README.md`): marchează RS Kids ca retras/șters cu note în loc de a edita masiv istoricul.

## Ce NU se atinge (Serbia generală PI)
- `demoConfig.ts`: `"RS"` rămâne în `COUNTRIES` (Serbia apare ca țară pentru PI/SME).
- `projectModel.ts`: `PROJECT_COUNTRIES` rămâne cu RS.
- `countryConfig.ts`: configurare țară RS rămâne.
- `accountDetails.ts`, `paymentFlow.ts`: date RS generale (IBAN, tranzacții) rămân.
- `template-rs-travel-insurance`: template PI rămâne.
- `translations/RS/`: traduceri PI rămân.

## Verificare
- `npm run build` (trebuie să treacă fără erori de import/modul lipsă).
- `npm run audit:platform` (trebuie să raporteze `projectPackCombinations` redus de la 24 la 21 — RS Kids pack dispare, dar RS PI rămâne).
- `npm test` (dacă rulează local — verifică că testele modificate trec).

## Safe to resume: yes