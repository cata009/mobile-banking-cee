# Adaptive Elements Baseline și EVO 2027 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Lucrul este secvențial în checkout-ul existent; delegarea cere autorizare explicită, iar fișierele comune au un singur editor activ.

**Goal:** Alinierea întregului baseline și a EVO 2027 la contracte AE verificate, cu definiții comune pentru demo și handoff și acceptare separată pe profil/platformă.

**Architecture:** Un strat pur de contracte, proveniență și profiluri AE alimentează definițiile de ecran, adapterele React Native și serviciile mock. Exportul de inspecție este disponibil înainte de integrarea externă; adapterul de predare oficială depinde de schema și formatul confirmate de developeri. Politicile rămân în features, iar metadata de experiență nu importă UI.

**Tech Stack:** TypeScript existent; React Native 0.87.1 și hostul React Native Web existent; React 18.3.1/Vite pentru platforma web; Vitest și Jest existente. Nu este propusă acum o schimbare de framework sau o dependență nouă.

**Spec:** [Alinierea baseline și EVO 2027 la Adaptive Elements](../specs/2026-10-19-adaptive-elements-alignment.md).

**Status:** Plan propus pentru revizuire. Nu s-a început implementarea. Căile și semnăturile noi de mai jos sunt proiectarea codului nostru, nu API-uri ASEE deja existente. Taskurile condiționate nu se execută pe baza unor răspunsuri presupuse.

## Global Constraints

- Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`; baza observată `700c23395e1481225e0bc594d2b56ff8f50c6000`, cu modificări existente ale operatorului și altor agenți.
- Lucru în checkout-ul existent; nu se creează worktree, nu se schimbă branch-ul, nu se face reset/stash/clean sau staging global.
- Înaintea fiecărui task executat se actualizează ownership-ul: base commit, pending changes, căi de cod/teste/fixtures/assets/docs. Se recitește fiecare fișier înaintea editării.
- Schimbările la App, navigare, registries, primitive comune, tooling și package/lockfile se coordonează cu integration owner; paths din plan nu atribuie implicit ownership asupra modificărilor deja în curs.
- `designSystem: current` și `release-future-evo-2027` rămân axe distincte; nu se copiază baseline-ul pentru a crea EVO și nu se propagă suport RO către CZ/iOS.
- Flow IDs, screen kinds, ordinea scenariilor, exporturile sursă/ZIP și comportamentul existent se păstrează; mutările se separă de corecții de comportament.
- Tipurile/proprietățile/semantica fără dovezi rămân explicit nesuportate sau de verificat. Niciun fallback nu transformă un rezultat necunoscut în „compatibil”.
- Fixtures sintetice, răspunsuri de referință și observații runtime au proveniențe distincte. Versiunea aplicației `26.4.32.0` nu este folosită drept versiune SDK AE.
- Politicile executabile rămân în features. Experiențele selectează compoziție și parametri. Intrările metadata rămân fără importuri React/React Native/DOM.
- Fiecare task executabil folosește caracterizare/regresii relevante, testele afectate și auditul de module. Integration owner rulează `npm run verify` pe starea comună finală, fără relaxarea pragurilor sau a TypeScript strict.
- Nu se face deployment, publicare remote, ștergere/conversie de imagini sau cleanup fără legătură cu migrarea.

## Review Focus

1. Tip AE, namespace, proprietate sau profil necunoscut: diagnostic explicit și export de predare blocat; acoperit de T2/T3/T7.
2. Null versus absent, ordinea discriminatorului, array-uri și valori implicite: păstrate numai conform cititorului/fixture-ului verificat; acoperit de T2/T3.
3. Date stale după schimbarea țării/release-ului/scenariului și acțiuni asincrone întârziate: izolare de context și reset conform politicii existente; acoperit de T4/T5.
4. Sume/date/enumuri/coerciții și operatori de logică incomplet cunoscuți: fără aproximări silențioase sau evaluare generică de cod; acoperit de T2/T4.
5. Diferențe de platformă, focus/tastatură/accesibilitate și navigare înapoi: stări separate pe Android/iOS și regresii pe rutele migrate; acoperit de T3/T6/T8.

## Rezultate și dependențe

| Val                         | Taskuri | Putem începe local                                          | Dependență externă pentru acceptarea finală                  |
| --------------------------- | ------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Dovezi și acoperire         | T1–T2   | Da                                                          | D01/D02 pentru profiluri și schema completă                  |
| Contracte și demo verificat | T3–T5   | Da, numai subsetul revizuit                                 | D02/D03/D06 pentru a extinde suportul și a stabili paritatea |
| Pilot în runtime-ul băncii  | T6      | Pregătirea locală, da                                       | D01–D04, D07–D09; D05 dacă apare un element nou              |
| Handoff acceptat            | T7      | Pachet de inspecție, da                                     | D04 și acceptarea pe platforme                               |
| Întreg baseline și EVO      | T8–T9   | Inventar și caracterizare, da; migrare în valuri după pilot | Confirmări per context și extensiile realmente necesare      |

Condițiile externe afectează doar activitatea dependentă; inventarul, dovezile, caracterizarea și subsetul de demo verificat continuă.

## T1 Inventarul complet și evidența inițială

**Owner:** integration owner pentru inventar; proprietarii de features validează rândurile lor.

**Files propuse:**

- Create: `src/features/adaptive-elements/coverage.ts`, `tests/features/adaptive-elements/coverage.test.ts`.
- Create: `docs/tasks/ae-baseline-evo-coverage.json`.
- Read: `src/experiences/registry.ts`, `src/experiences/contracts.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/domains/*/screens.ts`, `src/app/components/contracts/baselineCatalog.ts`.
- Read: `native-spike/src/experiences/pi/current/contracts.ts`, `native-spike/src/experiences/pi/cz/evo-2027/contracts.ts` și implementările rutelor/subvederilor.

**Interfaces propuse:** `AeCoverageRow` conține identitatea completă de context, rută, parametri/subvedere, stare/scenariu, feature owner, căi de sursă, candidate AE, blocaje și evidențele pe platformă. `validateAeCoverage(rows: readonly AeCoverageRow[]): readonly AeCoverageIssue[]` raportează duplicate, contexte lipsă și atribuiri fără sursă.

- [ ] Extrage toate experiențele și rutele înregistrate, apoi parcurge renderer-ele pentru subvederi și scenarii care nu au rută distinctă. Pornește de la cele 16 manifeste din snapshot, dar nu le trata drept listă completă de ecrane.
- [ ] Scrie și rulează testele care detectează lipsa uneia dintre cele opt piețe PI baseline, lipsa EVO, coliziuni de ID și eliminarea tacită a unui context Kids/SME de clarificat.
- [ ] Completează matricea cu proprietari și surse; toate asocierile AE inițiale sunt „candidate”, până la T2. Stabilește numitorul pentru progres numai după review-ul inventarului.
- [ ] Rulează `npm test -- tests/features/adaptive-elements/coverage.test.ts` și `npm run audit:modules`.
- [ ] Review secvențial al deltei; integrarea/indexul sunt gestionate de integration owner, fără commit global al pending changes.

**Acceptare:** nicio rută/stare găsită nu este omisă fără o decizie explicită; fiecare rând are owner și statut, inclusiv cele neacoperite de APK.

## T2 Registrul verificat de contracte și profiluri

**Owner:** contract owner alocat de integration owner; fără schimbări UI.

**Files propuse:**

- Create: `src/features/adaptive-elements/evidence.ts`, `profiles.ts`, `catalog.ts`.
- Create: `tests/fixtures/adaptive-elements/observed-ro-26.4.32.0/` pentru fragmente minime de contract și proveniență, fără copierea integrală a APK-ului sau a SDK-ului decompilat în repository.
- Create: `tests/features/adaptive-elements/catalog.test.ts`, `profiles.test.ts`.
- Read: `docs/tasks/ae-alignment-evidence-2026-10-19.json` și rapoartele locale identificate acolo.

**Interfaces propuse:** `AeEvidenceRef` identifică hash, fișier, linie/metodă și nivelul observației. `AeTargetProfile` include produs/țară/platformă, identitatea build-ului și `sdkVersion: string | null`. `getAeContract(typeName: string, profileId: string): AeContractLookup` returnează o variantă discriminată `reviewed | unreviewed | unsupported`, nu un contract implicit.

- [ ] Definește testele pentru proveniență, lipsă profil, versiune SDK necunoscută și imposibilitatea de a declara suport CZ/iOS din profilul RO Android; rulează-le înaintea implementării.
- [ ] Revizuiește manual întâi AEInputText, AEInputAmount, AEButton, AEScreenBase și modelele lor nested/ancestor necesare. Verifică parserul, validările, default-urile, enumurile, null/absent și ramurile cu erori JADX. Modelele dependente nerezolvate blochează schema completă a părintelui.
- [ ] Înregistrează `key` și `constraints` pentru AEInputText și cele patru câmpuri obligatorii observate pentru AEInputAmount, cu dovezile din snapshot. Nu deduce namespace pentru AEScreenManager din numele clasei; snapshotul nu conține un literal calificat confirmat pentru acesta.
- [ ] Pentru AEInputText, revizuiește delegarea câmpului `required` către cititorul nested observat la linia 8194 și `enablingLogic` la linia 8205 din cititorul extras. Nu transforma aceste proprietăți automat în booleenii componentelor noastre și nu deduce enumul `inputType` din denumire.
- [ ] Extrage separat contractele operațiilor RPC și semantica operatorilor de logică; existența unei clase sau a unei ramuri `.equals` nu completează semantica.
- [ ] Rulează `npm test -- tests/features/adaptive-elements/catalog.test.ts tests/features/adaptive-elements/profiles.test.ts` și auditul de module. Livrează registrul și lista D01/D02/D06 rămasă.
- [ ] Review al deltei de către integration owner înainte de integrare.

**Acceptare:** fiecare proprietate folosită ulterior are dovadă verificată sau blocaj explicit; catalogul de 205 modele nu este importat automat ca 205 contracte complete.

## T3 Definiții serializabile și validare de payload

**Owner:** contract owner; integration owner coordonează frontiera cu hostul existent.

**Files propuse:**

- Create: `src/features/adaptive-elements/definition.ts`, `validation.ts`, `serialization.ts`, `index.ts` fără UI runtime.
- Create: `tests/features/adaptive-elements/validation.test.ts`, `serialization.test.ts`, `metadata-boundary.test.ts`.
- Create: fixtures sintetice etichetate în `tests/fixtures/adaptive-elements/synthetic/`.

**Interfaces propuse:** `AeDefinition` este o uniune a tipurilor complet revizuite la T2; nu un obiect cu proprietăți arbitrare acceptate. `validateAeDefinition(definition: unknown, profile: AeTargetProfile): AeValidationResult` produce `valid | invalid | unresolved`. `serializeAeDefinition(definition: AeDefinition, profile: AeTargetProfile): AeSerializationResult` produce JSON doar pentru subsetul rezolvat; rezultatul include proveniență și diagnostice.

- [ ] Scrie teste pentru tip/namespace necunoscut, cheie lipsă, câmp obligatoriu lipsă, profil greșit și model nested nerezolvat. Verifică eșecul inițial, apoi implementează rezultatele discriminate.
- [ ] Adaugă teste pentru ordinea `data#type` în cititorul observat care verifică primul câmp; separă această regulă de orice generalizare la toate modelele.
- [ ] Adaugă cazuri null/absent, array gol, șir gol, valori numerice și proprietăți necunoscute. Nu aplica o conversie de bani/date sau un default până nu există dovada în T2; exactitatea reprezentării se verifică pe fixtures.
- [ ] Păstrează callbacks, funcții React, secrete și datele hostului în afara definiției serializate. Distinge identificatorii demo de `tag`/`key` ceruți de un profil extern, cu mapare explicită.
- [ ] Rulează `npm test -- tests/features/adaptive-elements/validation.test.ts tests/features/adaptive-elements/serialization.test.ts tests/features/adaptive-elements/metadata-boundary.test.ts`, `npm run typecheck` și `npm run audit:modules`.
- [ ] Review al deltei și al exemplelor produse, fără a le eticheta fixtures reale de la server.

**Acceptare:** payload-urile locale sunt verificabile pentru subsetul rezolvat. Acest task nu declară acceptarea de către banca/SDK.

## T4 Binding, logică și acțiuni pentru demo

**Owner:** feature owner pentru politici; contract owner pentru interpretarea mecanismului AE.

**Files propuse:**

- Create: `src/features/adaptive-elements/state.ts`, `logic.ts`, `actions.ts`.
- Create: `tests/features/adaptive-elements/state.test.ts`, `logic.test.ts`, `actions.test.ts`.
- Coordinate: adaptere către features existente; căile exacte se aleg din inventarul T1 și se atribuie înaintea editării.

**Interfaces propuse:** `AeDemoState` păstrează valori per context și keys revizuite. `evaluateAeLogic(node: unknown, context: AeEvaluationContext, profile: AeTargetProfile): AeLogicResult` produce `resolved | unsupported | unresolved`; `planAeAction(action: unknown, context: AeActionContext, profile: AeTargetProfile): AeActionPlanResult` produce efecte de demo declarative sau diagnostice. Nu folosi `eval` și nu aplica „JavaScript truthiness” ca înlocuitor al semanticii necunoscute.

- [ ] Caracterizează tranzițiile și politicile existente ale fluxului selectat pentru pilot, inclusiv resetarea contextului și back/close.
- [ ] Scrie cazuri de test pentru binding, key absent, operator neconfirmat și evaluare nested. Implementarea începe doar pentru operatorii a căror semantică a fost închisă în T2 sau prin D06.
- [ ] Adaugă teste pentru răspuns asincron întârziat după schimbarea țării/scenariului, validare eșuată și prevenirea executării duble a unei acțiuni; aplică politica de sesiune deja caracterizată.
- [ ] Conectează efectele declarative la feature policies existente. Nu muta eligibilitatea bancară în manifestele de experiență și nu duplica o decizie între parser și feature.
- [ ] Rulează `npm test -- tests/features/adaptive-elements/state.test.ts tests/features/adaptive-elements/logic.test.ts tests/features/adaptive-elements/actions.test.ts` plus testele features afectate și auditul de module.
- [ ] Review al deltei cu ownerii politicilor; orice regulă rămasă necunoscută apare în raportul de blocaje.

**Acceptare:** același input și același context produc aceleași efecte verificate; funcțiile bancare server-side necunoscute sunt reprezentate prin scenarii de demo explicite.

## T5 Renderer comun pentru preview și aplicația demo

**Owner:** integration owner pentru host/frontiere și primitive; editor unic per fișier comun.

**Files propuse:**

- Create: `native-spike/src/adaptive-elements/AeRenderer.tsx`, `renderers.ts`, `adapters/textInput.ts`, `adapters/amountInput.ts`, `adapters/button.ts`, `adapters/screen.ts`.
- Create: `native-spike/__tests__/adaptive-elements-renderer.test.tsx`, `adaptive-elements-bindings.test.tsx`.
- Coordinate possible changes: `src/features/demo-native/contracts.ts`, `native-spike/src/app/GlobalNativeApp.tsx`, `native-spike/src/app/loadNativeExperiences.ts`, `.web.ts` și `native-spike/src/universal/BaselineTextField.tsx`, `BaselineAmountField.tsx`, `PrimaryButton.tsx`.
- Read/reuse: `src/app/components/contracts/textField.ts`, `amountField.ts`, `primaryButton.ts`; nu presupune echivalența lor cu schema AE.

**Interfaces propuse:** `AeRendererProps` consumă o definiție validată T3, profil, stare și un dispatcher către T4. Resolverul de adapter produce fie un renderer suportat, fie un diagnostic identificabil. Hostul web folosește frontiera de date/mount existentă; nu introduce o a doua copie a politicilor sau importuri între versiunile React din host și modul.

- [ ] Scrie caracterizări pentru elementele selectate: label/value, focus, disabled, eroare, tastatură, aria/accessibility și back. Rulează testele existente relevante înainte de migrare.
- [ ] Implementează o mapare revizuită pe element: AEInputText → adapter pentru BaselineTextField, AEInputAmount → adapter pentru BaselineAmountField, AEButton → adapter pentru PrimaryButton. O proprietate fără echivalent devine blocaj/diagnostic; nu se ignoră pentru a obține o captură similară.
- [ ] Adaugă teste pentru aceleași definiții folosite în preview și în rendererul RN, pentru efecte T4 și pentru element necunoscut. Păstrează identitățile și fallback-ul legacy explicit în tranziție.
- [ ] Rulează `npm --prefix native-spike test -- --runInBand __tests__/adaptive-elements-renderer.test.tsx __tests__/adaptive-elements-bindings.test.tsx`, `npm --prefix native-spike run typecheck`, testele afectate și auditul de module.
- [ ] Verifică vizual și interactiv pilotul pe web și Android demo. Statutul iOS rămâne neexecutat până la o rulare pe iOS; browserul nu îl validează.
- [ ] Review secvențial al deltei înaintea integrării în host.

**Acceptare:** un subset AE revizuit conduce demo-ul și păstrează comportamentele caracterizate. Rendererul nostru rămâne identificat ca demo.

## T6 Pilot și fixtures de referință

**Owner:** integration owner + feature owner al fluxului ales; developer Android și developer iOS pentru acceptare externă.

**Alegere propusă:** un formular cu text, sumă, validare, acțiune și tranziție, ales din rutele reale după T1. Nu se inventează acum o rută nouă și nu se pretinde că un transfer existent corespunde automat acestui subset.

**Files propuse:**

- Create: `tests/fixtures/adaptive-elements/pilot/`, cu proveniență pe fiecare fixture.
- Create: `tests/features/adaptive-elements/pilot.test.ts` și testele native aferente.
- Modify: definiția și adapterul fluxului selectat, în căile reale stabilite de T1 și atribuite ownerului; orice shared file rămâne coordonat.

**Interfaces:** consumă T2–T5. Produce un `AePilotAcceptanceRecord` cu profil, versiuni runtime, hash pachet/fixtures, scenarii, rezultate Android/iOS, reviewer și blocaje. Niciun câmp de acceptare nu se completează automat din testele locale.

- [ ] Local: construiește fixtures sintetice cu etichetă explicită și scenarii pentru succes, eroare, lipsă date, back și răspuns întârziat. Caracterizează traseul existent înainte de înlocuire.
- [ ] După D03: adaugă separat fixtures de referință furnizate, apoi compară payload-ul exact și efectele așteptate. O diferență de ordine poate fi semnificativă pentru cititorii identificați.
- [ ] Rulează testele pure și native ale pilotului și verificările de regresie ale feature-ului; atașează rezultatele la record.
- [ ] După D01/D02/D04/D07: developerii încarcă pachetul în runtime-urile țintă Android și iOS și execută aceleași scenarii. Înregistrează diferențele, fără a modifica testele pentru a ascunde o incompatibilitate.
- [ ] Decide prin review ce profiluri au fost acceptate și ce trebuie corectat. Acceptarea RO nu validează automat CZ sau alte țări.

**Acceptare:** mecanismul de migrare are o probă completă pe profilurile testate. Dacă testarea externă lipsește, livrabilul rămâne demo/pachet de inspecție, iar T1/T2 și caracterizarea celorlalte domenii pot continua.

## T7 Exportul și pachetul pentru developeri

**Owner:** integration owner + responsabilul de import/publicare al echipei destinatare.

**Files propuse:**

- Create: `src/features/adaptive-elements/inspectionPackage.ts`, `handoffAcceptance.ts`.
- Create după D04: `src/features/adaptive-elements/exportAdapter.ts` pentru formatul confirmat.
- Create: `tests/features/adaptive-elements/inspection-package.test.ts`, `handoff-acceptance.test.ts`; după D04 și `export-adapter.test.ts`.
- Coordinate: integrare aditivă în `src/app/screens/flow-library/handoff/referencePackage.ts` și suprafața de documentație relevantă; exporturile existente se păstrează.

**Interfaces propuse:** `buildAeInspectionPackage(input: AeInspectionInput): AeInspectionPackage` produce definiții, fixtures, dovezi, assets manifest și lista de blocaje în formatul nostru explicit de inspecție. `assessAeHandoff(input: AeHandoffEvidence): AeHandoffDecision` produce `accepted | blocked` per profil/platformă. Semnătura adapterului final se fixează numai după D04; nu se prezintă ZIP-ul nostru drept format ASEE.

- [ ] Scrie teste care blochează eticheta „integrabil” dacă lipsesc profilul confirmat, schema, formatul de import sau acceptările cerute. Un fixture sintetic nu completează dovada de acceptare externă.
- [ ] Implementează pachetul de inspecție cu manifest de proveniență și hash-uri. Definițiile demo-ului și cele exportate sunt aceleași; nu se menține manual o copie pentru handoff.
- [ ] După D04: adaugă adapterul exact de export și verificarea prin instrumentul/comanda furnizate de developeri. Documentează versiunea validatorului și rezultatul concret, fără o comandă inventată în acest plan.
- [ ] Rulează testele de export și regresiile exporturilor existente. Fără arhive care conțin neintenționat APK-ul integral, date runtime sau dependențe de căi locale Downloads.
- [ ] Review cu destinatarul: pachet importabil, extensii native dacă există, assets/traduceri și responsabilități de integrare.

**Acceptare:** pachet de inspecție utilizabil imediat; pachet integrabil numai după confirmarea și verificarea formatului de predare.

## T8 Migrarea întregului baseline în valuri

**Owner:** integration owner pentru coordonare; feature/market owners pentru delte disjuncte. Nu se editează același fișier în paralel.

**Files:** lista exactă pe val se generează din matricea T1 înainte de implementare. Punctele de integrare existente sunt `native-spike/src/experiences/pi/current/`, `src/features/<feature>/`, `src/flows/<scope>/<flow>/`, `src/experiences/pi/<country>/baseline/` și primitivele comune alocate. Aceste directoare nu sunt un permis de editare globală.

**Interfețe:** fiecare definiție de ecran migrată consumă T2–T5 și exportă prin T7; matricea T1 este actualizată cu dovezi pe fiecare rută/stare/context.

| Val | Domenii de inventariat și migrat                                                                      | Condiții speciale                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| B1  | Primitive, form controls, liste, grupuri, headere și navigare                                         | Închide contractele comune înaintea duplicării adapterelor în features                                        |
| B2  | Home, conturi, carduri și detalii/tranzacții                                                          | Păstrează datele, product mix, scenariile și parametrii de navigare                                           |
| B3  | Plăți, formulare, review și confirmări                                                                | Separă comportamentul UI verificat de validările/semnarea server-side simulate                                |
| B4  | Produse, investiții, PFM, profil, setări, documente, mesaje, suport și celelalte rute inventariate    | Orice domeniu omis din această enumerare rămâne tot în numitorul T1                                           |
| B5  | Prelogin, login, activare și integrări de dispozitiv descoperite în inventar                          | D09 și teste reale pentru capabilitățile platformei; nu se declară biometrie/scanare verificate dintr-un mock |
| B6  | Variații pe cele opt piețe CEE, release-uri și scenarii; baseline Kids unde profilul a fost confirmat | D01/D02 pentru fiecare profil; nicio certificare globală bazată pe RO                                         |

Pentru fiecare val:

- [ ] Fixează lista de rute, subvederi, stări și fișiere, plus editorul fiecărui fișier. Caracterizează comportamentul existent și rulează testele relevante înaintea editării.
- [ ] Migrează o compoziție o dată, refolosind features și contracte comune; păstrează IDs, scenarii și exporturi. Un element nesuportat produce rând de blocaj, nu o substituție silențioasă.
- [ ] Rulează testele afectate web/native, `npm run audit:modules`, comparațiile vizuale și scenariile de navigare. Integration owner rulează `npm run verify` pe starea comună după terminarea editorilor valului.
- [ ] Revizuiește deltele secvențial și actualizează matricea cu rezultate locale și acceptări externe distincte. Păstrează o cale controlată către rendererul existent cât timp valul este parțial.

**Acceptare:** întregul baseline este considerat aliniat doar când toate rândurile din scope au atins nivelul convenit; o rută legacy sau blocată rămâne vizibilă și împiedică declararea acoperirii integrale.

## T9 EVO 2027 și elementele noi

**Owner:** PI Czech future pentru compoziția CZ; integration owner pentru contractele și primitivele comune; developeri ASEE Android/iOS pentru extensii native confirmate.

**Files existente de coordonat:** `src/experiences/pi/cz/evo-2027/`, `native-spike/src/experiences/pi/cz/evo-2027/`, features și flow definitions referite de experiență. Testele exacte și căile de extensii noi se stabilesc din T1/D05; nu se inventează acum un SDK de pluginuri.

**Interfețe:** aceeași definiție și aceleași profile ca baseline. Fiecare cerință EVO primește o decizie documentată: compoziție de tipuri existente, proprietate/extensie confirmată sau element nativ nou necesar.

- [ ] Descompune fiecare ecran/stare EVO în contracte candidate și compară proprietățile cu registrul T2; păstrează contextul `PI/CZ/current/release-future-evo-2027`.
- [ ] Scrie caracterizarea și testele pentru combinațiile rezolvate, apoi implementează compoziția fără copierea ecranelor baseline și fără duplicarea politicilor.
- [ ] Pentru diferențele fără suport, pregătește cerința de extensie: input/output, stare, interacțiuni, accesibilitate, assets, erori și criterii de acceptare. Așteaptă D05 înaintea generării unui „pachet de element nou” specific SDK-ului.
- [ ] Înregistrează implementările și versiunile minime Android/iOS aprobate de developeri, apoi treci prin T6/T7 pentru acele extensii.
- [ ] Rulează regresiile EVO și baseline, auditul de module și verificarea comună finală. Integrarea ownerilor se face secvențial.

**Acceptare:** toate cerințele EVO au o implementare verificată sau un blocaj explicit; eticheta „integrabil” este acordată numai după acceptarea profilului CZ și a platformelor țintă.

## Pachetul de întrebări pentru developeri

Se trimite de către utilizator sau un responsabil autorizat, împreună cu snapshotul și un exemplu restrâns de model. Acest task nu trimite mesaje altor persoane.

1. D01/D02: ce versiuni AE și ce schemă folosesc Android/iOS pentru RO, CZ și celelalte contexte baseline? Ce produse intră în scope?
2. D03: pot furniza exemple anonimizate și aprobate pentru ecran, input invalid, acțiune și tranziție, cu proveniența versiunii?
3. D04: ce fișiere/instrumente acceptă efectiv pentru import/publicare și cum validăm un pachet înaintea integrării?
4. D05/D08: care este contractul unei extensii noi și cum se livrează pe ambele platforme, cu assets, traduceri și accesibilitate?
5. D06/D09: ce semantică și politici sunt în client, ce rămâne pe server și ce API-uri native trebuie folosite?
6. D07: cine execută și acceptă pilotul în runtime-urile reale, cu ce versiuni și ce dovadă de rezultat?

## Ordinea de pornire și ieșirea din planificare

Prima implementare propusă este T1 → T2, urmată de T3–T5 pentru subsetul care trece review-ul contractelor. În paralel cu acest lucru se pot colecta răspunsurile D01–D09; lipsa lor nu justifică inventarea contractelor. T6 extern și adapterul final T7 sunt condiționate. T8/T9 aplică mecanismul validat la întreaga acoperire, cu dovezi per context.

Planul se revizuiește înaintea implementării. După inventar și răspunsurile inițiale se fixează dimensiunea valurilor și efortul; acest document nu promite o durată sau un procent fără date. Execuția propusă este secvențială, în checkout-ul existent, coordonată de integration owner.
