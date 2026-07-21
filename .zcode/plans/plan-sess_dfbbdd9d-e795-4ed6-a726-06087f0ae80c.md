> **Status 2026-07-21:** Superseded after visual review. The final implementation uses a compact Radix root menu plus adjacent country submenu, matching the More menu's visual atoms. This file is retained only as historical planning evidence.

## Obiectiv
Înlocuiește dropdown-ul combinat APP + COUNTRY din `DemoTopBar.tsx` (care afișează 3 app-uri + divider + 8 țări într-o listă lungă de ~15 rânduri) cu un **push drill-down în 2 niveluri**:
- Nivel 1: lista de 3 rânduri (PI / SME / Kids), fiecare cu chevron dreapta.
- Click pe un app → nivelul 2 acoperă nivelul 1 cu header „PI App" + sageată înapoi + lista celor 8 țări.
- Click pe o țară → se aplică selecția și se închide tot dropdown-ul.

## Alegere de design
**Nu folosesc Radix `DropdownMenuSub`** — acela face fly-out lateral la hover, nu push-drill-down. În schimb extind panoul hand-rolled existent (păstrez click-outside, positioning, `z-[10000]`, styling-ul rândurilor). Asta înseamnă:
- Doar `DemoTopBar.tsx` se modifică — nicio atingere la alte fișiere, nicio primitivă nouă exportată, nicio dependență nouă.
- Same look-and-feel ca celelalte 3 dropdown-uri (release/scenario/future-release).

## Implementare concretă

### 1. State local nou (în `DemoTopBar.tsx`)
- `const [drillDownProduct, setDrillDownProduct] = useState<ProductId | null>(null)` plasat lângă `isProductDropdownOpen` (linia 110).
- La închiderea dropdown-ului (`closeAllDropdowns`, linia 156) adaug și `setDrillDownProduct(null)` ca să resetăm nivelul la următoarea deschidere.

### 2. Înlocuiesc JSX-ul panoului (liniile 417-456)
Wrapper-ul `<div className="absolute left-0 top-full z-[10000] mt-2 w-[256px] ...">` rămâne; doar conținutul se schimbă în 2 ramuri condiționale:

**Ramura A — Nivel 1 (când `drillDownProduct === null`):**
- Header label „App" (păstrez styling-ul existent `uppercase`/`text-[11px]`/etc.).
- 3 rânduri pentru `PRODUCT_ORDER`. Fiecare rând:
  - aceeași structură de buton ca acum (highlight pentru app selectat, hover bg).
  - adaug la final un `chevron-right` icon (folosesc `AppIcon name="chevron-link"` rotit, sau `chevron-right` dacă există în registry).
  - `onClick={() => setDrillDownProduct(productId)}` — NU mai chem `handleProductSelect` aici, fiindcă selecția de app se aplică doar când userul alege și o țară (altfel rămâne pe vechiul app fără țară nouă și e confuz). **Sau**, alternativ, chem `handleProductSelect(productId, { keepDropdownOpen: true })` ca acum ca să schimb app-ul imediat, apoi trec la nivelul 2 pentru selecția țării. Merg cu prima variantă — schimb app-ul abia la click pe țară, ca fluxul să fie atomic (aparent user-ul poate renunța cu back fără efect lateral).

**Ramura B — Nivel 2 (când `drillDownProduct !== null`):**
- Header custom: `<button>` cu sageată înapoi stânga (`back-heavy` icon, 40×40) + titlu `PRODUCT_SELECTOR_LABELS[drillDownProduct]` + opțional un `close-x` în dreapta.
- Lista celor 8 țări — aceeași structură de rând ca acum (highlight pentru țara selectată, hover bg).
- `onClick` pe țară: aplică ambele selecții atomic:
  ```
  handleProductSelect(drillDownProduct, { keepDropdownOpen: false });
  handleCountrySelect(countryCode);
  closeAllDropdowns();
  ```
  Notă: `handleProductSelect` schimbă `product` + resetează `bankingScenario`; `handleCountrySelect` schimbă `country`. Ordinea contează — product întâi ca să se aplice bankingScenario default înainte de country.

### 3. Click-outside și Escape
- Click-outside existent (liniile 239-260) nu se atinge — închide tot dropdown-ul (și `drillDownProduct` se resetează prin `closeAllDropdowns`).
- Escape: adaug `onKeyDown` pe wrapper pentru `Escape` → la nivel 1 închide tot, la nivel 2 merge înapoi la nivel 1. (Sau, simplificat: Escape închide tot — adaug la `closeAllDropdowns`).

### 4. Tranziție vizuală
- Fără animație complexă (consistente cu restul dropdown-urilor care sunt hard-cut). Dacă e ușor, adaug `transition` minim pe opacitate. Nu obligatoriu.

## Decizii care rămân stabile
- **Eticheta trigger button rămâne** „PI - Czech Republic" (`selectedAppCountryLabel`, linia 126-127) — nu se schimbă.
- **Toate cele 8 țări rămân disponibile pentru toate cele 3 app-uri** — modelul de date nu filtrează per app, și nu introduc filtrare acum (ar fi expandare de scope separată).
- **Lățimea panoului rămâne `w-[256px]`** — aliniat cu celelalte dropdown-uri.
- **Mai departe `keepDropdownOpen` e `true` la nivel 1** dacă aplic app-ul imediat (varianta 2) — pentru nivel 2 `keepDropdownOpen` false ca să se închidă la selecția țării.

## Fișiere modificate
- **Doar `src/app/components/demo/DemoTopBar.tsx`** — state local nou + rescrierea JSX a panoului de product dropdown (liniile 417-456).

## Ce NU se modifică
- `demoStore.tsx` (state-ul e același).
- `projectModel.ts`, `demoConfig.ts` (registrele nu se ating).
- Celelalte 3 dropdown-uri din topbar.
- `HeaderMoreMenu` (Radix sub-menu-ul pentru Screenshots rămâne neschimbat).

## Verificare
- `npm run build`.
- `npm run audit:platform` (validează că nu am stricat contractele de topbar context).
- Browser smoke manual recomandat: deschid dropdown, văd 3 app-uri cu chevron, click PI → văd cele 8 țări cu sageată înapoi, click RO → se aplică și se închide. Verific și că label-ul trigger se actualizează corect.

## BananaLoop / Docs
- `docs/handoff/current-session.md` — intrare nouă cu motivarea (UX lung/urât → drill-down atomic) + fișiere atinse + dovezi build/audit.
- `docs/handoff/next-tasks.md` — banana: fără regresie automată pentru noul drill-down (click-outside, Escape, reset la închidere, ordinea product→country la selecția atomică).

## Safe to resume: yes (după implementare + verificare).
