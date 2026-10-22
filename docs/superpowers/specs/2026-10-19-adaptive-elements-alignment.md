# Alinierea baseline și EVO 2027 la Adaptive Elements

Data: 19 octombrie 2026. Statut: propunere de arhitectură pentru revizuire. Acoperă planificarea solicitată; nu consemnează o migrare realizată sau o acceptare de către ASEE.

## Obiectiv

Platforma de prototipare trebuie să descrie ecranele baseline și EVO 2027 prin contracte Adaptive Elements verificate, să folosească aceste definiții pentru demonstrație și să producă un pachet acceptat de echipa de dezvoltare. Comportamentul din demo, corectitudinea mesajelor și acceptarea în aplicațiile Android și iOS sunt rezultate distincte, urmărite separat.

React Native rămâne implementarea demo-ului în propunerea de față. Rendererul nostru va interpreta subsetul de definiții AE verificat pentru un profil țintă; acest lucru nu îl transformă în SDK-ul nativ ASEE. Formatul final de import sau publicare al băncii trebuie confirmat înainte să fie declarat compatibil.

## Dovezi și limite

[Snapshotul de dovezi](../../tasks/ae-alignment-evidence-2026-10-19.json) păstrează identitatea artefactului, hash-urile rapoartelor, trimiterile la cod și cele 16 experiențe înregistrate la momentul analizei.

| Referință | Constatare susținută                                                                                                                                                                | Limită                                                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1        | APKM furnizat de utilizator; `hr.asseco.android.jimba.mUCI.ro`, versiune declarată `26.4.32.0`; SHA-256 base.apk `b756df92bed68115d0c2e4d661baa7093cc93756be66282f817f9fefb1fec5cf` | RO Android; nu este APK-ul CZ R7 și nu reprezintă un SDK iOS                                                                                                    |
| E2        | Inventar REA de 15.776 clase; export de 15.745 fișiere Java; 205 modele candidate și 200 cu cititoare JSON identificate                                                             | Numerele nu măsoară completitudinea contractelor sau a ecranelor; codul Java decompilat nu este sursa originală                                                 |
| E3        | Dispecerul recunoaște `uci:AEInputText`; cititorul aferent tratează `key`, `constraints`, `maxLength`, `visibilityLogic`, `enablingLogic` și alte câmpuri                           | Existența unei ramuri de citire nu stabilește singură tipurile complete, valorile implicite sau comportamentul observat pe dispozitiv                           |
| E4        | Sunt observate `data#type`, spațiile de nume `core:` și `uci:`, scrierea `jsonrpc` cu valoarea `2.1` și operații precum `getScreenManager`, `getAction`, `getElementValidity`       | Acestea sunt observații despre transport; nu dovedesc formatul instrumentului de autorare/import al băncii și nici conformitatea cu un standard JSON-RPC public |
| E5        | Codul verifică existența `key` și `constraints` pentru AEInputText, respectiv `key`, `currencyKey`, `currencies`, `currencyLabel` pentru AEInputAmount                              | Nu echivalează cu o schemă completă, inclusiv toate ramurile condiționale și valorile acceptate                                                                 |
| E6        | Există tipuri `core:LogicAnd`, `core:LogicCompare`, `core:LogicValue` și o fabrică Android care selectează un presenter după numele AE                                              | Semantica completă a evaluatorului, extensiile dinamice și paritatea iOS nu au fost demonstrate                                                                 |
| E7        | Exportul integral a raportat 460 erori JADX. Verificarea locală a confirmat 3.459 trimiteri la surse și identitatea APK-ului                                                        | Verificarea trimiterilor nu este un test al comportamentului. Semnătura editorului/autenticitatea distribuției nu au fost verificate                            |

Denumirile de clase obfuscate sau aliasurile decompilatorului sunt locatoare de dovezi, nu identificatori pe care îi adoptăm drept API public.

Sursele locale complete sunt în `C:/Users/mihai/Downloads/mobile-banking-analysis-2026-10-19/ro-26.4.32.0/`. Un payload construit din cititoare va fi etichetat „fixture sintetic”; doar un răspuns furnizat/capturat și aprobat de developeri poate fi etichetat „fixture de referință furnizat”.

## Acoperirea cerută

Inventarul trebuie să cuprindă toate suprafețele baseline și EVO, inclusiv rutele, subvederile, stările și scenariile; o uniune de nume de rute nu este un inventar complet de ecrane.

| Familie înregistrată    | Experiențe existente                                                                         | Tratament                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PI CEE baseline         | RO, CZ, SK, HU, RS, BA, BA_BL, SI                                                            | Acoperire obligatorie, pe fiecare țară și release înregistrat; compatibilitatea fiecărui profil se confirmă separat                                                      |
| PI EVO 2027             | `pi.cz.evo-2027`                                                                             | Acoperire obligatorie; păstrează `designSystem: current`, `release-future-evo-2027` și baseline-ul de referință                                                          |
| Kids baseline           | RO, HU, SK                                                                                   | Intră în inventar; aplicabilitatea AE și versiunea de SDK trebuie confirmate. Nu este marcat compatibil și nici eliminat tacit din acoperirea baseline                   |
| Alte experiențe         | PI Italy Mobile First; CZ coapping și robo; RS future-gain                                   | Se inventariază reutilizările și impactul. Extinderea contractului AE asupra acestor produse/experiențe este o decizie explicită de profil, nu o concluzie din APK-ul RO |
| Alte contexte de produs | De exemplu SME dacă apare în registrul de ecrane sau în navigare fără manifest de experiență | Devine rând explicit „context de clarificat”; absența din lista de manifeste nu justifică o conversie sau o excludere automată                                           |

Fiecare element de inventar are: experiență, produs, țară, design system, release, rută stabilă, parametri/subvedere, stare/scenariu, sursa rendererului, feature owner, tipuri AE candidate, dovezi, dependențe native, blocaje și statut distinct pe platformă. Nu se publică un procent de migrare până nu există acest numitor.

## Structura propusă

1. **Registru de contracte și profiluri țintă.** Fiecare proprietate și comportament are proveniență și nivel de verificare. Profilul din APK RO are identitatea build-ului observat; versiunea SDK rămâne necunoscută până la confirmare. Profilurile CZ și iOS nu moștenesc automat suportul RO.
2. **Definiții AE serializabile.** Separăm definiția unui ecran de funcțiile React și de starea hostului. Contractele verificate se păstrează exact: spații de nume, `key`, `tag`, tipuri, ordine relevantă, null/absent și colecții. Tipurile necunoscute rămân explicit nesuportate.
3. **Renderere de demo.** Adapterele React Native și preview-ul web existent consumă aceeași definiție verificată. Contractele vizuale existente se reutilizează unde corespund; diferențele de comportament se testează. Nu se importă React Native în intrările de metadata pure.
4. **Stare și acțiuni.** Legarea key/value, acțiunile și logica de vizibilitate/activare/validare se implementează numai pentru semantica verificată. Politicile de business rămân în features. Experiențele selectează compoziție și parametri.
5. **Scenarii și export.** Fixtures deterministe și un export de inspecție pot exista local. Exportul oficial al băncii este un adapter separat, implementat numai după confirmarea formatului de predare.

Numele modulelor și API-urilor din plan sunt propuneri pentru codul nostru. Nu sunt prezentate ca API-uri oferite de ASEE.

## Niveluri de verificare

| Nivel             | Dovada necesară                                                                                           | Ce permite                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Catalogat         | Locator și hash al artefactului                                                                           | Investigare și discuție                                 |
| Contract revizuit | Cititor, model, strămoși, valori implicite și ramuri relevante revizuite; întrebările rămase înregistrate | Implementarea subsetului cunoscut                       |
| Demo verificat    | Teste unitare/comportamentale și regresii vizuale pentru rendererul nostru                                | Utilizare în demo cu etichetă de profil și limite       |
| Payload verificat | Fixtures de referință și validare în instrumentul/schema convenite cu developerii                         | Predare pentru integrare pe profilul respectiv          |
| Android acceptat  | Pachet încărcat în runtime-ul Android țintă și scenarii executate                                         | Acceptare Android pe versiunea respectivă               |
| iOS acceptat      | Același lucru în runtime-ul iOS țintă                                                                     | Acceptare iOS pe versiunea respectivă                   |
| Handoff acceptat  | Format, extensii, assets, instrucțiuni și responsabilități acceptate de echipa destinatară                | Eticheta de livrabil integrabil pentru contextul testat |

Acestea sunt dimensiuni de evidență. Un test web nu completează implicit Android sau iOS, iar statutul unui control nu completează automat ecranul care îl compune.

## Ce putem implementa înainte de răspunsurile externe

- Registrul de dovezi și inventarul complet al acoperirii.
- Revizuirea manuală a unui subset de modele/cititoare; schema incompletă este raportată ca atare.
- Validatoare și serializatoare pentru proprietățile și ramurile complet verificate ale acelui subset.
- Adaptere de demo pentru elementele mapate, păstrând comportamentul existent și afișând un diagnostic pentru incompatibilități.
- Fixtures sintetice etichetate, servicii mock și un pachet de inspecție cu rapoarte de acoperire.
- Teste de caracterizare pentru comportamentul existent și teste de regresie pentru schimbările introduse.

Nu se implementează un operator de logică, un enum, un default, un format numeric sau o conversie de proprietăți după nume ori după intuiție. Dacă dovada lipsește, acel traseu rămâne „de verificat” și nu primește un rezultat de compatibilitate reușit.

## Confirmări de la developeri

| ID  | Întrebare și livrabil cerut                                                                                                         | Ce deblochează                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| D01 | Lista produselor/țărilor/release-urilor țintă, versiuni AE SDK Android/iOS și identificarea build-ului RO analizat                  | Profiluri reale; decizia pentru Kids/Italy/alte contexte; propagarea între țări                       |
| D02 | Schema/IDL sau documentația AE pentru tipuri, proprietăți, null/absent, ordine, defaults și suport per platformă                    | Tipizare completă și validarea serializerului                                                         |
| D03 | Un request/response anonimizat și acceptat pentru un formular, o validare eșuată, o acțiune și o tranziție, cu versiune/proveniență | Fixtures de referință pentru fluxul pilot                                                             |
| D04 | Formatul exact de autorare, import și publicare; exemplu de pachet acceptat și comanda/instrumentul de validare                     | Adapterul final de export; nu doar exportul de inspecție                                              |
| D05 | Contractul pentru elemente noi: implementări Android/iOS, înregistrare, versionare, distribuție și fallback                         | Elemente EVO care nu pot fi compuse cu tipurile existente                                             |
| D06 | Semantica evaluatorului de logică și binding: coerciții, date/numere, lipsă/null, ordine, asincronism, focus și acțiuni             | Interpreter complet și comportament determinist compatibil                                            |
| D07 | Runtime sau harness de test și un responsabil tehnic pentru acceptarea Android și iOS                                               | Dovadă de execuție și acceptare                                                                       |
| D08 | Convenții de assets, tokens, fonturi, traduceri, accesibilitate și diferențe pe platformă                                           | Paritate vizuală și de interacțiune                                                                   |
| D09 | Frontiera dintre UI, servicii, politici de business și funcții native precum semnare/biometrie/scanare                              | Adaptere de integrare și ownership; demo-ul folosește fixtures, nu reproduce automat serviciile reale |

Nu sunt solicitate parole, chei, date de clienți sau acces de producție. Mesajele protejate observate în cod nu vor fi înlocuite cu o implementare presupusă de autentificare.

## Condiții de acceptare

- Toate rândurile inventarului baseline/EVO au proprietar și statut explicit; orice context de clarificat apare în raport.
- Fiecare definiție migrată conduce atât demo-ul, cât și exportul pentru profilul țintă; nu există o a doua definiție întreținută manual doar pentru handoff.
- Lipsurile de suport, câmpurile necunoscute și scenariile blocate sunt vizibile și împiedică eticheta „compatibil”. Nu se substituie tacit alt control.
- Flow IDs, screen kinds, ordinea scenariilor și exporturile existente sunt păstrate. Normal DOM, stiluri, etichete, date și navigare sunt caracterizate înainte de migrare și verificate după.
- Fiecare pilot sau val de migrare are teste relevante, review și posibilitate de revenire la rendererul existent fără modificarea identităților.
- Integrarea finală trece `npm run audit:modules` și `npm run verify` pe starea comună, după terminarea editorilor; pragurile și TypeScript strict nu sunt relaxate.
- Numele „pachet Adaptive Elements integrabil” se folosește numai pentru profilurile și platformele cu acceptare documentată.

## Limitele acestei planificări

Nu există încă un inventar ecran-cu-ecran complet, o schemă oficială AE sau o acceptare în aplicația băncii. Ordinea și verificările sunt stabilite în plan; efortul total și data finală se estimează după inventar și răspunsurile D01–D09. Nu se presupune că toate ecranele baseline/EVO pot fi exprimate prin tipurile din acest singur APK.
