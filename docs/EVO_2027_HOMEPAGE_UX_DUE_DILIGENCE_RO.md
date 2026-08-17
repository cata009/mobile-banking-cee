# Evo 2027 Homepage Transformation

## UX/UI due diligence pentru UniCredit CEE

**Data analizei:** 17 august 2026  
**Perimetru:** PI retail, homepage Current versus propunerea Future App — Evo 2027; piețe CEE: CZ, SK, HU, RO, RS, BA, SI  
**Metodă:** inspecție comparativă în prototip, testarea portofoliilor simple și complexe, audit al logicii de compoziție și al testelor, evaluare euristică UX/UI și accesibilitate, benchmark competitiv din surse oficiale.

---

## 1. Verdict executiv

### Verdictul într-o propoziție

**Evo 2027 este o direcție vizuală și strategică bună, dar homepage-ul actual este încă un demo pentru un singur „happy path”, nu o arhitectură de homepage pregătită pentru populația reală de clienți CEE.**

Recomandarea mea pentru business este **aprobare condiționată a transformării**, nu aprobarea implementării actuale ca soluție finală.

Merită păstrate:

- orientarea către acțiuni;
- conținutul contextual și activitatea recentă;
- prezentarea mai bogată a produselor;
- controlul de privacy pentru sume;
- trecerea de la inventar bancar la un cockpit financiar.

Trebuie redesenate înainte de orice angajament de rollout:

- logica de compoziție pentru portofolii diferite;
- modul în care sunt selectate categoriile și ecranul inițial;
- integritatea sumelor, produselor și tranzacțiilor;
- raportul dintre banking și vânzare;
- localizarea, accesibilitatea și regulile specifice fiecărei piețe;
- densitatea verticală și repetarea acțiunilor.

### Evaluare diagnostică

Scorurile sunt o evaluare de consultant, nu rezultate dintr-un studiu cantitativ.

| Dimensiune | Baseline actual | Evo 2027 actual | Evo după corecția recomandată |
|---|---:|---:|---:|
| Înțelegerea rapidă a portofoliului | 8/10 | 5/10 | 9/10 |
| Acces la acțiuni frecvente | 4/10 | 8/10 | 9/10 |
| Relevanță pentru client | 5/10 | 4/10 | 9/10 |
| Robustețe pe scenarii | 8/10 | 2/10 | 9/10 |
| Încredere în date | 7/10 | 2/10 | 10/10 |
| Personalizare | 2/10 | 5/10 | 9/10 |
| Echilibru utilitate–vânzare | 8/10 | 4/10 | 8/10 |
| Pregătire pentru 7 piețe | 6/10 | 2/10 | 8/10 |
| Calitate vizuală și expresivitate | 5/10 | 8/10 | 9/10 |
| Accesibilitate structurală | 6/10 | 5/10 | 9/10 |

**Interpretarea corectă:** baseline-ul este robust, dar slab ca experiență; Evo este atractiv și acționabil, dar fragil și uneori neadevărat. Soluția nu este întoarcerea la baseline. Soluția este să păstrăm ambiția Evo și să-i înlocuim compoziția rigidă cu una adaptivă.

### Concluzia celei de-a doua evaluări

După reevaluarea ca utilizator novice, power user, client vulnerabil și client care își primește salariul la UniCredit, are ipoteca aici, dar cheltuiește prin Revolut, verdictul devine mai sever:

> **Evo actual poate schimba percepția vizuală, dar nu schimbă comportamentul bancar.**

Pentru clientul dual-bank, probabilitatea diagnostică de a muta tranzacționalitatea de la Revolut la UniCredit este aproximativ **2/10 în forma actuală**. O versiune corectată poate ajunge la **7–8/10 numai dacă homepage-ul este susținut de capabilități reale**: money-in/money-out rapid, card controls, notificări imediate, obligații și cash-flow corecte, transparență FX, automatizări de payday și suport uman verificat. Un redesign fără aceste capabilități este o schimbare de decor, nu o schimbare de primacy.

Riscul strategic nu este doar că utilizatorul preferă interfața Revolut. Riscul este că UniCredit păstrează salariul și creditul, în timp ce altă aplicație deține frecvența de utilizare, plățile, datele comerciale și relația cotidiană cu banii.

---

## 2. Ce rezolvă bine Evo

### 2.1 Transformă homepage-ul din listă de produse în spațiu de lucru

Baseline-ul răspunde mai ales la „ce produse am?”. Evo încearcă să răspundă și la „ce pot face acum?” prin:

- payment și QR direct din cardul contului;
- tranzacții recente;
- progres pentru credit;
- context de economisire;
- privacy masking;
- acces direct în detaliul produsului.

Aceasta este direcția corectă pentru 2027. Utilizatorul nu intră în bancă pentru a admira arhitectura produselor, ci pentru a verifica, decide și acționa.

### 2.2 Are mai multă ierarhie vizuală

Rezumatul colorat, cardurile de produs, progresul și separarea pe domenii fac experiența mai expresivă decât baseline-ul. Lighthouse-ul aduce un asset de brand memorabil și poate deveni un semnal distinctiv UniCredit, cu condiția să rămână decorativ și să nu ocupe spațiu util în scenarii presate.

### 2.3 Privacy masking este bine tratat

Ascunderea sumelor funcționează consecvent în modulele financiare testate. Aceasta trebuie păstrată și extinsă la:

- preview-uri de notificări;
- app switcher și screen sharing;
- ascunderea granulară a anumitor produse sau tranzacții;
- preferințe sincronizate între dispozitive.

### 2.4 Există semantici bune, dar incomplete

Sunt folosite roluri de tab, stări aria-selected, accordion cu aria-expanded, progressbar și regiuni etichetate. Fundația este mai bună decât pare la prima vedere. Deficiența nu este absența totală a accesibilității, ci faptul că implementarea s-a oprit la jumătatea drumului.

---

## 3. Ce baseline-ul face mai bine și nu trebuie pierdut

### 3.1 Vizibilitatea portofoliului

În același viewport și pe aceeași configurație complexă:

- baseline-ul are aproximativ **331 px** de scroll intern suplimentar;
- Evo are aproximativ **1.188 px** când produsele sunt colapsate;
- Evo ajunge la aproximativ **1.631 px** cu Accounts extins.

Evo cere deci aproximativ de 3,6 până la 4,9 ori mai mult scroll pentru aceeași relație bancară. Aceasta nu este doar o problemă de spațiu. Înseamnă că produsele, obligațiile și serviciile devin mai greu de descoperit.

### 3.2 Fidelitatea inventarului

Baseline-ul respectă în mare numărul de produse cerut de scenariu și face imediat vizibile categoriile deținute. Evo transformă uneori inventarul pentru a servi povestea demo. Într-o bancă, frumusețea vizuală nu poate compensa o reprezentare falsă a portofoliului.

### 3.3 Neutralitatea comercială

Baseline-ul este auster, dar nu împinge oferte înaintea produselor deținute. Evo introduce carduri de achiziție, „For your interest” și ShopSmart chiar în contexte în care clientul încearcă să găsească singurul produs pe care îl are.

Lecția de păstrat: **home trebuie să fie al clientului înainte de a fi al pipeline-ului comercial.**

---

## 4. Ce pare bine, dar este de fapt broken

### P0 — blocante de încredere și eligibilitate pentru lansare

#### 4.1 Portofoliul afișat nu respectă portofoliul real

În Evo, orice număr nenul de conturi curente este înlocuit cu trei conturi fixe CZK/EUR/USD. Orice număr nenul de depozite este înlocuit cu trei depozite. Două carduri de debit ajung să producă trei reprezentări vizuale, dintre care una nu este un produs real.

Aceasta rupe principiul elementar:

> Un obiect financiar vizibil trebuie să corespundă unui produs real, cu un ID real, o stare reală și o destinație reală.

Sursa tehnică: transformările de inventar sunt introduse în [useProducts.tsx](../src/hooks/useProducts.tsx), iar cardul vizual suplimentar în [App2027ProductAccordions.tsx](../src/app/screens/home/App2027ProductAccordions.tsx).

#### 4.2 Un singur card de debit dispare complet

Cu un cont și un card de debit:

- bannerul de achiziție este ascuns deoarece cardul există;
- carousel-ul este afișat doar când există cel puțin două carduri;
- rezultatul este că singurul card deținut nu apare deloc.

Aceasta nu este o imperfecțiune de layout, ci un defect funcțional sever. Clientul poate interpreta că produsul a dispărut, este blocat sau contul lui a fost compromis.

#### 4.3 Totalurile se contrazic cu produsele

Exemple observate:

- un cont vizibil de **22.850,50 CZK**, dar Total Available de **44.902,82 CZK**;
- credit-card-only: Total owed **0**, deși cardul arată **6.800** credit utilizat din limita de **10.000**;
- portofoliul complex: baseline **59.902,86 Kč**, Evo **59.902,82 CZK**.

Pentru un utilizator, patru bani diferență pot părea mici. Pentru o bancă, două totaluri diferite pentru aceeași poziție distrug autoritatea informațională a homepage-ului.

#### 4.4 Metricile prezentate ca adevăr sunt fabricate

În implementarea actuală:

- „Spent this week” este 0,5% din totalul disponibil;
- „Growth this year” este 3,2% din totalul economisirilor;
- „Due this month” este 0,9% din datoria calculată;
- polițele de asigurare, datele, dobânzile, activitatea și unele oferte sunt hardcodate.

Un prototip poate folosi mock data, dar nu trebuie să modeleze logică falsă ca viitoare regulă de business. În producție, fiecare metrică trebuie să aibă:

- definiție semantică;
- sursă de date;
- monedă și interval;
- regulă de actualizare;
- tratament pentru pending, reversals și date întârziate;
- explicație accesibilă utilizatorului.

#### 4.5 Activitatea nu respectă deținerile

În scenariul cu un singur cont și zero carduri, Evo afișează în continuare tranzacții descrise ca fiind de card. O activitate fără produsul-sursă este o „halucinație UI”. Pentru o aplicație financiară, acest tip de defect are gravitatea unei erori de date, nu a unei simple inconsistențe de conținut.

#### 4.6 Localizarea nu există în transformarea Evo

Cu limba setată pe cehă, homepage-ul Evo rămâne în engleză, inclusiv tabs, rezumate, empty states, produse, campanii și asigurări. Formatarea banilor este fixată pe cs-CZ, nu este o infrastructură multi-market.

În acest stadiu, Evo este un concept CZ în engleză, nu o soluție CEE.

### P1 — probleme majore de arhitectură UX

#### 4.7 Default-ul „Accounts” este greșit pentru milioane de situații legitime

Tab-ul inițial este întotdeauna Accounts. Pentru credit-card-only sau loan-only, clientul vede:

- Total Available 0;
- Spent 0;
- oferte de cont și card;
- produsul real ascuns într-un alt tab.

Homepage-ul îi spune, implicit: „nu ai nimic relevant aici, cumpără ceva”, deși are o relație financiară activă și eventual o obligație scadentă.

#### 4.8 Categoriile fixe confundă navigarea cu achiziția

Accounts, Savings, Credits și Insurances sunt afișate indiferent de dețineri. Un tab gol este apoi umplut cu vânzare. Aceasta mută arhitectura din:

> „navighez prin ceea ce dețin”

în:

> „navighez prin catalogul băncii”.

Catalogul trebuie să existe în Products/Explore, nu să redefinească Home.

#### 4.9 Ofertele pot apărea înaintea produselor deținute

În one-account-only, oferta pentru card apare deasupra contului deținut. În loan-only, oferta de credit card apare înaintea împrumutului. Ordinea este contrară atât intenției utilizatorului, cât și construirii încrederii.

#### 4.10 Repetarea acțiunilor nu scalează

În scenariul cu mai multe conturi, „New payment”, „Scan QR”, „Create QR” și „Account info” se repetă pentru fiecare cont. Aceeași acțiune apare de trei ori, iar în portofolii mai mari creează zgomot și scroll.

Soluția corectă:

- un singur set de quick actions stabil;
- contul sursă este preselectat pe baza contextului;
- utilizatorul îl poate schimba în flux;
- doar acțiunile strict specifice unui produs rămân pe cardul acelui produs.

#### 4.11 Rail-ul de categorii dispare la scroll

Tabs sunt statice. După ce utilizatorul parcurge un tab lung, schimbarea domeniului cere întoarcerea la început. Dacă tabs rămân în soluție, ele trebuie să fie sticky și accesibile; recomandarea mai bună este însă un Overview compact plus drilldown.

#### 4.12 CTA vizual fără acțiune

„Open another card” arată ca un CTA, dar nu are handler și devine un element static. Affordance-ul fals este periculos într-un context bancar: utilizatorul nu știe dacă aplicația este blocată sau elementul nu este interactiv.

### P2 — rafinare vizuală, accesibilitate și consistență

- Homepage-ul Evo nu are un H1/titlu semantic al conținutului principal.
- Tabs nu au asociere completă cu tabpanels, arrow-key navigation și roving tabindex.
- Header actions au aproximativ 32×32 px, sub recomandarea Apple de 44×44 pt și sub recomandarea Android de 48×48 dp.
- Indicatorii de carousel au suprafețe vizuale de 6×6/30×6 px și etichete incorecte de tip „Go to account” pentru carduri și oferte.
- Imaginea lighthouse este anunțată de screen reader, deși este decorativă; alte ilustrații similare sunt ascunse.
- „CZK” și „Kč” sunt folosite inconsistent.
- Ofertele și produsele deținute au un limbaj vizual prea apropiat.
- Densitatea textului din unele carduri și umbrele multiple fac interfața să pară „concept UI” înainte de a părea produs matur.

---

## 5. Matricea scenariilor cerute

| Scenariu | Ce face Evo acum | De ce este broken | Comportamentul recomandat |
|---|---|---|---|
| 1 cont + 1 card de debit | Umflă contul la trei; cardul unic dispare; arată activitate și oferte | inventar fals, produs invizibil, total incorect | overview cu soldul real; cont și card asociat vizibile împreună; maximum 3 acțiuni; activitate recentă reală |
| Doar 1 cont | Trei conturi demo; ofertă de card înaintea contului; tranzacții de card fără card | vânzare înaintea utilității; activitate imposibilă | contul ca hero; plăți/QR/date cont; activitate; eventual o singură ofertă de card după conținutul bancar |
| Doar 1 card de credit | Deschide Accounts cu zerouri și acquisition; cardul e ascuns în Credits; Total owed 0 | default irelevant și contradicție financiară | deschide overview-ul cardului; available credit, used credit, statement/minimum due, due date; Pay/Freeze/Manage |
| Doar 1 loan | Deschide Accounts și două oferte; loan-ul e ascuns în Credits | obligația reală este subordonată vânzării | loan ca modul principal; outstanding principal, next instalment/date, progress; repayment/docs/support |
| Portofoliu complex | Taburi lungi, produse inventate, acțiuni repetate, oferte multiple | scroll excesiv și prioritate slabă | overview compact cu poziție, „Now/Next”, produs favorit, obligații; drilldown pe domenii; reordonare și ascundere |
| Niciun produs activ / prospect | Dashboard cu zero-uri și catalog mascat ca Home | un prospect nu are aceeași nevoie ca un client activ | stare separată de onboarding/acquisition; fără rezumate financiare false |

---

## 6. Arhitectura recomandată: Adaptive Overview

### Principiul de bază

Nu construiți cinci homepage-uri separate. Construiți **o singură gramatică de compoziție**, cu reguli ferme de prioritate și module care apar numai când au date sau o justificare reală.

### Ierarhia globală

1. **Now — urgențe și excepții**
   - fraudă suspectată;
   - plată blocată sau eșuată;
   - document/consimțământ care expiră;
   - rată/scadență iminentă;
   - incident operațional relevant.

2. **Position — situația financiară**
   - disponibil de cheltuit;
   - obligații apropiate;
   - produse deținute;
   - timestamp când datele nu sunt live.

3. **Do — acțiuni frecvente**
   - 3–5 acțiuni stabile și localizate;
   - personalizabile fără a muta automat funcțiile critice.

4. **Activity / Next**
   - tranzacții recente și pending;
   - plăți recurente și obligații viitoare;
   - anomalii explicabile.

5. **Improve**
   - un insight financiar acționabil;
   - safe-to-spend;
   - progres către rezervă sau obiectiv;
   - control de corectare a categoriei/calculului.

6. **Explore**
   - maximum o ofertă relevantă;
   - etichetată explicit „Ofertă”;
   - dismiss, frequency cap și „De ce văd asta?”;
   - ShopSmart doar după conținutul bancar și doar dacă există relevanță/opt-in.

### Regula de compoziție

Home trebuie să fie determinat de:

- dețineri reale;
- evenimente urgente;
- produs favorit/pinned;
- frecvența acțiunilor;
- piață și rail-uri locale;
- permisiuni și preferințe;
- starea datelor.

Nu trebuie să fie determinat de:

- o categorie hardcodată;
- obiectivul comercial al sprintului;
- date demo injectate în inventarul clientului;
- presupunerea că fiecare client are un cont curent.

### Modelul de navigație

Recomand:

- bottom navigation stabil: Home, Spending/Activity, Payments, Products, More;
- Home începe cu **Overview**, nu Accounts;
- domeniile deținute apar ca drilldown din overview;
- empty categories nu apar ca taburi;
- piața poate adăuga quick actions locale fără a schimba scheletul;
- Products/Explore rămâne catalogul complet.

Un default adaptiv poate funcționa astfel:

| Condiție | Primul conținut |
|---|---|
| Există alertă severă | alerta și acțiunea sigură |
| Există scadență în 3 zile | Now/Next cu obligația |
| Clientul are cont curent | available/safe-to-spend |
| Clientul are doar card de credit | overview card/statement |
| Clientul are doar loan/mortgage | următoarea rată și sold |
| Clientul are doar savings/investments | poziție și progres |
| Nu există produs activ | onboarding separat |

---

## 7. Specificație pe scenarii

### 7.1 Un cont și un card de debit

**Above the fold**

- disponibilul contului;
- contul principal și cardul legat de el;
- mascarea soldului;
- Pay, Scan, Transfer/Request;
- eventual un status discret al cardului.

**Mai jos**

- ultimele 3–5 tranzacții;
- plăți viitoare;
- un singur insight relevant.

**Nu trebuie afișate**

- taburi Savings/Credits/Insurance goale;
- ofertă pentru „another card” înaintea activității;
- carousel pentru un singur card;
- total agregat care include conturi inexistente.

### 7.2 Doar un cont

Homepage-ul trebuie să pară complet, nu gol:

- sold și sumă disponibilă;
- IBAN/copiere date;
- plată, QR, request money;
- activitate;
- planned payments/safe-to-spend, dacă datele există.

Cross-sell-ul pentru card poate apărea o singură dată, sub activitate, numai dacă:

- clientul este eligibil;
- oferta are valoare clară;
- poate fi închisă;
- nu revine agresiv.

### 7.3 Doar un card de credit

Nu afișa „Total Available 0”. Hero-ul trebuie să folosească semantica produsului:

- available credit;
- used credit;
- statement balance;
- minimum amount due;
- due date;
- statusul plății/autopay.

Acțiuni:

- Pay card;
- Freeze/Unfreeze;
- Limits;
- PIN/details;
- Dispute transaction.

Un cont curent poate fi recomandat ulterior pentru rambursare simplificată, dar nu înaintea obligației existente.

### 7.4 Doar un loan

Hero:

- outstanding principal;
- next instalment și data;
- repayment progress;
- rate/interest type, dacă este util;
- alertă dacă plata nu este acoperită.

Acțiuni:

- Pay/cover instalment;
- early repayment simulation;
- repayment schedule;
- documents;
- verified support.

Nu afișa două produse de achiziție înaintea împrumutului.

### 7.5 Portofoliu complex

Nu încerca să afișezi toate detaliile simultan. Homepage-ul trebuie să fie un control tower:

- total available separat de total debt;
- „Next 7 days” cu obligațiile;
- produsul favorit și contul sursă implicit;
- snapshot compact al fiecărui domeniu deținut;
- latest activity;
- un insight;
- un offer.

Detaliile complete rămân în drilldown. Utilizatorul poate:

- pin/unpin;
- reordona;
- ascunde;
- redenumi;
- reseta layout-ul;
- separa profiluri personale/joint/business, unde există.

---

## 8. Contractul de integritate al homepage-ului

Acest contract trebuie aprobat de UX, Product, Data și Engineering înainte de redesign.

### Invariante non-negociabile

1. **Count fidelity:** count 0 înseamnă zero în toate modulele dependente; count 1 înseamnă un singur produs real.
2. **Identity fidelity:** fiecare card/tile are product ID valid și deschide exact produsul reprezentat.
3. **Aggregation fidelity:** totalurile sunt suma exactă a setului definit; definiția poate fi explicată.
4. **Activity fidelity:** fiecare tranzacție are o sursă existentă și accesibilă clientului.
5. **Currency fidelity:** monedele nu se adună fără conversie, curs și timestamp explicite.
6. **Temporal fidelity:** „this week”, „due”, „pending” și „available” folosesc intervale și stări documentate.
7. **Entitlement fidelity:** acțiunile apar numai când utilizatorul și produsul au dreptul de a le executa.
8. **Localization fidelity:** text, plural, valută, dată, ordine și accesibilitate vin din infrastructura locală.
9. **Failure isolation:** defectarea insight-ului sau a ofertelor nu blochează soldul, plățile, freeze sau suportul.
10. **No synthetic holdings:** niciun produs demo/comercial nu arată ca produs deținut.

Orice încălcare a primelor șapte este P0 pentru o aplicație bancară.

---

## 9. Benchmark competitiv în cele 7 piețe

Benchmarkul indică un pattern comun: liderii nu mai construiesc doar un product shelf; construiesc un overview personalizabil, tranzacțional și predictiv. Totuși, acțiunile locale rămân foarte diferite.

| Piață | Referințe competitive | Semnal relevant pentru Evo | Pack local recomandat |
|---|---|---|---|
| CZ | Česká spořitelna George, ČSOB Smart, KB+, My Air | produse reordonabile/ascunse; overview personalizat; „Smart Numbers” cu plăți planificate și bani rămași | QR/SIPO, envelopes, safe-to-spend, investiții |
| SK | George, Tatra banka, VÚB, ČSOB | widgets reordonabile, forecast de cheltuieli, investiții și daily-life services | SEPA/request money, investments, favourite actions |
| HU | OTP, MBH, George, K&H, Gránit | smart tiles, discreet mode, expense tracking, qvik și investiții | qvik, bill scan, HUF/FX, government securities |
| RO | BT Pay, George, CEC, Raiffeisen, ING, Salt | ecosistem larg, open banking, taxes, cash-flow, carousel favorit | RoPay/AliasPay, taxes, open banking, subscriptions |
| RS | Banca Intesa, Raiffeisen, OTP, Yettel | opening-screen IPS, personalizable widgets, FX și direct banker/chat | IPS QR, RSD/FX, cardless cash, phone transfers |
| BA | Raiffeisen, ASA, Nova, NLB BL, Intesa | quick services, utility/public-revenue/foreign payments; două entități cu contexte diferite | reguli entity-specific, BAM, utilities, domestic/foreign/public revenue |
| SI | NLB Klik, OTP, Intesa | 360° assets/liabilities, future payments, favourite shortcuts | UPN QR/Flik, future payments, PFM 360° |

Surse reprezentative:

- CZ: [George — personalizarea overview-ului](https://www.csas.cz/cs/internetove-bankovnictvi/george/prehled-funkci-co-vsechno-george-umi), [My Air — Smart Numbers](https://www.airbank.cz/novinky/kolik-vam-vlastne-zbyva-nova-chytra-cisla-v-my-air-vam-to-reknou-na-prvni-pohled/)
- SK: [Tatra banka — widgets și Spending Plan](https://www.tatrabanka.sk/en/personal/account-payments/mobile-applications/application-tatra-banka/), [Slovenská sporiteľňa George](https://www.slsp.sk/sk/george)
- HU: [OTP MobilBank](https://www.otpbank.hu/portal/en/ibmb-en?MobilBank-index=1), [K&H mobilbank](https://www.kh.hu/web/eng/daily-banking/electronic-services/mobilbank)
- RO: [BT Pay Accounts](https://intreb.bancatransilvania.ro/ce-pot-face-sectiunea-conturi-din-bt-pay/), [Raiffeisen Smart Mobile redesign](https://www.raiffeisen.ro/ro/despre-noi/comunicate-de-presa/2025/raiffeisen-bank-redesign-aplicatia-de-mobile-banking-smart-mobile.html)
- RS: [Raiffeisen Moja mBanka dashboard](https://help.raiffeisenbank.rs/knowledge-base/nova-pocetna-strana-moja-mbanka-new-dashboard/), [Yettel Bank](https://www.yettelbank.rs/stanovnistvo/yettel-bank-aplikacija/)
- BA: [ASA Mobile Banking 3.0](https://www.asabanka.ba/wp-content/uploads/2026/01/Mobile-Banking-3.0.pdf), [Raiffeisen BiH](https://www.raiffeisenbank.ba/en/personal/digital-services/mobile-banking.html)
- SI: [NLB Klik](https://www.nlb.si/osebno/digitalne-storitve/nlb-klik), [NLB PFM](https://www.nlb.si/osebno/pomoc-in-orodja/nlb-klik)

### Concluzia competitivă

UniCredit nu trebuie să copieze o aplicație. Trebuie să combine trei pattern-uri care apar repetat:

1. overview clar și personalizabil;
2. safe-to-spend / upcoming obligations;
3. quick actions locale.

Avantajul posibil UniCredit este o gramatică CEE comună, dar cu adaptare reală pe rail-uri locale. Un singur layout tradus în șapte limbi nu este o platformă regională; este un template.

---

## 10. Așteptările utilizatorilor în 2026–2027

### 10.1 „Spune-mi ce am, ce s-a întâmplat și ce urmează”

Homepage-ul bancar matur trebuie să răspundă fără scroll excesiv:

- cât pot folosi;
- ce tocmai s-a întâmplat;
- ce trebuie să plătesc;
- dacă există un risc sau o acțiune urgentă.

Air Bank, Tatra banka și NLB expun deja planned payments, future balance sau cash-flow, ceea ce mută benchmarkul de la raw balance la predictivitate explicabilă: [Air Bank](https://www.airbank.cz/novinky/kolik-vam-vlastne-zbyva-nova-chytra-cisla-v-my-air-vam-to-reknou-na-prvni-pohled/), [Tatra banka](https://www.tatrabanka.sk/en/personal/account-payments/mobile-applications/application-tatra-banka/), [NLB](https://www.nlb.si/osebno/pomoc-in-orodja/nlb-klik).

### 10.2 Siguranța și ușurința contează mai mult decât noutatea

În ECB SPACE 2024, principalele motive pentru a încerca o nouă soluție de plată au fost standarde mai bune de securitate și ușurința de utilizare, înaintea vitezei, stimulentelor și funcțiilor inovatoare. [ECB SPACE 2024](https://www.ecb.europa.eu/stats/ecb_surveys/space/html/ecb.space2024~19d46f0f17.en.html)

Implicație: Evo nu câștigă prin mai multe carduri promoționale, ci prin reducerea anxietății și a efortului.

### 10.3 Home devine o coadă de excepții numai când este necesar

Fraudă, plată blocată, rată apropiată sau document expirat pot întrerupe dashboard-ul normal. O ofertă comercială nu are aceeași prioritate. EBA/ECB a raportat fraudă de plată de 4,2 miliarde EUR în EEA în 2024 și creșterea manipulării plătitorului prin social engineering. [EBA/ECB](https://www.eba.europa.eu/publications-and-media/press-releases/joint-eba-ecb-report-payment-fraud-strong-authentication-remains-effective-fraudsters-are-adapting)

### 10.4 Personalizarea trebuie să fie controlată și reversibilă

Utilizatorii se așteaptă să poată pin, reorder și hide. Algoritmul poate sugera, dar nu trebuie să mute funcțiile esențiale între sesiuni. GDPR privacy by design/default cere scop clar, minimizare și protecție implicită. [European Commission — GDPR principles](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr_en)

### 10.5 Accesibilitatea este criteriu de lansare, nu polish

European Accessibility Act se aplică serviciilor bancare și de plată din 28 iunie 2025. [European Commission — EAA](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en)

WCAG 2.2 introduce criterii relevante pentru target size, consistent help, redundant entry și accessible authentication. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Implicație pentru Evo:

- text scaling 200% fără truncarea sumelor;
- screen-reader order corect;
- focus vizibil;
- alternative la swipe;
- target-uri mari;
- reduced motion;
- erori anunțate;
- limbaj simplu;
- autentificare compatibilă cu password managers și biometrie accesibilă.

### 10.6 AI este accelerator opțional, nu poarta de intrare

Un asistent poate răspunde la „ce s-a schimbat luna aceasta?” sau „găsește plata la energie”, dar:

- navigarea deterministă trebuie să rămână;
- răspunsul trebuie să indice tranzacțiile-sursă și freshness;
- inițierea plății cere confirmare explicită;
- trebuie să existe escaladare la om;
- AI nu trebuie să decidă invizibil ce produs plătit domină Home.

---

## 11. UI craft: cum ajunge Evo de la „arată bine” la „este rafinat”

### 11.1 Reduceți numărul de niveluri vizuale

În prezent concurează:

- rezumatul ilustrat;
- headerul secțiunii;
- cardul produsului;
- sub-acțiunile;
- carousel-ul;
- tranzacțiile;
- interesul comercial;
- ShopSmart;
- bottom navigation.

Recomand maximum trei niveluri pe ecran:

1. context/summary;
2. modul operațional;
3. conținut secundar.

### 11.2 Folosiți culoarea pentru stare și orientare, nu pentru decor excesiv

Lighthouse-ul și nuanțele pe domenii pot rămâne, dar culoarea nu trebuie să înlocuiască:

- titlul;
- eticheta de produs;
- iconul;
- statusul textual.

### 11.3 Faceți diferența vizuală între „Owned” și „Offer”

Un produs deținut trebuie să afișeze:

- nume;
- identificator mascat;
- stare;
- sumă;
- acțiuni.

O ofertă trebuie să afișeze:

- eticheta „Ofertă”;
- valoarea propusă;
- condițiile-cheie;
- de ce este relevantă;
- dismiss;
- fără imitarea unui produs activ.

### 11.4 Eliminați carousel-ul acolo unde nu aduce comparație

- 1 produs: card simplu;
- 2–3 produse: carousel numai dacă peek-ul și indicatorul sunt accesibile;
- multe produse: listă compactă/selectare, nu swipe infinit;
- orice element trebuie să fie accesibil și prin control explicit, nu doar gest.

### 11.5 Păstrați acțiunile stabile

Payment/QR/Request nu trebuie multiplicate pe fiecare cont. Un singur action row stabil oferă mai multă memorie musculară și mai puțin scroll.

---

## 12. Trei opțiuni strategice

### Opțiunea A — Adaptive Overview + drilldown pe domenii

**Recomandată.**

Păstrează limbajul vizual Evo, dar înlocuiește tabs fixe cu un overview compus din dețineri, evenimente și preferințe.

Avantaje:

- funcționează pentru portofolii simple și complexe;
- maximizează relevanța;
- permite reguli CEE locale;
- face loc pentru safe-to-spend și Now/Next;
- poate scala spre personalizare și AI.

Cost:

- necesită model semantic de date și reguli de orchestration;
- cere testare serioasă pe combinații;
- implică aliniere Product–Data–Engineering–Compliance.

### Opțiunea B — Modernizare incrementală a baseline-ului

Păstrează overview-ul compact și adaugă:

- activitate recentă;
- quick actions;
- Now/Next;
- un insight;
- vizualuri și spacing Evo.

Avantaje:

- risc și cost mai mici;
- fidelitate bună a inventarului;
- lansare etapizată mai simplă.

Dezavantaje:

- mai puțin diferențiator;
- risc de a cosmetiza o arhitectură veche;
- limite de personalizare și storytelling.

### Opțiunea C — Păstrarea celor patru tabs și patch-uri pe excepții

**Nerecomandată.**

Pare ieftină, dar produce excepții combinatoriale:

- taburi ascunse sau afișate;
- reguli de default;
- empty states;
- cross-sell;
- multe tipuri de produs;
- piețe și rail-uri locale.

Costul real va crește în timp, iar homepage-ul va rămâne catalog-centric.

---

## 13. Plan de validare și release gates

### Gate 1 — Integritatea scenariilor

Automatizați matricea:

- release: Current / Evo;
- accounts: 0 / 1 / 2 / 5;
- debit cards: 0 / 1 / 2 / 5;
- credit cards: 0 / 1 / 2;
- savings/deposits/investments: 0 / 1 / many;
- loans/mortgages: 0 / 1 / many;
- insurance: 0 / 1 / many;
- valute: single / multi;
- state: active / blocked / expired / pending / backend unavailable.

Pentru cele cinci scenarii cerute trebuie testate explicit:

- numărul exact de produse vizibile;
- totalul exact;
- primul modul relevant;
- absența produselor și tranzacțiilor inventate;
- acțiunile eligibile;
- tab order și screen reader;
- text scaling și localizare.

### Gate 2 — Seven-market readiness

Pentru fiecare țară:

- traducere umană și linguistic QA;
- formatare bani/data/plural;
- acțiuni locale;
- cerințe legale și consent;
- feature availability;
- scenarii cu profiluri și entități locale;
- low-bandwidth și dispozitive reprezentative.

BA trebuie tratată entity-specific, nu doar ca un locale.

### Gate 3 — Usability

Ținte recomandate pentru testare, nu benchmarkuri externe:

- minimum 90% identifică produsul principal în maximum 5 secunde;
- minimum 90% găsește următoarea obligație fără ajutor;
- minimum 95% identifică corect suma disponibilă;
- 100% din produsele deținute sunt accesibile în cel mult un tap din Home;
- zero contradicții între rezumat și detaliul produsului;
- zero taskuri critice dependente numai de swipe;
- paritate de task completion cu screen reader și text mărit pentru fluxurile critice.

### Gate 4 — Business balance

Nu măsurați doar CTR și sales conversion. Includeți:

- time to understand available funds;
- time to initiate payment;
- succesul recuperării după eroare;
- quick-action reuse;
- scroll depth până la produsul deținut;
- insight correction rate;
- offer dismissal și frequency fatigue;
- fraud self-service completion;
- trust/NPS după interacțiuni comerciale.

O ofertă care crește CTR, dar reduce încrederea sau ascunde un produs nu este un succes.

### Gate 5 — Reziliență

Home trebuie să rămână utilizabil dacă:

- analytics nu răspunde;
- offers nu răspund;
- o categorie de produse este întârziată;
- cursul FX nu este disponibil;
- assistant-ul nu este disponibil.

Soldul, activitatea de bază, plățile, freeze și suportul nu trebuie blocate de module secundare.

---

## 14. Mesajul recomandat către business

Nu prezentați propunerea ca:

> „Avem un homepage mai modern cu tabs și cards.”

Prezentați-o ca:

> „Transformăm Home dintr-o listă statică de produse într-un cockpit financiar adaptiv pentru CEE: arată ce deține clientul, ce are nevoie de atenție și ce poate face imediat, păstrând produsele și ofertele secundare sub controlul lui.”

### Ce poate promite business-ul credibil

- mai puțin timp pentru a înțelege poziția financiară;
- acces mai rapid la acțiuni frecvente;
- obligații și riscuri mai vizibile;
- experiență relevantă și pentru clientul cu un singur produs;
- cross-sell contextual, nu agresiv;
- un shell regional cu capabilități locale;
- accesibilitate și privacy by design;
- o fundație pentru financial wellbeing și AI explicabil.

### Ce nu trebuie promis încă

- readiness pentru șapte țări;
- personalizare matură;
- metrici financiare predictive;
- acoperire a tuturor scenariilor;
- consistență completă a datelor;
- accesibilitate conformă end-to-end.

Acestea sunt obiectivele următoarei faze, nu calități demonstrate de prototipul actual.

---

## 15. Recomandarea finală

**Mergeți înainte cu transformarea, dar schimbați unitatea de design.**

Unitatea de design nu trebuie să fie tab-ul Accounts, Savings, Credits sau Insurance. Trebuie să fie:

> **nevoia financiară reală a clientului, la momentul respectiv, susținută de produse reale și date adevărate.**

Decizia corectă pentru UniCredit CEE este:

1. validați Evo ca direcție de limbaj vizual;
2. respingeți compoziția rigidă actuală ca arhitectură finală;
3. construiți Adaptive Overview;
4. impuneți contractul de integritate;
5. testați scenariile simple înaintea portofoliului complex;
6. adăugați local packs pentru cele șapte piețe;
7. lansați etapizat, cu metrici de utilitate și încredere, nu doar vânzare.

În forma actuală, Evo arată viitorul, dar încă nu se comportă ca el. După aceste corecții, propunerea poate deveni nu doar „mai modernă”, ci o transformare regională solidă, defensibilă și credibilă în fața business-ului.

---

### 15.1 Trasabilitatea constatărilor inițiale

Această anexă separă explicit judecata UX de comportamentul verificabil al implementării.

| Constatare | Dovezi în implementare |
|---|---|
| Evo este activat prin feature flag și apoi verificat încă o dată prin release ID | [releaseRegistry.ts](../src/app/registry/releaseRegistry.ts), [HomeScreen.tsx](../src/app/screens/home/HomeScreen.tsx), [App2027HomeScreen.tsx](../src/app/screens/home/App2027HomeScreen.tsx) |
| Primul tab este hardcodat Accounts | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx), starea activeTab și definiția celor patru tabs |
| Spent/Growth/Due sunt procente derivate | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx), calculele 0,5%, 3,2% și 0,9% |
| Un count nenul de accounts/deposits este transformat în trei produse fixe | [useProducts.tsx](../src/hooks/useProducts.tsx), transformările CZ App 2027 |
| Un singur debit nu este redat, iar două debits produc trei tiles vizuale | [App2027ProductAccordions.tsx](../src/app/screens/home/App2027ProductAccordions.tsx), logica debitCards.length și debitCardItems |
| Credit-card debt nu intră în Total owed | [useProducts.tsx](../src/hooks/useProducts.tsx), agregarea calculateTotalOwed |
| Tranzacțiile pot folosi fallback la cont și rămân hardcodate | [App2027Activity.tsx](../src/app/screens/home/App2027Activity.tsx) |
| Asigurările sunt independente de portofoliul clientului | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx), INSURANCE_POLICIES |
| CTA „Open another card” nu are acțiune | [App2027ProductAccordions.tsx](../src/app/screens/home/App2027ProductAccordions.tsx), [GhostBanner.tsx](../src/app/components/cards/GhostBanner.tsx) |
| Copy-ul Evo nu folosește infrastructura de limbă | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx) |
| Testele Evo validează aproape exclusiv portofoliul complex și chiar fixează divergența de counts | [app-2027-homepage.test.tsx](../tests/screens/app-2027-homepage.test.tsx), [app-2027-home-routing.test.tsx](../tests/screens/app-2027-home-routing.test.tsx) |

#### Decizia de produs pe care aceste dovezi o susțin

Problema nu se poate rezolva numai prin spacing, copy sau încă două empty states. Inventarul, agregările și ordinea modulelor trebuie să devină parte dintr-un contract de compoziție al platformei. Altfel, fiecare nouă piață și fiecare tip de portofoliu va adăuga excepții peste excepții.

---

# Partea a II-a — reevaluare aprofundată

## 16. Adevărul strategic: salariul, creditul și banca principală nu mai sunt același lucru

Modelul tradițional presupunea că banca în care intră salariul este și banca principală. Pentru o parte relevantă a clienților digitali, relația s-a fragmentat:

- **salary bank:** banca în care intră venitul;
- **credit bank:** banca în care există ipoteca sau creditul;
- **transaction bank:** aplicația și cardul folosite zilnic;
- **wealth bank:** locul în care sunt ținute economiile sau investițiile;
- **trust bank:** instituția contactată în momente importante sau dificile.

UniCredit poate ocupa primele două roluri fără să ocupe al treilea. Aceasta este problema de business pe care noul Home trebuie să o rezolve.

McKinsey descrie explicit consumatori care separă contul de încasare a salariului de contul considerat principal și își transferă recurent banii către un fintech cu experiență digitală mai bună. Același raport arată că intrarea în consideration set-ul de „primary bank” crește substanțial probabilitatea de cross-sell. [McKinsey — Global Banking Annual Review 2025](https://www.mckinsey.com/~/media/mckinsey/industries/financial%20services/our%20insights/global%20banking%20annual%20review%202025/why-precision-not-heft-defines-the-future-of-banking.pdf)

În martie 2026, managerul Revolut România a descris exact pattern-ul observat de business: salariul intră la altă bancă, apoi clientul transferă aproape întreaga sumă în Revolut pentru utilizare. Este o observație comercială necuantificată și nu dovedește prevalența în baza UniCredit, dar confirmă că scenariul nu este ipotetic. [Ziarul Financiar — interviu Revolut România](https://www.zf.ro/banci-si-asigurari/florina-moisei-revolut-romania-modul-abordare-folosit-revolut-e-unul-23100019)

Un studiu global Accenture pe 49.300 de consumatori din 39 de țări arată o medie de două relații bancare și două portofele digitale. Nu este o măsurare specifică CEE, dar susține realitatea multi-banking. [Accenture Banking Consumer Study 2025](https://www.accenture.com/content/dam/accenture/final/industry/banking/document/Accenture-Global-Banking-Consumer-Study-2025-Report.pdf)

### Ce pierde UniCredit când rămâne doar „salary + mortgage bank”

Nu pierde doar interchange-ul unui card. Pierde:

- deschiderea zilnică a aplicației;
- top-of-mind-ul la momentul plății;
- datele despre merchants, subscriptions și obiceiuri;
- ocazia de a interveni înaintea unui shortfall;
- relația P2P și de familie;
- contextul necesar pentru recomandări utile;
- capacitatea de a demonstra valoare între două rate;
- probabilitatea de a fi luat în considerare la următorul produs.

### Ce nu va rezolva problema

- un lighthouse mai memorabil;
- mai multe cards și carousels;
- o zonă generică „For your interest”;
- încă un card de debit premium;
- un badge `Prime` fără beneficii concrete;
- un metric `Spent this week` decorativ;
- personalizare de culori fără personalizare funcțională;
- copierea superficială a aspectului Revolut.

### Ce poate rezolva problema

Home trebuie să demonstreze, la fiecare intrare, trei tipuri de valoare:

1. **Control:** „Știu exact ce am și ce urmează.”
2. **Protecție:** „Banca mă ajută să nu ratez rata, factura sau o fraudă.”
3. **Acțiune:** „Pot rezolva lucrul important imediat și fără fricțiune.”

Abia apoi poate adăuga discovery și vânzare.

---

## 17. Cât de reală este presiunea Revolut în perimetrul CEE

### Semnale verificate până la 17 august 2026

| Semnal | Ce este verificat | Ce nu trebuie supra-interpretat |
|---|---|---|
| Grup Revolut 2025 | 68,3 milioane de clienți retail; volume totale de tranzacții +65%; solduri +66%; tranzacții per client +24%; clienții definiți intern drept primary-bank +45%. [Rezultate 2025](https://www.revolut.com/news/revolut_reports_record_profit_of_2_3bn_for_2025_as_revenue_surges_to_6bn/), [Annual Report 2025](https://assets.revolut.com/pdf/annualreport2025.pdf) | Nu este publicat numărul absolut de primary users sau distribuția pe țări. Metricile sunt company-reported. |
| Entitatea EEA 2025 | 52,7 milioane KYC și 29,4 milioane monthly active; aproximativ 55,7% conversie KYC-to-MAU. [Raportul Revolut Holdings Europe 2025](https://assets.revolut.com/pdf/RHE_Annual_Financial_Report_2025_EN.pdf) | Un cont deschis nu înseamnă utilizator activ sau bancă principală. |
| România | Site-ul curent indică 4,5 milioane de utilizatori; sucursala și IBAN-ul local au fost introduse explicit pentru salarii și plăți recurente. [Revolut România](https://www.revolut.com/en-RO/), [anunț IBAN local](https://www.revolut.com/en-RO/news/revolut_bank_updates_its_local_ibans_for_over_4_million_romanian_clients/) | Numărul este raportat de companie; nu este MAU și nu indică share of wallet. |
| Ungaria | Presa locală a relatat 2,23 milioane de clienți retail la final de 2025 și peste 250 milioane de tranzacții în 2025, pe baza briefingului Revolut. MNB confirmă că sucursala locală a început activitatea la 1 noiembrie 2025. [Telex](https://telex.hu/gazdasag/2026/03/24/nyereseg-revolut-fintech-banki-tranzalcio-csalas), [MNB Annual Report 2025](https://www.mnb.hu/letoltes/mnb-annual-report-2025-vegleges.pdf) | Primul set de cifre este company-reported. |
| CZ / SK / SI | Copiile locale curente afirmă aproximativ 1 milion în CZ, 500.000 în SK și 200.000 în SI și promovează explicit mutarea salariului. [CZ](https://www.revolut.com/cs-CZ/), [SK](https://www.revolut.com/en-SK/), [SI](https://www.revolut.com/en-SI/) | Sunt claims comerciale, nu statistici independente de activitate. |
| Serbia / Bosnia și Herțegovina | Niciuna nu apare în lista exhaustivă de țări de rezidență eligibile pentru onboarding. [Lista de țări suportate](https://help.revolut.com/en-BG/help/profile-and-plan/profile-plan/verifying-identity/what-countries-are-supported/) | Presiunea de așteptare poate exista prin diaspora, travel și alte fintech-uri, dar nu trebuie prezentată ca adopție locală Revolut echivalentă cu RO/HU/CZ/SK/SI. |

### Concluzia pe piețe

- **RO și HU:** amenințare de primacy foarte mare; Revolut localizează activ infrastructura și salariul.
- **CZ, SK și SI:** amenințare mare pentru plăți zilnice, FX, travel și clienți tineri; avantajul UniCredit rămâne creditarea și relația locală.
- **RS și BA:** nu construiți strategia în jurul unui competitor care nu poate onboarda normal rezidenții locali. Construiți pentru rails locale, cash, FX, utility/public payments și suport uman, păstrând standardul de usability creat de neobanks.

### De ce Revolut câștigă frecvența

Nu printr-un singur feature spectaculos, ci printr-un sistem coerent:

- Home cu balance, account/currency switching, activity și widgets configurabile;
- analytics pentru spend, income, cash flow, budget și total wealth;
- conectarea conturilor externe și funding din aplicație;
- Income Sorter, care distribuie venitul automat către pockets, joint, savings, investments sau P2P;
- card freeze, virtual și disposable cards;
- plăți multi-currency cu conversie automată;
- split bill, group expenses și transferuri sociale;
- feedback tranzacțional aproape instant;
- Standard fără abonament obligatoriu.

Surse funcționale: [Revolut Home și personalizare](https://www.revolut.com/blog/post/revolut-10/), [Analytics](https://help.revolut.com/en-RO/help/accounts/budget-and-analytics/what-is-the-analytics-dashboard/), [Income Sorter](https://help.revolut.com/ro-RO/help/accounts/budget-and-analytics/using-the-income-sorter-feature/), [linked external accounts](https://help.revolut.com/ro-RO/help/app-features/linking-external-bank-accounts/how-do-i-link-an-external-account-to-my-revolut-app/), [card freeze](https://help.revolut.com/ro-RO/help/card-payments-withdrawals/ping-other-card-security-settings/freezing-or-blocking-your-card/).

### Ce are UniCredit și Revolut nu poate replica ușor

- istoricul salariului și al obligațiilor în aceeași relație;
- ipotecă, garanție, documente, asigurare și serviciu pe termen lung;
- capacitatea de a calcula corect acoperirea ratei din contul de rambursare;
- relația de household și produse complexe;
- context local și rails domestice;
- suport verificat pentru fraudă, hardship, moștenire, plăți mari și documente;
- advisor/branch atunci când cazul nu încape într-un chat;
- posibilitatea de a recompensa transparent relația completă, nu doar cheltuiala.

Aceasta trebuie să fie sursa diferențierii. UniCredit nu trebuie să devină o copie întârziată a Revolut. Trebuie să devină **cel mai bun financial control tower pentru viața financiară reală a clientului**, inclusiv atunci când o parte din bani se află în altă bancă.

---

## 18. Persona critică: salariu și ipotecă la UniCredit, cheltuieli în Revolut

### Contextul realist

Clientul:

- primește salariul în contul UniCredit;
- are ipoteca și eventual asigurarea proprietății la UniCredit;
- păstrează suficient pentru rată și direct debits;
- mută restul în Revolut după payday;
- folosește Revolut pentru card, FX, travel, P2P și vizibilitate zilnică;
- deschide UniCredit de două–patru ori pe lună, nu zilnic.

Acest client nu urăște UniCredit. Pur și simplu nu simte că UniCredit îl ajută între două obligații.

### Ce vede acum în demo-ul Evo

În scenariul analizat, Home afișează `Total Available 59 902,82 CZK`, `Spent this week 300 CZK`, o activitate `Salary +62 500`, o ipotecă existentă ascunsă sub `Credits`, carduri debit și promoția ShopSmart. Dar:

- suma `Spent this week` este derivată matematic, nu din tranzacții;
- tranzacțiile vizibile McDonald's și Spotify totalizează deja mai mult decât valoarea `Spent`;
- rata următoare nu este în primul viewport;
- Home nu spune dacă rata este acoperită;
- nu spune ce sumă poate pleca în siguranță;
- nu diferențiază cheltuielile UniCredit de cheltuielile totale;
- nu recunoaște transferul recurent către contul propriu extern;
- pune comercialul înaintea valorii relației de credit.

### Reacția emoțională, secundă cu secundă

| Moment | Ce gândește clientul | Ce simte | Consecință |
|---|---|---|---|
| 0–2 secunde | „Arată mai modern.” | Curiozitate | Transformarea vizuală este observată. |
| 2–5 secunde | „Cât trebuie să las pentru rată?” | Nesiguranță | Home nu răspunde nevoii principale. |
| 5–10 secunde | „De ce spune 300 cheltuit când văd mai mult?” | Neîncredere | Orice insight viitor devine suspect. |
| 10–20 secunde | „Unde este ipoteca mea?” | Efort | Intră în `Credits`, taxonomie bancară. |
| după 20 secunde | „Îmi fac transferul și plec.” | Indiferență | UniCredit rămâne utility, nu companion. |

Sentimentul final nu este „vreau să folosesc mai mult UniCredit”, ci:

> „Banca îmi face reclamă, dar nu îmi administrează viața financiară.”

### Comparația pe care o face utilizatorul

| Job | Revolut în mintea clientului | Evo actual | Ce trebuie să facă UniCredit |
|---|---|---|---|
| Văd banii disponibili | rapid, familiar | total atractiv, dar semantic opac | available clar, sursă și breakdown |
| Știu ce pot cheltui | budgets/cash-flow | `Spent` fabricat | safe-to-spend explicabil |
| Mut bani | rapid, beneficiar familiar | posibil, dar nu este centrul Home | saved external transfer, fee și ETA |
| Protejez cardul | controls directe | controls apar, dar fără status/entitlement | status-aware controls reale |
| Înțeleg ipoteca | slab/absent în multe piețe | produs existent, dar ascuns | mortgage cockpit superior |
| Primesc ajutor în caz complex | chat-first | avantaj potențial | escaladare umană verificată și vizibilă |
| Văd toate băncile | linked accounts | nu | whole-money view cu consent și freshness |

### Răspunsul direct: m-ar motiva Evo actual?

**Nu.** M-ar face să cred că UniCredit investește în aplicație, dar nu mi-ar schimba rutina. Aș continua să deschid UniCredit la salariu și înaintea ratei, apoi aș reveni în Revolut.

Motivul nu este că Evo nu seamănă suficient cu Revolut. Motivul este că nu îmi rezolvă cele trei întrebări importante:

1. A intrat salariul?
2. Este rata acoperită?
3. Cât pot muta sau cheltui fără risc?

### Journey-ul recomandat în ziua de salariu

1. Clientul deschide Home.
2. Vede confirmarea încasării reale: `Salariul a intrat astăzi`.
3. Vede rata: sumă, dată, cont de rambursare și status `acoperită` sau `lipsesc X`.
4. Vede `Disponibil după plățile cunoscute`, marcat explicit ca estimare.
5. Poate deschide `Cum calculăm` și vede exact ce a fost inclus.
6. Alege `Distribuie salariul` sau `Transferă surplusul`.
7. Regula rezervă întâi rata și bills; restul merge către pocket, economii, cont comun sau cont extern.
8. Clientul primește confirmarea și poate modifica/anula regula.

Exemplu ilustrativ, nu formulă finală:

> **Disponibil după plățile cunoscute până la următorul salariu: 31.280 CZK**  
> Disponibil acum: 59.903 CZK  
> Rată ipotecară, 5 septembrie: −24.055 CZK — acoperită  
> Facturi cunoscute: −4.568 CZK  
> `Vedeți calculul și sursele`

Nu trebuie folosit termenul absolut `safe to spend` dacă banca nu cunoaște toate obligațiile. Copy-ul corect este `Disponibil după plățile cunoscute`, cu coverage, timestamp și confidence.

### Regula etică pentru transferurile către Revolut

Dacă sistemul observă un pattern stabil de transfer după payday, Home poate spune:

> „De obicei transferați bani după încasarea salariului. Doriți să setați o regulă după rezervarea ratei?”

Nu trebuie să spună `Știm că folosiți Revolut` decât dacă beneficiarul a fost denumit de client și utilizarea datelor este explicată. Nu trebuie să blocheze, să rușineze sau să introducă fricțiune artificială. Paradoxal, respectarea alegerii clientului poate crește încrederea și suma păstrată în timp.

### Criterii de acceptare pentru această persona

- minimum 95% identifică în cinci secunde dacă rata este acoperită;
- salary și mortgage provin din tranzacția și contractul real;
- coverage este `UniCredit only` sau enumeră sursele externe incluse;
- transferurile între conturile proprii nu sunt dublu numărate ca spending;
- orice sursă externă are `last updated`, consent status și disconnect;
- transferul către beneficiarul salvat ajunge la review în maximum două tap-uri;
- Home avertizează înainte ca transferul să compromită o obligație cunoscută;
- automatizarea explică ordinea distribuirii și poate fi oprită;
- ratele, comisioanele și ETA apar înaintea confirmării;
- succesul se măsoară prin retenție utilă și share of wallet, nu doar prin clickuri.

---

## 19. Persona simplă: puține produse, puțină răbdare

### Modelul mental real

Utilizatorul simplu nu gândește în `Accounts / Savings / Credits / Insurances`. Gândește:

- câți bani am;
- a intrat încasarea;
- ce trebuie să plătesc;
- unde este cardul;
- cum fac o plată;
- ce s-a întâmplat recent.

Evo actual îl obligă să înțeleagă arhitectura de produse a băncii înainte ca banca să-i înțeleagă nevoia.

### Cum se simte în cele patru scenarii simple

| Portofoliu | Ce ar trebui să vadă | Ce poate apărea broken acum | Sentiment probabil |
|---|---|---|---|
| 1 cont + 1 debit | un cont, cardul legat, 3–4 acțiuni, activitate | cardul unic poate dispărea; apar holdings sintetice | „Nu îmi recunosc banca.” |
| doar 1 cont | sold, pay, account details, activitate | card acquisition înaintea produsului; activitate de card falsă | „Încearcă să-mi vândă înainte să mă ajute.” |
| doar 1 credit card | amount due, due date, available credit, pay card | Home pornește în Accounts gol; `Total owed` poate fi zero | „Am nimerit în alt profil?” |
| doar 1 loan | următoarea rată, acoperire, sold, help | loan ascuns în Credits, iar Home poate arăta offers | „Unde este produsul pentru care am aplicația?” |

### Prima sesiune

Partea bună este ierarhia vizuală: suma mare și acțiunile iconice sunt observabile. Partea periculoasă este că frumusețea amplifică încrederea într-o informație greșită. Un card dispărut sau un cont inventat nu este o eroare de polish; este o ruptură de identitate.

### După 10–30 de sesiuni

Utilizatorul nu mai observă lighthouse-ul. Observă numai:

- dacă butonul de plată este în același loc;
- dacă soldul se actualizează rapid;
- dacă poate găsi tranzacția;
- dacă aplicația îl avertizează înainte de o problemă;
- dacă Back îl întoarce unde era.

De aceea, `adaptive` nu trebuie să însemne că Home se rearanjează imprevizibil. Formula corectă este:

> **stable shell, adaptive contents**

Sloturile și acțiunile critice rămân stabile. Numai conținutul din `Acum` și `Urmează` se adaptează.

### Home recomandat pentru 1 cont + 1 card

1. `Disponibil acum — 4.820,50 RON`.
2. `Cont curent • 1312 • actualizat acum`.
3. `Card Debit Standard • activ • legat de Contul curent`.
4. Acțiuni: `Plată`, `Scanează`, `Solicită bani`, `Date cont`.
5. `Urmează`: maximum două obligații.
6. `Activitate recentă`: maximum trei–cinci rânduri reale.
7. Maximum o ofertă, etichetată `Ofertă`, dismissible, sub conținutul bancar.

### Criterii de acceptare

- exact un produs în backend înseamnă exact un produs pe Home;
- minimum 95% identifică soldul corect în cinci secunde;
- minimum 90% spune dacă are ceva de plătit în curând;
- plata pornește dintr-un tap, cu sursa explicită înainte de confirmare;
- cardul și activitatea sunt la maximum un tap;
- nicio ofertă nu precedă soldul, obligațiile sau activitatea;
- la 200% text nu există clipping, overlap sau scroll orizontal;
- poziția acțiunilor critice nu se mută între sesiuni.

---

## 20. Power user: complexitatea trebuie comprimată, nu împrăștiată

### Ce vrea de fapt

Power user-ul nu cere neapărat mai multe cards. Cere:

- o poziție consolidată corectă;
- excepții și scadențe;
- acces rapid la produsul favorit;
- sursa exactă a fiecărei tranzacții;
- monedă și FX transparente;
- search, filtre și export;
- stare persistentă între Home, detail și Back;
- control asupra densității.

### De ce Evo actual îl încetinește

Evo pornește întotdeauna în `Accounts`, deci nu oferă un overview, ci primul capitol al unei povești. Utilizatorul trebuie să inspecteze pe rând patru tabs, să extindă stacks și să deruleze. În plus:

- `Savings` amestecă savings, term deposits și investments, deși au lichiditate și risc diferite;
- `Credits` amestecă credit card, loan și mortgage;
- `Total owed` nu include corect toate datoriile;
- totalurile multi-currency nu explică rate/source/timestamp;
- acțiunile se repetă per cont;
- debit-card carousel taie holdings după primele două;
- tabul, scrollul și accordion-ul nu sunt restaurate după Back;
- nu există pin, reorder, hide sau compact mode în noua transformare.

Rezultatul este paradoxal: mai multă expresivitate vizuală, dar mai puțină eficiență informațională.

### Structura recomandată

1. `Poziția dvs.`: Disponibil, Economii/Investiții și Datorii ca valori distincte, fără netting ascuns.
2. `De făcut acum / în 7 zile`: rate, documente, rejected payments, fraud/security.
3. `Favorite`: holding-uri pin-uite, maximum patru.
4. Un singur action row: `Plată`, `Transfer`, `Schimb`, `Mai multe`.
5. Snapshot-uri compacte: `Conturi 3`, `Carduri 5`, `Economii 4`, `Investiții 2`, `Credite 3`.
6. Activitate consolidată cu source, currency, pending/posted și filtre.
7. `Personalizați Home`: pin, reorder, hide, compact/detailed și reset.

### Regula de densitate

| Volum în domeniu | Comportament recomandat |
|---:|---|
| 1 produs | modul bogat, expanded, fără carousel |
| 2–3 produse | toate vizibile compact, fără ascundere implicită |
| 4–8 produse | summary de grup + favorite + `Vezi toate N` |
| peste 8 | summary, search/filter, favorite; fără scroll prin toate holdings pe Home |

### Criterii de acceptare

- minimum 95% distinge lichiditatea de active și datorii în cinci secunde;
- toate urgențele severe și obligațiile din următoarele trei zile apar fără scroll;
- domeniul este la un tap, produsul la maximum două, favoritul la unul;
- counts, totals și IDs se reconciliază 100% cu sursele;
- fiecare tranzacție deschide exact holding-ul sursă;
- preferințele persistă între sesiuni și dispozitive;
- Back revine la tab/anchor/scroll/focus anterior;
- agregatele FX afișează currency basis, source, rate și `as of`;
- `Compact` mărește densitatea, nu reduce accesibilitatea sau statusurile.

---

## 21. Personas și stări pe care scenariile de produs nu le acoperă

`1 account`, `loan-only` și `complex portfolio` sunt inventare, nu personas. O arhitectură regională trebuie testată și pe capacitate digitală, rol legal, stare financiară, frecvență, relația cu alte bănci și calitatea datelor.

### 21.1 Utilizator cu încredere digitală redusă

Vârsta și competența digitală sunt axe diferite; nu activați automat un „senior mode” pe baza vârstei.

**Riscul actual:** iconuri ambigue, copy mic, carousels, accordion-uri, lipsa unui titlu clar și oferte care seamănă cu produse deținute creează frica de a apăsa greșit.

**Recomandare:**

- limbaj complet: `Plătiți o factură`, nu numai icon;
- target-uri de minimum 44 pt / 48 dp;
- opțiune explicită `Mod simplificat / Text mai mare`;
- acțiuni critice stabile;
- ajutor verificat la un tap;
- status de securitate clar;
- nicio sarcină critică dependentă de swipe, culoare sau memorie.

**Acceptare:** 200% text, screen reader parity, minimum 90% task completion pentru sold, factură și ajutor; zero mutări automate ale funcțiilor critice.

### 21.2 Familie, joint, delegate, guardian

**Riscul actual:** un total unic poate amesteca bani personali, joint și view-only și poate sugera drepturi inexistente.

**Recomandare:**

- context switcher persistent: `Personal | Joint cu Ana | Familie`;
- etichete `Personal`, `Joint`, `Doar vizualizare` pe fiecare holding;
- approval queue pentru maker/checker sau co-owner;
- card copil cu limits/freeze specifice rolului;
- audit: cine a plătit, aprobat sau modificat;
- offers numai în context personal și numai titularului eligibil.

**Acceptare:** owner/co-owner/authorized/proxy/guardian/minor/view-only testați separat; nicio agregare implicită între contexte; zero data leakage; context switch nu contaminează sursa următoarei plăți.

### 21.3 Client stresat financiar sau overdrawn

**Riscul actual:** formatterul poate elimina semnul minus, economiile pot masca un cont negativ, iar Home poate afișa ShopSmart sau credit offers exact când clientul are shortfall.

**Recomandare:**

> `Contul este cu 320 RON sub zero.`  
> `Din limita de overdraft mai puteți folosi 180 RON — aceștia sunt bani împrumutați.`  
> `Electricitate, 140 RON mâine — lipsesc 95 RON.`

Acțiuni: `Adaugă bani`, `Mută din economii`, `Vezi opțiunile`, `Contactează-ne`. Suprimați credit marketing, lifestyle offers și gamification în starea acută. Nu folosiți vulnerabilitatea pentru targeting.

**Acceptare:** money owned, overdraft used și remaining facility distincte; shortfall înțeles în cinci secunde; safe-to-spend apare numai cu coverage suficient; KPI-urile sunt failed-payment avoidance, fee avoidance și support completion, nu sales conversion.

### 21.4 Affluent / multi-currency / investor

Acest segment observă imediat un total neverificabil sau un randament fabricat.

**Recomandare:**

- `Lichiditate`, `Investiții` și `Datorii` separate;
- selector de monedă de raportare;
- native values și FX-equivalent cu source/as-of;
- market value versus booked value;
- daily P/L versus total return, cu metodologie;
- maturity/coupon/tax/document în `Urmează`;
- adviser și quote FX real la un tap;
- suitability înaintea oricărei acțiuni de investiție.

**Acceptare:** nicio sumă cross-currency fără rate, source și timestamp; totalul se reconciliază cu breakdown; stale price este etichetat; quote-ul arată spread, fee și expirare; privacy masking include P/L.

### 21.5 Accessibility și stres situațional

Un power user poate deveni temporar low-confidence în momentul unei fraude. Un utilizator fluent poate avea o mână ocupată, lumină puternică, vedere redusă sau conexiune slabă. De aceea, accesibilitatea nu trebuie tratată ca un profil separat, ci ca proprietate a fiecărei stări.

**Regulă:** alertă clară, un singur next best action, canal verificat, copy fără jargon și niciun control critic ascuns într-un carousel.

---

## 22. Ce pare bine, dar este broken — evaluarea red-team

### P0: defecte care blochează lansarea

| Problemă | Ce crede utilizatorul | Ce se întâmplă în implementarea actuală | Risc | Remediere obligatorie |
|---|---|---|---|---|
| Produse sintetice | „Acestea sunt produsele mele.” | Counts sunt înlocuite sau extinse cu holdings demo; un card premium sintetic poate deschide alt holding. | fraud-like perception, suport, decizie pe date false | numai holdings reale; offer DTO separat; referential integrity per product ID |
| Semnul minus dispare | „Am +250, nu −250.” | Formatterul aplică `Math.abs` sumelor. | cheltuire eronată, shortfall, harm financiar | tip `Money` semnat; formattere distincte pentru asset/liability/credit limit |
| Rights ignorate | „Dacă butonul apare, pot executa.” | Entitlements există în platformă, dar Home afișează necondiționat payment, FX, PIN și block controls. | acțiuni imposibile sau nepermise, breach de încredere | capabilități și status per holding în HomeViewModel; fail-closed pentru acțiuni sensibile |
| Outage devine zero/offers | „Nu am produse.” | Arrays goale nu disting eroarea de portofoliu confirmat gol. | catalog comercial în incident, panică, conversie falsă | state union explicit și `confirmedEmpty`; cache cu `as of`; erori locale |
| PAN și CVC în Home DTO | „Home primește numai sumarul.” | Product summary include full card number și security code înainte de step-up auth. | data minimization și security exposure | numai masked PAN + token; sensitive fetch on-demand, TTL scurt, no logs/cache |
| FX stale / fallback 1:1 | „Totalul este actual și comparabil.” | Cursuri statice, fără metadata; curs lipsă poate păstra suma numeric neschimbată. | total fals, decizie financiară eronată | `FxQuote` cu source/asOf/expiresAt; complete/partial/unavailable; fără 1:1 fallback |
| Activity sursă greșită | „Aceasta este tranzacția cardului X.” | Rândurile sunt mapate la primul account/debit card și la aceeași currency. | detaliu greșit, dispută/fraud flow greșit | `sourceProductId`, booking/transaction currency și status pe fiecare rând |
| Cardurile 3–9 dispar | „Văd toate cardurile mele.” | Carousel-ul face `slice(0, 2)`. | card critic invizibil, freeze/limits ratate | toate holdings accesibile o dată; `Vezi toate N`; fără slice implicit |
| Debt/savings semantics false | „Total owed include toate datoriile.” | Credit-card debt poate lipsi; savings combină produse cu lichidități și riscuri diferite. | financial picture fals | taxonomie și agregări cu definiție, breakdown și reconciliere |
| Salary/mortgage fabricate | „Rata și salariul sunt date contractuale.” | Salary, installment, repaid și coverage sunt hardcodate sau multiplicatori. | decizie greșită exact în relația de credit | repayment account, due amount/date, arrears/autopay și salary relationship reale |

Acestea nu sunt „edge cases”. Sunt încălcări ale adevărului, autorității sau securității; orice una este suficientă pentru a opri rollout-ul.

### P1: pare rafinat, dar nu este terminat

| Element | De ce pare bun | Ce lipsește | Acțiunea concretă |
|---|---|---|---|
| Tabs Accounts/Savings/Credits/Insurances | ordine, reduc complexitatea aparentă | tabs goale, start fix, taxonomie internă, traduceri lungi | Overview implicit; numai domains existente; `Insurance`, nu plural awkward |
| `Total Available` | hero clar și memorabil | scope, pending, overdraft, joint și FX neexplicate | label contextual + breakdown + `as of` |
| `Spent this week` | pare insight personal | procent din available, nu tranzacții; coverage necunoscut | query reală + period + accounts included + pending policy |
| Lighthouse art | asset distinctiv | consumă spațiu când există alertă, text mare sau ecran mic | se comprimă/dispare sub priority și accessibility constraints |
| Privacy toggle | protejează sumele | lasă merchants, product name, account/card suffix și notifications | privacy mode complet și granular; app switcher protection |
| Product actions | acceleratoare utile | source context nu este garantat; rights/status ignorate | pass exact product ID; disabled reason; review cu source explicit |
| Carousel | promite compactare | ascunde inventarul și cere swipe | holdings list/summary; carousel numai pentru comparație reală |
| Stacked cards | arată premium | count și identitate neclare; expanded state instabil | count explicit, all-items access, persist expansion dacă are sens |
| ShopSmart / interest | energie comercială | nu are eligibility, cap, expiry, dismiss governance sau exact deep link | campaign contract; maximum una; label `Ofertă`; `De ce o văd?` |
| `Prime` badge | semnal de segment premium | beneficiul nu este explicat | arată saving/rate/advisor benefit real sau elimină decorul |
| Messages icon | familiar | fără unread count sau urgency; security notice nu este promovat | count real, severity, accessible name și routing în `Acum` |
| Profile icon | familiar | nu are acțiune în noul header | handler real sau scoatere din release |
| Back behavior | pare standard OS | tab/scroll/expanded/focus se resetează | route state și restoration tests |
| Personalizare vizuală | culori și atmosferă | noul Home nu oferă functional pin/reorder/hide | control explicit, persistent, reversibil |
| Dates/rates în cards | dau realism | hardcoded `15 Nov 2026` poate fi deja în trecut în Evo 2027 | domain data + clock + expired/missing states |
| `Insurance` module | completează portofoliul | apare fără model de count/ownership; poate fi ofertă mascată | holdings reale sau empty acquisition explicit etichetat |
| Product card clickable | pare tap target mare | unele cards sunt `div onClick`, fără keyboard semantics | link/button semantic; actions sibling; Enter/Space și focus |
| Long copy | încape în demo EN/CZ | nowrap/truncate și lățimi fixe cedează în HU/RO/SI la 200% | reflow, două linii, art drop, zero clipping pentru bani/status |

### Testul suprem pentru fiecare modul

Pentru orice element de Home, echipa trebuie să poată răspunde:

1. Din ce sursă vine?
2. Cât de recent este?
3. Pentru ce produse și roluri este calculat?
4. Ce se întâmplă când sursa lipsește sau este parțială?
5. Ce acțiune exactă poate face clientul?
6. Ce vede clientul dacă nu are dreptul?
7. Cum se comportă la text mare, screen reader și offline?
8. Cum se măsoară utilitatea fără PII?

Dacă răspunsul este `hardcoded`, `fallback la primul produs` sau `afișăm zero`, modulul nu este release-ready.

---

## 23. Contractul de date și stare trebuie să preceadă layout-ul

Adaptive Overview nu poate fi sigur dacă primește doar arrays de produse. Are nevoie de un Home View Model dedicat.

### Contract minim per holding

- `productId` stabil;
- `productType` și `displayCategory`;
- `displayName` și identificator mascat;
- `relationshipContext`: personal/joint/delegate/business;
- `partyRole` și ownership/mandate;
- `status`: active/frozen/blocked/expired/closing;
- `capabilities`: view/pay/transfer/freeze/unfreeze/PIN/limits/etc.;
- `money`: signed amount, currency, balance type și pending amount;
- `linkedProductIds`: card–account, loan–repayment account, insurance–mortgage;
- `asOf`, source și stale threshold;
- `severity` și next action;
- eligibility separată de ownership.

### Contract minim per tranzacție

- `transactionId` stabil;
- `sourceProductId`;
- booking currency și transaction currency;
- booked amount și original amount;
- state machine: authorized/pending/booked/declined/reversed/expired;
- booked/authorized timestamps și timezone;
- merchant/counterparty normalizat;
- transfer-between-own-accounts marker pentru deduplicare;
- dispute/receipt/recurring/subscription capabilities.

### Contract minim pentru Home state

Home trebuie să distingă explicit:

- `initialLoading`;
- `ready`;
- `refreshing`;
- `cachedOffline`;
- `partial`;
- `failed`;
- `confirmedEmpty`.

Fiecare domeniu poate avea stare proprie. O eroare la offers nu afectează soldul; o eroare la cards nu ascunde accounts; o eroare la FX nu inventează totalul convertit.

### Contract minim pentru offers

- campaign ID și version;
- country, language și legal copy;
- eligibility și exclusions;
- validity interval;
- destination/deep link exact;
- maximum frequency și cooldown;
- dismiss persistence;
- consent/purpose basis;
- `Why this offer?`;
- suppression pentru minor, delegate, restricted și vulnerability state.

### Regula de securitate pentru carduri

Home primește numai PAN mascat și token/card ID. Full PAN/CVC se cer numai după step-up authentication, on-demand, cu TTL scurt și fără persistence, telemetry sau cache. Testele trebuie să blocheze structural apariția `securityCode` în payloadul Home.

---

## 24. Blueprint-ul recomandat: stable shell, adaptive contents

### Primul viewport

Ordinea trebuie să fie deterministă:

1. **Security / urgent**, numai dacă există.
2. **Money position:** disponibil și, când este sigur, disponibil după plățile cunoscute.
3. **Now / Next:** salariu, rată, bill, payment problem, document.
4. **Quick actions:** maximum 3–5, stabile.

Nu puneți ShopSmart, product discovery sau carousel de ofertă înaintea acestor patru niveluri.

### Restul Home

5. **Activity recentă:** maximum trei rânduri în preview, `Vezi toate`.
6. **Owned products:** favorite și summaries de grup.
7. **One useful insight:** actionable, cu source și coverage.
8. **One offer:** clar etichetată, eligibilă, dismissible.
9. **Help and service continuity:** canal verificat, status de caz când există.

### Bugete de conținut

- maximum **5 acțiuni** în rail;
- maximum **3 rânduri** de activity în preview;
- maximum **2 alerte** severe înainte de `Vezi toate`;
- maximum **1 insight** proactiv;
- maximum **1 promoție** pe Home;
- maximum **1 carousel**, ideal niciunul pentru holdings;
- **0 empty tabs**;
- **0 duplicate quick-action rows**;
- **0 acquisition modules** înaintea produselor deținute sau urgențelor.

Aceste limite obligă echipa să prioritizeze. Fără ele, fiecare țară și stakeholder va adăuga câte un card, iar Home va deveni un feed comercial interminabil.

### Navigația pe domenii

`Accounts / Savings / Credits / Insurance` poate rămâne ca drilldown, nu ca Home implicit. Regulile:

- Home implicit este Overview;
- domains fără produse nu apar ca tabs principale;
- Credit card poate fi găsit și prin `Cards`, nu numai prin `Credits`;
- Investments nu sunt numite Savings fără explicație;
- Loan și Mortgage au status și due date în `Next`, indiferent de tab;
- tab-ul ales și scrollul se restaurează la Back;
- la labels lungi, rail-ul se adaptează fără a ascunde critic navigarea.

### Personalizarea corectă

Utilizatorul poate:

- pin favorite;
- reorder groups non-critice;
- hide un holding din Home fără a-l ascunde din Products;
- alege Compact sau Detailed;
- reseta configurația;
- vedea de ce a apărut un insight;
- opri sugestiile proactive.

Banca poate adapta conținutul din sloturi, dar nu poate:

- muta butonul de plată între sesiuni;
- ascunde o obligație critică;
- promova un produs deasupra unui incident;
- schimba singură source account-ul;
- transforma comportamentul observat într-o etichetă vizibilă de segment.

---

## 25. Matricea stărilor lipsă

Aceste stări trebuie proiectate înaintea ecranului „perfect”.

| Stare | Ce nu trebuie să se întâmple | Comportament recomandat | Acceptance test |
|---|---|---|---|
| Initial loading | `0 CZK` și offers | skeleton care păstrează structura; actions sensibile inactive | slow 3G; zero flash de empty/acquisition |
| Refreshing | blocarea întregului Home | datele existente rămân, indicator discret | acțiunile sigure rămân funcționale |
| Partial failure | dispar toate produsele | modulele reușite rămân; eroare și retry local | accounts OK, cards fail; soldul rămâne |
| Offline cu cache | date ca și cum ar fi live | `Offline • actualizat la 10:12`; freeze/support dacă politica permite | reconnect reconciliază fără duplicate |
| Offline fără cache | zero sau date inventate | stare explicită, retry, urgențe offline-capable | nicio ofertă de achiziție |
| Unknown balance | `0` | em dash / `Indisponibil momentan` | screen reader anunță unknown, nu zero |
| Stale external account | total fără avertizare | source + `last updated`; exclude sau marchează partial | consent expired și refresh fail |
| FX unavailable | conversie 1:1 | native amounts; total converted indisponibil/parțial | currency mix fără quote |
| Negative / overdraft | semn eliminat sau net pozitiv | minus explicit; own funds versus borrowed funds | −250, mixed portfolio, over-limit |
| Pending card authorization | scăzut dublu sau ascuns | pending separat; available versus booked explicate | pending→booked cu același ID |
| Reversal / expired auth | merchant debit permanent | state și impact actualizate | reversal fără duplicate |
| Frozen card | `Block card` | status dominant + `Unfreeze` dacă permis | rights/status combinations |
| Blocked / expired card | PIN și spending controls | reason, replacement/support; numai actions valide | no PIN on expired card |
| Mortgage covered | mesaj generic | sumă, dată, repayment account, `acoperită` | fondurile sunt settled și în contul corect |
| Mortgage shortfall | ofertă înaintea problemei | lipsa exactă, deadline și safe action | salary missing, cross-currency due |
| Salary delayed | alarmă pe clasificare slabă | numai după pattern robust; limbaj neutral și dismiss | irregular income nu generează false alert |
| Joint / delegate | autoritate presupusă | owner/role/context și approval state | view-only nu poate iniția |
| Vulnerability | credit marketing | support, fee/failed-payment avoidance | suppression auditabil |
| Security incident | inbox generic | alertă în top, verified channel, freeze/case | unread security alert fără scroll |
| Session expired | pierderea contextului | re-auth, apoi restore sigur al taskului | payment draft și Home state separate |
| 200–400% text | truncare de sumă/status | reflow vertical, art redus/eliminat | HU/SI/RO long labels la 320 px |

### Principiul de fallback

> **Unknown nu este zero. Error nu este empty. Stale nu este live. Partial nu este total.**

Acest principiu trebuie codificat în types, nu lăsat în copy review.

---

## 26. Propunerea de produs care poate recâștiga tranzacționalitatea

Homepage-ul nu poate compensa singur un transfer lent, FX opac sau card controls slabe. Transformarea trebuie legată de un set de capabilități.

### 26.1 Payday orchestration

Propoziția de valoare:

> **„Salariul intră aici. Rezervăm ce trebuie plătit, vă arătăm ce rămâne și vă lăsăm să decideți unde merge restul.”**

Capabilități:

- salary recognition verificabil;
- rezervă pentru mortgage/loan/direct debits;
- income split către bills, savings, joint, daily-money pocket sau cont extern;
- preview înainte de activare;
- priority order și fallback account;
- pause/edit/cancel;
- confirmări și audit;
- avertizare dacă o regulă ar crea shortfall.

### 26.2 Mortgage cockpit

Pentru un borrower existent, acesta este un motiv real de a reveni:

- next installment și repayment account;
- covered / shortfall;
- remaining principal;
- rate type și următoarea repricing/reset date;
- interest și fees paid YTD;
- prepayment simulator și impact estimat;
- payment holiday/arrears status, dacă este relevant;
- documente și asigurare asociată;
- advisor/case/help;
- milestone: `mai sunt X luni/ani`, fără gamification infantilă.

Nu înlocuiți acest cockpit cu o ofertă de refinance pentru un client care are deja produsul.

### 26.3 Daily Money la UniCredit

Dacă business-ul vrea mutarea cheltuielilor, are nevoie de un produs sau mode real, nu doar de un tile:

- pocket/subaccount de cheltuieli;
- auto-fund după payday și după rezervarea obligațiilor;
- instant virtual card și wallet provisioning;
- notificări real-time;
- freeze, limits, online/abroad/contactless controls;
- budget simplu și subscriptions;
- split/request money;
- FX transparent, cu fee/spread înainte de confirmare;
- reward relevant și ușor de înțeles;
- recovery rapid la fraudă sau card pierdut.

Dacă aceste capabilități nu există, business-ul nu trebuie să promită `Revolut-like daily banking` doar prin noul Home.

### 26.4 Whole-money view

Nu încercați să ascundeți faptul că utilizatorul are alte bănci. Folosiți Open Banking ca avantaj de control:

- conectare explicită și permissioned;
- accounts incluse enumerate;
- balance și activity cu source;
- consent expiry și reconnect;
- last sync și partial state;
- transferurile între conturile proprii deduplicate;
- totalurile pot fi `UniCredit` sau `Toate băncile`, niciodată ambigue;
- disconnect și data deletion ușor de găsit.

### 26.5 Relationship value

`Prime` trebuie tradus în valoare concretă:

> `Relația salariu + ipotecă v-a economisit 86 RON luna aceasta.`

Breakdown-ul poate include fee waiver, discount de dobândă, FX benefit sau reward. Fără breakdown, afirmația devine marketing neverificabil.

### 26.6 Predictive cash flow, nu grafice decorative

Insight-uri bune:

- `La ritmul curent, soldul poate coborî sub 500 RON pe 23 august.`
- `Abonamentul X a crescut cu 18%.`;
- `Rata este acoperită, dar două facturi cunoscute nu sunt.`;
- `A intrat salariul cu două zile mai târziu decât de obicei.`

Fiecare trebuie să aibă:

- source și coverage;
- metodă suficient de explicabilă;
- confidence/freshness;
- exact un next action;
- dismiss/correction;
- non-use pentru decisions adverse sau targeting exploatativ.

### 26.7 Security și human recovery

Avantajul incumbentului trebuie făcut vizibil:

- unusual activity status;
- freeze/limits/dispute;
- verified secure contact;
- named case owner când există caz;
- appointment/call/chat options;
- continuitate între digital, contact center și branch;
- status clar: `blocked`, `under review`, `waiting for you`.

Nu pretindeți superioritate generică de securitate. Demonstrați o recuperare mai clară și mai umană.

---

## 27. Ce trebuie copiat de la Revolut și ce nu

### De preluat ca principiu

- feedback imediat după tranzacție;
- actions puține și rapide;
- card controls vizibile;
- money movement fără fricțiune inutilă;
- currency transparency;
- external-account openness;
- customization controlată;
- analytics care duc la acțiune;
- salary automation;
- capacitatea de a începe simplu și de a descoperi gradual.

### De evitat

- copierea densității de super-app fără adopție reală a features;
- crypto/investments/travel clutter pentru clientul cu un singur cont;
- rewards ca substitut pentru usability;
- feed comercial nesfârșit;
- gamification în ipotecă sau hardship;
- mutarea taxonomiei Revolut într-o bancă cu alte produse și obligații;
- promisiunea că toate relațiile trebuie aduse în UniCredit.

### Poziționarea recomandată

Nu `Revolut, dar roșu`. Ci:

> **UniCredit este locul în care salariul, obligațiile, creditul și restul vieții financiare devin controlabile împreună.**

---

## 28. Strategie diferențiată pe țări

| Piață | Presiunea principală | Priorități Home / product |
|---|---|---|
| RO | Revolut localizat, BT Pay, George, Salt; salariu și open banking | salary orchestration, RoPay/AliasPay, taxes, open banking, mortgage cockpit, subscriptions |
| HU | Revolut branch, OTP/MBH/K&H/Gránit; qvik și FX | qvik, HUF/FX transparency, government securities context, salary split, local support |
| CZ | Revolut + George/KB+/My Air; planned money | QR/SIPO, safe-after-known-payments, reordering, mortgage/credit depth |
| SK | Revolut + Tatra/George/VÚB; spending plan | SEPA/request money, planned payments, favorite actions, investments clarity |
| SI | Revolut + NLB/OTP/Intesa; 360° finance | UPN QR/Flik, future payments, PFM whole-money view, mortgage depth |
| RS | local banks, IPS, cash/FX; Revolut indisponibil pentru onboarding normal | IPS QR, RSD/FX, cardless cash, phone transfers, verified human service |
| BA | două entități și contexte locale; utilities/public revenue/foreign pay | entity-specific rules, BAM, utilities, domestic/foreign/public-revenue flows, cash/service continuity |

Shell-ul, data contract-ul și principiile pot fi comune. Quick actions, rails, legal copy, date formats, entitlement models și offers trebuie să fie local packs versionate.

---

## 29. Prioritizare: ce trebuie făcut acum, următor și mai târziu

### Acum — înainte de următorul business playback

1. Schimbați pitch-ul din `patru tabs moderne` în `financial control tower`.
2. Arătați minimum cinci scenarii reale: 1 account + 1 card, only account, credit-card only, loan/mortgage only și complex.
3. Eliminați holdings, transactions, rates și dates sintetice din demo-ul prezentat ca experiență reală.
4. Introduceți Overview ca punct de intrare și ascundeți domains goale.
5. Înlocuiți `Spent/Growth/Due` cu date adevărate sau cu placeholders explicit marcate în prototip.
6. Puneți mortgage coverage în primul viewport pentru persona salary + mortgage.
7. Separați clar owned, insight și offer.
8. Prezentați statele loading/partial/offline/negative/restricted, nu numai happy path.
9. Arătați 200% text și cele mai lungi traduceri.
10. Documentați data contract-ul înainte de a cere estimare finală de engineering.

### Următor — MVP de producție

- Home View Model și state union;
- signed Money și FX quote contract;
- sourceProductId/currency/status pe activity;
- capabilities/status/role per holding;
- Overview + stable action rail;
- Now/Next cu due/payment/security;
- exact product counts și `Vezi toate`;
- state restoration;
- full localization;
- accessibility end-to-end;
- offer governance;
- privacy/security DTO separation;
- telemetry fără PII.

### Mai târziu — diferențiere, numai după fundație

- payday orchestration;
- whole-money view;
- predictive cash flow;
- Daily Money pocket/card;
- mortgage prepayment simulator;
- relationship-value ledger;
- household/joint orchestration;
- proactive AI cu source și confirmation;
- advanced compact mode pentru power users.

### Ordinea nu trebuie inversată

Nu construiți AI, ShopSmart expansion sau animații suplimentare înaintea truth, rights, failure și accessibility. Altfel, platforma va scala prezentarea erorilor, nu valoarea.

---

## 30. Matricea de testare pentru a demonstra că „merge în toate scenariile”

Nu încercați toate combinațiile carteziene în fiecare release. Folosiți pairwise plus scenarii critice explicit selectate.

### Axe obligatorii

| Axă | Valori minime |
|---|---|
| Portofoliu | empty confirmat; 1 account; 1 account + 1 debit; credit-only; loan-only; mortgage-only; complex; 9 cards |
| Rol | owner; joint; view-only; guardian/minor; authorized; restricted |
| Sold | positive; near-zero; zero; negative; overdraft within/over limit |
| Currency | local only; local + EUR; 3 currencies; quote missing; quote stale |
| Data | live; loading; refreshing; partial; offline cached; offline no cache; failed |
| Activity | none; salary; pending; reversal; subscription; own-account transfer; orphan source |
| Urgență | none; due soon; shortfall; blocked card; fraud alert; expired document |
| External | none; connected/live; stale; consent expired; double-count candidate |
| Session | first after migration; habitual; Back restore; logout/login; midnight rollover |
| Accessibility | default; 200%; 400% text-only; screen reader; keyboard; reduced motion |
| Locale | CZ, SK, HU, RO, RS Latin/Cyrillic dacă este în scope, BA entity/language, SI |

### Intersecțiile care trebuie testate manual

- older/low-confidence + shortfall;
- salary + mortgage + external transfer;
- joint + multi-currency;
- view-only + payment CTA;
- frozen card + security incident;
- 1 account + 5 cards;
- 5 accounts + 1 card;
- external consent expired + safe-after-known-payments;
- investment price stale + FX quote live;
- 200% text + Hungarian long labels + maximum amount;
- Back din loan detail către poziția exactă din Home;
- outage accounts + offers healthy, pentru a confirma că offer nu umple eroarea.

### Release gates măsurabile

1. **Truth:** 100% reconciliation pentru count, identity, amount, currency și source.
2. **Rights:** 100% din acțiuni respectă status/capability/role.
3. **Failure:** niciun error/unknown nu devine zero, empty sau acquisition.
4. **Task success:** minimum 90% pentru sold, payment și due; 95% pentru acoperirea ratei în persona relevantă.
5. **Accessibility:** zero critical/serious automated plus manual screen-reader/keyboard/reflow pass.
6. **Localization:** zero hardcoded user copy și validare nativă în toate piețele.
7. **Performance:** critical money state utilizabil rapid pe device/network target; skeleton fără layout shift sever.
8. **Restoration:** Back și re-auth păstrează contextul permis.
9. **Security:** Home payload fără PAN/CVC și telemetry fără PII financiar.
10. **Commercial:** maximum o offer, eligibility corectă, dismiss și suppression demonstrate.

---

## 31. Măsurarea succesului: de la retenție la primacy

Nu măsurați transformarea numai prin sessions, scroll depth sau offer CTR. Un Home confuz poate crește sessions pentru că utilizatorul nu găsește ce caută.

### Scara corectă

1. **Încredere și retenție:** date înțelese, erori recunoscute, complaints reduse.
2. **Task success:** payment, card control, rate check și transaction find.
3. **Daily utility:** zile active, quick-action completion, pending/upcoming resolution.
4. **Primary behaviors:** primary-card transactions, recurring payments, salary allocation.
5. **Share of wallet:** sold păstrat și tranzacționalitate, numai în agregat și cu governance.
6. **Cross-sell eligibil:** conversie după utilitate, nu în stări vulnerabile.

### KPI-uri recomandate

- time to identify available money;
- mortgage coverage comprehension;
- payment start-to-complete și failure rate;
- wrong-source correction rate;
- card control completion;
- Home-to-support pentru incidente și resolution rate;
- primary debit-card transaction share;
- monthly active days, nu numai MAU;
- payday outflow pattern și retained balance, agregat și purpose-limited;
- adoption/cancellation pentru salary rules;
- safe-after-known-payments corrections și false-alert rate;
- external-account consent, refresh success și disconnect;
- offer dismissal, fatigue și complaints;
- failed-payment și fee avoidance;
- accessibility task parity;
- data-reconciliation incidents per milion de sessions.

### Telemetry guardrails

- schema versionată pentru render/data-state/impression/action/error/retry/restore;
- campaign și module IDs, nu copy strings;
- experiment exposure exact-once;
- correlation fără PAN, IBAN, CVC, raw merchant sau amount;
- consent/opt-out respectat;
- amount bands numai dacă sunt necesare și aprobate;
- audit pentru suppression și vulnerable-state decisions;
- dashboards separate pe țară, persona behavior și data quality.

### Experimente utile

- Overview versus tabs ca start;
- raw available versus `după plățile cunoscute`, cu comprehension test înainte de behavior metric;
- mortgage cockpit în primul viewport pentru borrowers;
- one-off external transfer versus salary rule;
- Compact versus Detailed opt-in;
- one offer versus no offer pentru long-term utility, nu numai CTR;
- whole-money connection pitch după o nevoie observată, nu la first login.

Nu experimentați truth, rights, accessibility sau security. Acestea sunt standarde, nu variante A/B.

---

## 32. Cele trei opțiuni reale pentru business

### A. Copiem super-app-ul Revolut

**Avantaj:** poveste ușor de vândut intern.  
**Risc:** catch-up permanent, clutter, cost mare și diferențiere mică.  
**Verdict:** nerecomandat ca strategie principală.

### B. Construim control tower-ul CEE

UniCredit orchestrează salariul, obligațiile, creditul, household-ul și relațiile externe, cu rails locale și human recovery.

**Avantaj:** folosește active pe care UniCredit le are deja și pe care un neobank nu le reproduce ușor.  
**Risc:** cere integrare de date, entitlement și operating model, nu doar UI.  
**Verdict:** recomandat.

### C. Rămânem salary/credit utility cu un Home mai frumos

**Avantaj:** cost și risc de execuție mai mici.  
**Risc:** cedează frecvența, datele și viitorul share of wallet.  
**Verdict:** alegere defensivă legitimă numai dacă business-ul o recunoaște explicit; nu trebuie numită transformation of primary banking.

---

## 33. Propunerea către business

### Mesajul care face sens

> **Evo nu este un redesign al homepage-ului. Este noul contract dintre client și banca sa: ce bani are, ce urmează, ce este în siguranță și ce poate face acum.**

> **Pentru clientul care își primește salariul și are ipoteca la UniCredit, Home rezervă obligațiile cunoscute, arată surplusul și îi permite să-l administreze liber — la UniCredit sau în altă parte.**

### Ce prezentați în playback

1. Client simplu, cu un cont și un card.
2. Client loan/mortgage-only.
3. Client salary + mortgage + Revolut.
4. Power user multi-product și multi-currency.
5. Stare de shortfall/restricted/offline.
6. Aceeași gramatică în două limbi cu labels lungi.
7. Cum se trece de la Overview la detail și înapoi fără pierdere de context.
8. Cum se separă owned, insight și offer.

### Ce nu afirmați

- `Acoperă toate scenariile` înaintea matricei și testelor;
- `personalizat` dacă doar tema vizuală se schimbă;
- `safe to spend` fără coverage și metodă;
- `real-time` fără SLA și freshness;
- `Revolut competitor` fără capabilitățile tranzacționale;
- `ready pentru 7 țări` dacă rails, entitlements și copy sunt CZ-centric;
- `AI-powered` înainte ca datele de bază să fie adevărate.

---

## 34. Verdict final, fără diplomație

### Ce este bun

Evo are o ambiție corectă, o ierarhie vizuală mai bună decât baseline-ul, mai multă acționabilitate, un asset de brand memorabil și o fundație rezonabilă pentru privacy și semantics.

### Ce nu este bun

Implementarea actuală este un demo compus în jurul unui portofoliu complex. În anumite scenarii inventează, omite, reinterpretează sau rutează greșit produse și informații. Nu este încă sigură semantic pentru o bancă.

### Ce pare bun, dar este periculos

Metricile și cards-urile bogate creează mai multă autoritate vizuală decât merită datele. Un dashboard auster care spune adevărul este mai bun decât un dashboard premium care sugerează o imagine financiară falsă.

### M-ar face să folosesc UniCredit în loc de Revolut?

**Evo actual: nu.** Aș aprecia schimbarea vizuală, dar aș continua să transfer banii și să trăiesc financiar în Revolut.

**Evo corectat doar vizual: tot nu.**

**Evo construit ca financial control tower, cu payday orchestration, mortgage cockpit, Daily Money, card controls, whole-money view și human recovery reale: da, ar putea muta o parte semnificativă din comportament.** Nu pentru că ar copia Revolut, ci pentru că ar face ceva mai valoros pentru relația mea: ar conecta venitul, obligațiile și deciziile într-un singur loc de încredere.

### Recomandarea de decizie

> **Aprobați direcția Evo. Nu aprobați layout-ul și logica actuală drept soluție finală.**

Condiționați investiția de:

1. Home data/state contract;
2. adevăr și referential integrity;
3. rights/role/status per holding;
4. Overview cu stable shell;
5. cinci scenarii reale și stări de failure;
6. mortgage + salary value proposition;
7. local packs pentru cele șapte piețe;
8. accessibility și restoration;
9. offer governance;
10. release gates măsurabile.

În forma actuală, Evo este o **promisiune vizuală**. Cu aceste schimbări, poate deveni o **strategie de primacy**.

---

## 35. Dovezi tehnice suplimentare din a doua evaluare

| Constatare | Evidență |
|---|---|
| Formatterul elimină semnul sumelor negative | [products.ts](../src/data/products.ts), `formatAmount` folosește `Math.abs` |
| Home/product summary conține PAN complet și security code | [products.ts](../src/data/products.ts), [useProducts.tsx](../src/hooks/useProducts.tsx) |
| Entitlements există, dar nu ajung în compoziția Home | [bankingScenarioRegistry.ts](../src/app/platform/banking/bankingScenarioRegistry.ts), [effectiveAppContext.ts](../src/app/platform/effectiveAppContext.ts), [App2027ProductAccordions.tsx](../src/app/screens/home/App2027ProductAccordions.tsx) |
| Repository result nu distinge loading/error/offline/partial/empty | [bankingRepositories.ts](../src/app/platform/data/bankingRepositories.ts), [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx) |
| FX are tabel datat și fallback fără metadata | [exchangeRates.ts](../src/data/exchangeRates.ts), [useProducts.tsx](../src/hooks/useProducts.tsx) |
| Activity nu are source product ID/currency și cade pe primul holding | [accountDetails.ts](../src/data/accountDetails.ts), [App2027Activity.tsx](../src/app/screens/home/App2027Activity.tsx), [App2027HomeScreen.tsx](../src/app/screens/home/App2027HomeScreen.tsx) |
| Debit cards sunt tăiate după primele două | [App2027ProductAccordions.tsx](../src/app/screens/home/App2027ProductAccordions.tsx) |
| Mortgage/salary/coverage sunt hardcodate sau derivate | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx), [App2027Activity.tsx](../src/app/screens/home/App2027Activity.tsx), [App2027HomeScreen.tsx](../src/app/screens/home/App2027HomeScreen.tsx) |
| Tab/scroll/context nu sunt restaurate complet la Back | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx), [NavigationContext.tsx](../src/app/contexts/NavigationContext.tsx) |
| Unele product cards nu au semantică keyboard corectă | [ProductCard.tsx](../src/app/components/ProductCard.tsx) |
| Offer model nu are eligibility/frequency/expiry/disclosure contract | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx) |
| Long labels și text scaling se lovesc de nowrap/truncate/fixed sizes | [App2027TransformationHome.tsx](../src/app/screens/home/App2027TransformationHome.tsx), [App2027Activity.tsx](../src/app/screens/home/App2027Activity.tsx), [App2027PrimaryNavigation.tsx](../src/app/components/navigation/App2027PrimaryNavigation.tsx) |

### Limitele acestei evaluări

- Nu există un dataset public care să cuantifice exact clienții `UniCredit salary + UniCredit mortgage + Revolut daily spend`.
- Cifrele locale Revolut sunt în mare parte company-reported și nu reprezintă automat MAU sau primary users.
- Homepage-ul Revolut logat poate varia după țară, plan, rollout și personalizare; benchmarkul funcțional folosește surse publice oficiale.
- Concluziile RO/Revolut și family/joint sunt extensii de arhitectură; prototipul curent inspectat este CZ-centric.
- Un raport UX nu poate demonstra market uplift. Acesta trebuie validat prin research cu utilizatori și pilot controlat.
- Scorurile din raport sunt diagnostice, nu rezultate statistice.
