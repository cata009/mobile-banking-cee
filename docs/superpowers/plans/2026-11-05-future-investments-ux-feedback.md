# Future Investments UX — traducere și plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O pagină principală Investments care pune valoarea și rezultatul portofoliului înaintea controalelor secundare, explică evoluția investițiilor și oferă acces clar la investiție și profil.

**Architecture:** Model comun în features pentru istoricul portofoliului, performanță și eligibilitatea recomandărilor; experiențele Future selectează prezentarea și parametrii. Se integrează în ruta efectiv randată de controller-ul comun, cu prezentare Future explicită și păstrarea consumatorilor baseline.

**Tech Stack:** TypeScript, React Native, React Native Web, componentele și tokenurile existente ale Design System-ului current.

**Spec:** Feedbackul și imaginile furnizate de utilizator, traduse mai jos. Detaliile marcate „propunere” nu reprezintă decizii aprobate ale băncii.

## Evidența taskului

- Owner: Codex /root.
- Bază: ce8c4bc97571bfadffa752887cc2727e8f32609e.
- Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE.
- Delta acestei etape: numai acest document nou. Nu se modifică implementarea, testele, fixture-urile sau asset-urile.
- La început există modificări locale în componente și teste de Investments, Robo, autorizare și documente de planificare. Se păstrează toate; inventarul a fost citit cu git status --short înaintea scrierii acestui document.

## Global Constraints

- Scope-ul convenit în chat: PI Czech Republic / Future App — CZ Robo, Evo 2027, CZ Chatbot. Propunere: aceeași funcționalitate de bază Investments în cele trei variante, validată inițial în Evo 2027.
- Cerințele sursă menționează CZ și SK, Smart Banking, iOS și Android. Extinderea implementării la SK este scope separat; nu este implicit autorizată de citarea documentului.
- Design system rămâne current; Evo 2027 rămâne o experiență/release.
- Se reutilizează componentele aprobate, inclusiv navigația Evo. Imaginile atașate explică intenția UX; nu sunt asset-uri executable sau dovadă de aprobare DS.
- Se păstrează screen/flow IDs, scenariile, cumpărarea/vânzarea, exporturile și comportamentele baseline. Politicile executabile rămân în features; metadata nu importă runtime UI.
- Pentru DEMO se folosesc date sintetice coerente și scenarii explicite. Datele simulate nu demonstrează existența unui serviciu bancar de istoric sau recomandări.
- Bugetul și prioritizarea pentru producție nu sunt aprobate de acest plan.

## 1. Traducerea contextului de business

Michal solicită un audit UX al întregului parcurs de investiții. Schimbările izolate pot îmbunătăți un ecran și afecta altul. Problemele principale sunt ierarhia informațiilor, vizibilitatea performanței, traseul insuficient de clar către cumpărare și spațiul prea mare ocupat de controale. Acțiunea Invest trebuie să fie evidentă și consecventă. Owner-ul local al subiectului este Jan Havel.

Efren precizează că bugetul 2027 este foarte limitat, cerințele critice sunt deja prioritizate și probabilitatea de a adăuga scope este redusă. Cerințele trebuie clarificate, apoi discutate între țări și eventual finanțate prin înlocuirea altui scope. Nu rezultă o aprobare de implementare în producție.

Sunt menționate SBL-478092, SBL-478684 și SBL-478678. Fragmentul furnizat nu stabilește explicit corespondența fiecărui ID cu fiecare grup de cerințe.

## 2. Traducerea integrală a schimbărilor funcționale

### A. Pagina principală Investments

Poveste utilizator: „Ca client, vreau o imagine clară a valorii portofoliului meu și a randamentului său, printr-o afișare simplă și bine organizată.”

Situația actuală descrisă: pagina este aglomerată, graficul oferă puține informații utile, recomandările clare lipsesc, iar acțiunea de investiție este discretă. Controalele și filtrele domină vizual informația financiară.

Cerințe traduse, cu repetițiile din sursă reunite:

1. Valoarea totală a portofoliului apare proeminent în partea superioară a paginii.
2. Imediat sub valoare apare performanța portofoliului, atât ca sumă absolută, cât și procentual.
3. Câștigurile și pierderile sunt diferențiate vizual conform regulilor UX.
4. Pagina include un grafic al evoluției valorii portofoliului și al sumei investite.
5. Graficul agregă toate produsele eligibile deținute: instrumente financiare, investiții unice și investiții recurente. Reflectă depunerile, retragerile și rezultatele investițiilor.
6. Selectarea unui punct arată data, valoarea portofoliului și suma investită corespunzătoare.
7. Sub grafic sunt disponibile perioadele 1M, 3M, 1Y, 3Y și MAX. Perioada activă este evidențiată, iar schimbarea ei actualizează graficul și performanța afișată.
8. Secțiunea „Recomandat pentru tine” apare când există conținut de marketing eligibil. Selectarea unui element deschide produsul sau campania corespunzătoare.
9. Bara de navigație de jos este persistentă și rămâne vizibilă la scroll.
10. Invest este acțiunea principală, evidențiată în bara de jos, alături de celelalte destinații relevante.
11. Pagina are acces la Investment Profile; selectarea lui deschide secțiunea de profil investițional.
12. Profilul include actualizarea datelor MiFID, explicarea profilului și a pieței-țintă, raportul consolidat și extrasele.
13. Valoarea și performanța au prioritate față de informația secundară. Raportul și filtrele nu trebuie să domine pagina principală.
14. Soluția urmează designul Smart Banking aprobat pentru CZ/SK și este disponibilă pe iOS și Android.

### B. Graficul portofoliului

Poveste utilizator: „Ca client, vreau să înțeleg evoluția valorii investițiilor și rezultatul lor într-o imagine completă a portofoliului.”

1. Graficul prezintă evoluția istorică a valorii portofoliului și a aportului net investit.
2. Aportul net investit se calculează ca total depuneri minus total retrageri.
3. Cele două serii sunt linii distincte și ușor de identificat; legenda le numește explicit.
4. Sunt agregate toate instrumentele și produsele eligibile, inclusiv investițiile unice și recurente.
5. Perioadele sunt 1M, 3M, 1Y, 3Y și MAX, cu selecție vizibilă și actualizarea datelor la schimbare.
6. Clientul poate selecta puncte; pentru data selectată vede valoarea portofoliului și aportul net investit.
7. Performanța paginii este coerentă cu datele graficului. Valoarea, aportul net și performanța folosesc definiții consistente în toată secțiunea Investments.
8. Valorile sunt în moneda portofoliului și respectă localizarea clientului.
9. Graficul respectă UX/UI aprobat și este cerut pentru clienții CZ și SK.

În sursă, formula completă, descrierea și UX-ul final ale graficului sunt încă de definit. Imaginile arată o linie continuă turcoaz pentru valoare și o linie gri întreruptă, în trepte, pentru aport.

### C. Recomandări de investiții

Poveste utilizator: „Ca client, vreau să văd o recomandare clară de investiție, bazată pe profilul meu investițional.”

1. Pe pagina Investments apare un banner/secțiune de recomandări numai pentru clienții eligibili.
2. Recomandările pot viza unul sau mai multe produse concrete.
3. Se bazează pe chestionarul MiFID valid, profilul investițional actual și piața-țintă a clientului, în cadrul serviciului descris drept „consiliere de investiții limitată”.
4. Produsele incompatibile cu profilul sau piața-țintă nu sunt recomandate.
5. Bannerul afișează clar numele produsului, o descriere scurtă sau un beneficiu și un CTA precum „Află mai multe”, „Investește” sau „Vezi produsul”.
6. Selectarea bannerului deschide detaliul produsului recomandat.
7. Dacă există mai multe recomandări, ordinea lor respectă regulile de prioritizare definite.
8. Dacă nu există o recomandare potrivită, secțiunea nu apare.
9. Recomandările se actualizează când se schimbă MiFID, profilul sau evaluarea pieței-țintă.
10. Conținutul respectă limba clientului și designul Smart Banking aprobat. Cerința acoperă CZ/SK și iOS/Android.

Un banner de campanie generic și o recomandare personalizată sunt două tipuri de conținut cu condiții diferite. O imagine cu un CTA generic, ca în referință, nu îndeplinește singură cerința unei recomandări de produs.

## 3. Ce există efectiv în DEMO

- Ruta Evo folosește ClassicPortfolio.tsx, care montează BaselineInvestmentsController prin hostAdapter.tsx.
- Overview-ul CZ prezentat de controller este în native-spike/src/experiences/pi/current/investments/baseline/overview/CzRoboOverview.tsx. Acesta are încă titlul mare în conținut și apelează ModuleNavigation fără varianta Evo.
- Există și o compoziție alternativă în InvestmentsScreen.tsx. Modificările limitate la aceasta nu acoperă automat ruta efectivă din DEMO; integrarea trebuie demonstrată din ruta completă.
- Modelul InvestmentChartPoint are o singură valoare pe punct. buildInvestmentChartPoints produce curbe sintetice prin multiplicatori aplicați valorii actuale, fără istoric de aporturi/retrageri.
- Lista comună de perioade include 6M și eticheta ALL. Cerința nouă cere cinci perioade și MAX; schimbarea trebuie parametrizată pentru Future.
- Rezumatul actual este calculat din dețineri și nu este legat de intervalul ales în grafic. Nu poate fi reutilizat ca performanță istorică fără un model nou.
- Există elemente MiFID și Target Market în fluxurile Robo/documente. Inspecția limitată nu a identificat un Investment Profile complet care să îndeplinească toate cerințele; se auditează înainte de a crea un flux nou.

## 4. Structura propusă a paginii Future

Ordinea propusă de sus în jos:

1. Antet compact: X, „Portfolio details” centrat, acces profil investițional și ajutor. Se verifică spațiul pe ecrane înguste; profilul nu elimină ajutorul.
2. Valoarea totală: cel mai puternic element tipografic, cu moneda clară și zecimale secundare.
3. Performanța: sumă și procent, semn plus/minus și culoare semantică; etichetă explicită a perioadei.
4. Graficul cu cele două serii, selecție și tooltip.
5. Legendă și perioadele 1M / 3M / 1Y / 3Y / MAX, cu stil unitar.
6. „Recommended for you”, numai când există conținut eligibil.
7. Deținerile active. Propunere: Performance rămâne prezentarea inițială, iar repartizarea după tip de produs, monedă, clasă de active sau cont se deschide printr-un control secundar „Portfolio breakdown”. Această reorganizare necesită validare UX.
8. Sortarea rămâne un control compact, cu opțiunile într-un sheet.
9. Bara persistentă Portfolio / Explore / Invest / Activity / More. Invest are tratament vizual primar inclusiv atunci când Portfolio este tabul activ; starea activă și CTA-ul se diferențiază semantic.

Recomandare pentru profil: acces direct în antet, plus acces redundant prin More. Raportul consolidat și extrasele se găsesc în profil; mutarea lor păstrează destinațiile existente și poate păstra aliasuri utile în More.

## 5. Decizii de date înainte de implementare

- Istoricul are puncte datate cu portfolioValue, netInvestedAmount și currency, provenite din același snapshot/version/asOf.
- Depunerile și retragerile sunt fluxuri externe portofoliului. Cumpărările/vânzările între active și numerarul aceluiași portofoliu nu sunt automat depuneri/retrageri externe.
- Investițiile recurente sunt modalități de alimentare, nu un motiv de a număra încă o dată aceeași deținere.
- Pentru un interval, propunerea de bază pentru rezultat absolut este valoare finală minus valoare inițială minus flux net extern din interval. Tratamentul dividendelor distribuite, comisioanelor, taxelor, numerarului și FX trebuie convenit pentru a evita contradicții.
- Procentul necesită o metodă de business agreată pentru portofolii cu fluxuri multiple. Nu se deduce din exemplul vizual și nu se inventează o formulă prin simpla împărțire la valoarea curentă.
- Selectarea perioadei schimbă fereastra graficului și performanța aferentă. Valoarea totală actuală rămâne aceeași când toate intervalele se termină la aceeași dată.
- Linia aportului păstrează baza istorică la începutul ferestrei vizibile; nu pornește artificial de la zero când clientul selectează 1M.
- Selectarea unui punct schimbă tooltip-ul, fără a înlocui în tăcere valoarea curentă din rezumat.
- Recomandările consumă un rezultat de eligibilitate valid, produs identificabil, prioritate și versiunea profilului. MiFID expirat, date lipsă sau profil schimbat invalidează rezultatul vechi; nu se afișează o recomandare presupusă.

## Review Focus

1. Depuneri/retrageri, vânzări și investiții recurente: aportul nu este confundat cu randamentul și produsele nu sunt dublate.
2. Profil expirat/modificat: recomandările vechi dispar până la o evaluare validă.
3. Istoric insuficient, portofoliu gol, rezultat zero/negativ și aport net zero/negativ: nu apar procente infinite, date fabricate sau grafice înșelătoare.
4. Monede diferite și localizare: conversia și data evaluării sunt coerente între card, grafic, tooltip și detaliu.
5. Ruta reală Future, iOS/Android, text mărit și scroll: CTA-ul rămâne accesibil, iar baseline și fluxurile Robo/Chatbot își păstrează comportamentul.

## 6. Etapele implementării propuse

### Task 1 — Integrarea în ruta efectivă și structura paginii

Fișiere de integrare existente: ClassicPortfolio.tsx, hostAdapter.tsx, baseline/Controller.tsx, baseline/overview/CzRoboOverview.tsx. Fișiere de prezentare existente: ModuleNavigation.tsx și native-spike/src/app/CzechPrimaryNavigation.tsx.

- [ ] Identifică selecția prezentării pentru fiecare dintre cele trei release-uri Future și caracterizează ruta completă, inclusiv intrarea din Home și revenirea cu X.
- [ ] Introdu o prezentare Future explicită, păstrând controller-ul și callback-urile existente. Verifică proprietarul fișierelor comune înaintea editării.
- [ ] Aplică antetul compact și rezumatul prioritar în componenta efectiv randată.
- [ ] Reutilizează bara Evo, cu Invest evidențiat și conținut care poate continua sub bara translucidă, fără fundal suplimentar; păstrează inset suficient pentru ultima deținere.
- [ ] Verifică toate cele cinci destinații, revenirile, scroll-ul și consumatorii baseline. Livrabil: pagina reală Future cu navigație funcțională.

### Task 2 — Model comun de istoric și performanță

Fișiere propuse, nume de lucru: src/features/investments/future-overview/types.ts, model.ts și fixtures.ts. Consumă catalogul/deținerile și istoricul disponibil; produce un snapshot unic cu puncte, interval, rezultat absolut/procentual, monedă și data evaluării.

- [ ] Stabilește convențiile de calcul descrise în secțiunea 5 și contractul sursei de date.
- [ ] Construiește fixture-uri sintetice deterministe pentru câștig, pierdere, contribuții recurente, retrageri și portofoliu gol.
- [ ] Implementează agregarea fără dublare, selecția intervalului și calculul rezultatului după convenția agreată.
- [ ] Verifică numeric fluxurile externe, dividendele/comisioanele conform convenției, zero/negativ și monedele. Livrabil: date reconciliabile pentru rezumat și grafic.

### Task 3 — Graficul cu două serii

Sursa de reutilizat: baseline/overview/PortfolioChart.tsx și componentele existente de perioade. Fișier propus pentru prezentarea Future: native-spike/src/experiences/pi/cz/evo-2027/investments/FuturePortfolioChart.tsx, dacă extinderea componentei existente nu oferă o limită clară.

- [ ] Adaugă seriile Portfolio Value și Net Invested Amount din snapshot-ul comun.
- [ ] Folosește linie continuă pentru valoare și întreruptă/în trepte pentru aport; adaugă legenda și tooltip-ul cu dată și ambele sume.
- [ ] Parametrizează exact 1M, 3M, 1Y, 3Y și MAX pentru Future; păstrează configurația baseline.
- [ ] Leagă performanța din rezumat de interval. Propunere: MAX implicit pentru vederea completă, de validat ca alegere de produs.
- [ ] Verifică selecția prin atingere, mouse și alternativă accesibilă, schimbările rapide de interval, istoricul scurt și datele lipsă. Livrabil: grafic interactiv coerent cu rezumatul.

### Task 4 — Investment Profile

Fișiere propuse: prezentare InvestmentProfileScreen.tsx în experiența CZ Future și model în features/investments/future-overview. Integrare cu rutele existente de profil, MiFID și documente după auditul acestora.

- [ ] Inventariază intrările existente și reutilizează actualizarea MiFID fără duplicarea politicilor Robo.
- [ ] Compune profilul, starea/data MiFID, explicația pieței-țintă, raportul consolidat și extrasele.
- [ ] Conectează accesul din antet/More și revenirile, păstrând contextul portofoliului.
- [ ] Demonstrează profil valid, expirat, incomplet și actualizat. Orice flux absent în DEMO se declară ca propunere/simulare, nu ca funcționalitate de producție. Livrabil: un profil navigabil și stări explicite.

### Task 5 — Recommended for you

Fișiere propuse: src/features/investments/future-overview/recommendations.ts și un bloc de prezentare FutureInvestmentRecommendations.tsx, reutilizând cardurile/banner-ele aprobate.

- [ ] Definește contractul de eligibilitate, compatibilitate și prioritizare cu owner-ul business; ține regulile în features.
- [ ] Afișează produsul concret, explicația scurtă și CTA-ul către detaliul existent.
- [ ] Ascunde secțiunea fără rezultat eligibil; invalidează recomandarea la schimbarea profilului/MiFID/pieței-țintă.
- [ ] Pentru DEMO folosește scenarii explicite, nu un motor de recomandare pretins real. Verifică mai multe produse, lipsa eligibilității și actualizarea profilului. Livrabil: recomandări condiționale cu destinații funcționale.

### Task 6 — Integrarea și acceptanța finală

- [ ] Verifică aceeași bază de funcționalitate în Evo 2027, CZ Robo și CZ Chatbot, cu păstrarea intrărilor lor specifice și a sursei unice de date.
- [ ] Verifică limbile suportate de DEMO, moneda, anonimizarea sumelor și toate stările de încărcare/eroare/date parțiale.
- [ ] Verifică în host-ul web și în iOS/Android disponibile: safe areas, tap targets, focus, cititor de ecran, 200% text și contrast. O probă doar pe web nu certifică ambele platforme native.
- [ ] Rulează testele afectate, audit:modules și, prin integration owner, un singur npm run verify pe starea combinată după încheierea editărilor. Raportează blocajele reale fără slăbirea pragurilor.
- [ ] Livrează matricea cerință → ecran/comportament → dovadă de verificare și diferențele rămase față de producție.

## 7. Ordine și dependențe

Ordinea recomandată: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6. Profilul și recomandările împart versiunea profilului, iar graficul și rezumatul împart snapshot-ul de istoric. Fiecare etapă poate fi prezentată separat pentru review; prezentarea vizuală nu se confundă cu disponibilitatea datelor pentru producție.

Pentru bugetare, grupurile sunt: (A) ierarhie și navigație, (B) istoric și calcul financiar, (C) profil și recomandări. B și C au dependențe de date și business care nu pot fi estimate responsabil numai din screenshot-uri. Nu se propun termene sau costuri ferme înaintea clarificării lor.

## 8. Decizii de validat înaintea codului

1. Convenția de performanță procentuală și tratamentul fluxurilor, dividendelor, comisioanelor, numerarului și FX.
2. Sursa și acoperirea istoricului pentru toate produsele; definiția portofoliului și conturilor agregate.
3. MAX sau 3Y ca perioadă implicită; propunerea acestui plan este MAX.
4. Poziția accesului la profil și reorganizarea secundară a Portfolio breakdown.
5. Regulile și serviciul de eligibilitate/prioritizare pentru recomandări; diferența între campanie generică și recomandare personalizată.
6. Adoptarea aceleiași baze de funcționalitate în toate cele trei versiuni Future; CZ rămâne scope-ul implementării curente, SK este o extindere distinctă.

Nu este necesară alegerea unei metode de execuție pentru a citi acest plan. Implementarea urmează într-o etapă ulterioară cerută de utilizator.
