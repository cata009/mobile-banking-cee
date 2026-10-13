# Arhitectură globală pentru demo-uri web și mobile

Status: propunere pentru review. Data: 12 octombrie 2026.

Owner: /root. Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Base commit: `538360ead4a6da9ae889f142f8d00e333f99412b`.
Scope propriu: acest document și `.codex-temp/global-demo-architecture/**`.
Lista inițială a schimbărilor existente și ownership-ul sunt în `.codex-temp/global-demo-architecture/task-owner.json`, înregistrate înainte de editare. Nicio modificare a implementării, a dependențelor, a indexului Git sau a deploy-urilor nu face parte din acest document.

## Obiectiv și criteriu de succes

Transformăm progresiv aplicațiile bancare demo existente într-o bază compatibilă cu web și Android, pregătită și pentru iOS. Același cod de prezentare React Native se afișează în browser prin React Native Web și pe telefon prin controale native. Logica funcțională existentă rămâne sursa de adevăr.

Arhitectura acoperă toate experiențele implementate, toate țările, produsele, scenariile și release-urile valide. Italia este primul pilot, nu o limită a platformei. Portarea nu introduce funcționalitate bancară reală și nu transformă produse planificate în produse implementate.

O experiență este migrată numai după verificarea tuturor ecranelor, stărilor, acțiunilor și tranzițiilor sale, pe web și Android. Arhitectura compatibilă global nu înseamnă că toate ecranele sunt deja portate.

## Baza existentă pe care o păstrăm

Registrul curent conține 9 identificatori de piață: RO, RS, HU, BA, BA_BL, SK, SI, CZ și IT. Produsele sunt PI, KIDS_PI și SME; SME este în prezent planificat. KIDS are concepte implementate pentru SK, HU și RO, iar alte combinații rămân planificate.

Există 16 manifesturi de experiență în `src/experiences/registry.ts`, plus comportamente legacy pentru contexte încă necatalogate. Inventarul trebuie să acopere și aceste contexte înainte de a declara migrarea globală completă. Nu construim produsul cartezian al tuturor selectorilor: registrul și politicile existente decid combinațiile valide.

Păstrăm independente axele din `DemoState`: produs, țară, designSystem, baseline, release, scenariu demo, bankingScenario, limbă, temă, productCounts și feature overrides existente. Păstrăm ScreenId, Flow ID, source authority, ordinea scenariilor, definițiile și exporturile ZIP.

Exemple obligatorii de compatibilitate:

| Context | Identitate păstrată |
| --- | --- |
| PI Italy Mobile First | PI / IT / mobile-first / release-current |
| PI Romania baseline | PI / RO / current / baseline și release existente |
| PI Czech Evo 2027 | PI / CZ / current / release-future-evo-2027 |
| PI Serbia Future Gain | Compunerea și release-ul sârbesc existente |
| KIDS SK, HU, RO | Identități, scenarii și compuneri separate de PI |
| SME și combinațiile planificate | Status planned/prepared păstrat |

Evo 2027 nu devine design system `next`. BA_BL nu se comasează cu BA. Logica financiară specifică Italiei nu se aplică implicit celorlalte piețe.

## Straturi și responsabilități

| Strat | Responsabilitate și limită |
| --- | --- |
| `src/features/` | Politici, validări, calcule, acțiuni și modele de stare canonice. Fără dependențe de DOM sau controale native în nucleul portabil. |
| `src/experiences/` | Alegerea compunerii, layout-ului și parametrilor pentru produs/piață/design system/release. Fără duplicarea deciziilor de business. |
| `src/flows/` | Definiții/specificații canonice și modele de scenariu. Preview-urile și renderer-ele consumă aceleași referințe. |
| `src/universal/ui/` — nou | Controale React Native, tokens și variante de design. Folosite de browser și telefon. Stilurile specifice unei experiențe rămân explicite. |
| `src/universal/navigation/` — nou | Contracte de rută și adaptoare pentru URL, navigație internă, Back și deep links; preservează ID-urile. |
| `src/universal/platform/` — nou | Interfețe pentru storage, fișiere, sharing, biometrie, clipboard, fonturi și updates; implementări separate web/native. |
| `src/app/` | Portalul web existent: selecție, Flows, Design System, Tools și încorporarea demo-urilor migrate. |
| Entrypoint mobil stabil | Selector de demo și runtime React Native. Refolosește aceleași features/experiences/flows; primește infrastructura OTA. |

Direcția dependențelor: UI și experiences consumă features și contractele de platformă; adaptoarele concrete sunt furnizate de entrypoint. Features nu importă entrypoint-ul, portalul, UI sau adaptoarele concrete. Manifesturile și entrypoint-urile metadata rămân fără importuri UI runtime. Extindem auditul de module pentru a verifica limitele noi, fără slăbirea regulilor existente.

Nu toate piețele au același layout. Reutilizăm mecanica, componentele și comportamentul unde există echivalență; păstrăm compunerile și diferențele de țară. O componentă comună nu devine un fișier cu toate deciziile tuturor piețelor.

## Context, navigație și stare

`resolveEffectiveAppContext` rămâne punctul conceptual de rezolvare pentru experiență, features, scenariu, holdings, entitlements și acțiuni. Extragem dependențele neportabile numai cu teste de caracterizare și reexporturi care păstrează utilizatorii existenți.

Selectorul APK oferă numai combinațiile valide și migrate. Browserul păstrează și demo-urile legacy în perioada tranziției. Un ecran nemigrat nu deschide Chrome, un iframe sau un WebView în APK și nu este marcat drept nativ.

Aceleași query parameters și contexte de deep link produc aceeași selecție pe web și mobile. Back, anularea, revenirea din modal și draft-urile au un contract explicit; nu se rezumă la schimbarea unui string de ecran.

Starea este izolată pe experiență și scenariu conform contractelor existente. Schimbarea țării nu transferă solduri, preferințe sau draft-uri între piețe. Persistența primește versiune de schemă și migrare testată. Storage-ul nativ asincron se hidratează înainte de afișarea stării; nu înlocuim global `localStorage` cu un obiect improvizat. Resetul demo și refresh-ul păstrează semantica existentă.

## Fidelitate vizuală și funcțională

Referința este implementarea web existentă, cu capturi datate și context complet: experiență, rută, scenariu, fixtures, dimensiune logică a viewport-ului, font scaling, limbă și temă. Referințele se actualizează intenționat atunci când userul schimbă designul, separat de corectarea migrării.

Păstrăm fonturile, SVG-urile, imaginile, proporțiile și dimensiunile originale. Nu facem conversii sau ștergeri de assets ca parte implicită a migrării. Tokens sunt diferențiați după design system; aceeași funcție nu impune aspectul italian piețelor CEE.

Comparațiile includ ecrane și stări: selecție, erori, loading, modale, liste, scroll, tastatură, text lung și valori ascunse. Capturile se compară prin suprapunere și diff. Separăm diferențele de rasterizare de layout, fără un prag global care poate ascunde un control lipsă. Barele OS și tastatura sunt verificate separat de conținutul aplicației. Nu dezactivăm accesibilitatea pentru a obține o captură identică.

Teste comune verifică politicile și tranzițiile. Teste separate web/Android verifică integrarea cu platforma, inclusiv relansare, persistare și schimbarea contextului. La transferuri și alte acțiuni demo păstrăm consistența ledger-ului și idempotency. Pentru flow-uri păstrăm definiția, ordinea scenariilor, screen kinds și source/ZIP exports.

## Un APK și actualizări globale

Ținta este un APK de bază pentru toate demo-urile native acceptate, cu selector intern. Țara sau release-ul demo sunt alegeri de context, nu APK-uri obligatoriu separate. Începem cu Android; compatibilitatea iOS se verifică și se livrează separat.

APK-ul de bază include modulele native necesare și un client OTA cu semnături și verificarea compatibilității. Prima opțiune propusă a fost `expo-updates` / EAS Update, condiționată de compatibilitatea versiunilor. Verificarea din 13 octombrie arată că Expo stabil SDK 57 țintește RN 0.86, iar demo-ul folosește RN 0.87.1. Testăm local Hot Updater 1.0.1 pentru a păstra runtime-ul actual; acceptarea acestei variante necesită aceeași probă de update, integritate și rollback pe APK Release. Nu este încă o publicare sau o declarare a compatibilității verificate pe telefon.

| Schimbare | Livrare |
| --- | --- |
| Layout, texte, traduceri, validări și ecrane care folosesc module existente | OTA după verificare |
| O țară sau experiență nouă alcătuită din funcții native deja incluse | OTA după verificarea contextului nou |
| Imagini și fonturi încărcate de mecanismele deja incluse | OTA |
| Date/configurație externe de demo | Update al datelor, cu schemă compatibilă și validare |
| Module native noi, permisiuni, upgrade Expo/RN, icon/name din launcher și alte metadate Android | APK nou |

Nu promitem actualizare fără reinstalare pentru orice modificare viitoare. APK-ul actual nu include OTA și trebuie înlocuit o dată cu build-ul de bază care o include. Android cere confirmarea normală pentru instalarea din afara unui store; actualizarea silențioasă a întregului APK nu face parte din această arhitectură.

Canalele OTA țin de mediu, de exemplu demo-preview și demo-stable; țările/release-urile demo sunt în registrul comun. Separăm codul release-ului publicat de axa de business `release`. Fiecare pachet este semnat și legat de o versiune de runtime compatibilă. Cheile de publicare și semnare nu sunt în APK. Accesul public la demo nu acordă acces la endpoint-urile administrative ale portalului.

Pipeline propus: commit → verificări → candidate web Vercel + candidate OTA → verificare identificatori și smoke tests → promovare release. Înregistrăm același commit pentru web și OTA, plus runtime și schema de date. Nu promovăm un release parțial dacă una dintre livrări eșuează. Publicarea pe două servicii nu este o operație atomică; indexul release-urilor și procedura de promovare/rollback gestionează acest lucru.

Telefonul descarcă pachetul și îl aplică la un punct sigur de restart. Nu reîncărcăm un formular aflat în completare. Offline rămâne ultima versiune utilizabilă; un telefon offline nu poate avea instantaneu ultimul deploy. Rollback-ul și restaurarea după un update incompatibil sunt probe obligatorii înainte de distribuția stabilă.

## Migrare incrementală și evidența acoperirii

Adăugăm o matrice derivată din registrul existent și inventarul runtime legacy. Cheia: experiență + ScreenId/flow step + scenariu/stare + platformă. Stări: legacy-web, shared-candidate, web-verified, android-verified, accepted. Statusul de migrare este separat de readiness-ul funcțional existent: un ecran planned rămâne planned.

Fiecare rând are sursa, owner-ul, dependențele, fixtures, capturile de referință, testele și diferențele acceptate. Un owner de integrare controlează shared files, package/lock, contracts, CI și review-ul combinat. Executorii au ownership disjunct și raportează delta exactă. Lucrăm în checkout-ul actual; nu creăm worktrees fără cererea userului.

Ordinea propusă:

1. Inventar global și capturi; infrastructura de comparație; selecție/context, platform ports și proba OTA pe telefon cu același APK instalat.
2. Pilot PI IT Mobile First: Home și modulul Conti, cu interacțiunile existente, fără simplificările spike-ului. Păstrăm referința web până la acceptare.
3. Probe timpurii PI RO baseline și PI CZ Evo 2027/current: Home și un flux reprezentativ pentru fiecare. Demonstrează că arhitectura păstrează trei compuneri și două design systems înainte de extindere.
4. Migrare pe familii de features și compuneri: conturi/carduri/plăți, profil, PFM/investiții, credite/asigurări; acoperire în toate piețele și release-urile existente. Ordinea exactă rezultă din dependențele inventarului.
5. KIDS, flow previews și toate contextele legacy descoperite. Contextele SME planificate primesc contracte de compatibilitate, fără funcționalitate inventată.
6. Înlocuire progresivă în portal cu renderer-ul comun numai pentru contexte acceptate. Eliminarea legacy este un pas separat după verificarea tuturor referințelor și exporturilor, nu cleanup implicit.

## Ce înseamnă aprobarea arhitecturii

Se aprobă limitele modulelor, păstrarea axelor și politicilor existente, o bază comună web/native, selectorul global, metoda OTA și criteriile de acceptare. Aceasta nu declară ecranele migrate sau pixel perfect și nu publică nimic extern.

Următorul artefact este planul de implementare pentru fundația globală și cele trei probe IT/RO/CZ, cu fișiere owned, dependențe, verificări și rezultate concrete. Modelul principal recomandat: GPT 6.1 Sol High pentru contracte și integrare; sarcinile repetitive se pot evalua pe modele mai economice după existența unui exemplu acceptat. Modelul nu înlocuiește comparațiile vizuale sau testele.

## Referințe tehnice

- Cod verificat: `src/app/state/demoTypes.ts`, `src/app/registry/projectModel.ts`, `src/app/registry/projectPackRegistry.ts`, `src/app/platform/effectiveAppContext.ts`, `src/experiences/contracts.ts`, `src/experiences/registry.ts`, `src/experiences/composition.ts` și manifesturile IT/CZ.
- [React Native Web](https://necolas.github.io/react-native-web/docs/).
- [EAS Update](https://docs.expo.dev/eas-update/introduction/), [runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/), [signed updates](https://docs.expo.dev/eas-update/code-signing/).
