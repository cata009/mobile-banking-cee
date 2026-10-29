# Plan propus — acces View / Edit / Admin pentru specificațiile Flows

Data: 25 octombrie 2026. Bază inspectată: `cata009/mobile-banking-cee`, commit `3cec8b3`.

**Notă de implementare:** propunerea de mai jos a fost aprobată ulterior de utilizator. Starea lucrării este urmărită în `../plans/2026-10-25-flow-spec-rights.md`; formulările inițiale despre livrarea exclusivă a planului sunt păstrate ca istoric. Locația editorului local rămâne o dependență deschisă.

Acest document este un plan, nu o implementare. Nu se modifică sau publică aplicația pe Vercel. Editorul Confluence-like există pe discul proprietarului și nu se află în versiunea Git inspectată; integrarea trebuie făcută pe acea versiune locală, după identificarea ei.

## 1. Comportamentul dorit

- Linkul și parola comună actuală continuă să ofere acces de citire.
- Utilizatorii desemnați primesc conturi individuale: nume de utilizator și parolă proprie. Autentificarea îi identifică, iar rolul salvat pe server le stabilește drepturile.
- Proprietarul primește contul nominal `admin` ca rol; numele efectiv al contului poate fi ales separat.
- Editorii pot modifica numai textele/documentele din zona Specs a Flows. Nu primesc drepturi de administrare sau de schimbare a prototipurilor, componentelor, navigării ori codului.
- Se reutilizează editorul local existent. Nu se construiește un al doilea editor.

| Acțiune | Acces prin parola comună / View | Edit | Admin |
| --- | --- | --- | --- |
| Citește specificația curentă și folosește exporturile existente | Da | Da | Da |
| Editează și salvează texte în Specs | Nu | Da | Da |
| Consultă istoricul modificărilor | Nu în prima versiune | Da | Da |
| Restaurează o versiune anterioară | Nu | Nu în prima versiune | Da |
| Creează/dezactivează conturi, schimbă roluri, resetează parole | Nu | Nu | Da |
| Modifică designul, prototipul sau codul | Nu | Nu | Nu prin acest sistem |

Propunerea inițială este ca rolul Edit să se aplice tuturor specificațiilor Flows. Permisiuni separate pe flow se pot adăuga ulterior, dacă apare nevoia. Admin include drepturile de Edit și View.

## 2. Autentificare fără schimbarea obiceiului cititorilor

Ecranul de acces păstrează opțiunea actuală cu parola comună și adaugă «Cont personal», cu nume de utilizator și parolă. Și un cititor deja intrat poate alege «Autentificare pentru editare».

Administratorul creează contul și alege rolul. Pentru prima versiune, poate comunica individual o parolă temporară, afișată o singură dată și schimbată obligatoriu la prima autentificare. Nu este necesar un serviciu de email sau Microsoft SSO pentru acest flux. Conturile nu se pot crea prin înregistrare publică. Conturi nominale cu rol View sunt de asemenea permise.

Parolele sunt gestionate de o bibliotecă de autentificare consacrată, cu suport pentru username/password; recomandare tehnică: Better Auth, cu verificarea adaptorului și a pluginului necesar la implementare. Nu implementăm manual hashing-ul sau tokenurile. Conturile au ID intern stabil, independent de numele afișat. Sesiunile sunt verificate pe server, cu cookie HttpOnly, expirare și revocare.

Rolul nu se deduce din textul parolei, dintr-o valoare din browser sau din clientul bancar simulat. Parola comună, linkurile de share și cookie-urile mobile nu devin sesiuni Edit/Admin. Drepturile și starea contului se verifică la fiecare cerere protejată. Schimbarea rolului, dezactivarea sau resetarea parolei trebuie să poată opri sesiunile existente. Resetarea revocă sesiunile personale vechi.

Adminul inițial se creează printr-o comandă locală de bootstrap, fără parole în repository. Conturile de test rămân separate. Se împiedică eliminarea/dezactivarea ultimului administrator activ. La logout din contul personal se închide sesiunea nominală; o sesiune de citire comună încă validă poate rămâne activă, iar interfața arată explicit «View».

## 3. Salvarea textelor

Astăzi, cele șapte flow-uri și specificațiile lor sunt importate din fișiere TypeScript. Pentru ca modificările să fie comune tuturor utilizatorilor și să supraviețuiască restartului, adăugăm un API și o bază de date.

Recomandare: păstrăm React/Vite, adăugăm un API TypeScript separat logic și PostgreSQL local pentru dezvoltare. Nu se creează servicii cloud și nu se folosește baza/administrarea OTA. Un runner API local și un proxy Vite sunt necesare: `npm run dev` actual pornește numai Vite.

Modelul minim include conturile/sesiunile bibliotecii de autentificare, rolurile și starea conturilor, documente Specs, versiuni imuabile și jurnalul acțiunilor. Fiecare versiune reține flowId, ID-ul versiunii de bază, autorul din sesiune, data serverului, versiunea schemei și conținutul documentului. Documentul indică versiunea curentă. Schema documentului va folosi formatul editorului local dacă acesta poate fi validat și exportat sigur; nu se decide acum între HTML, Markdown sau JSON de blocuri fără inspectarea sa.

Recomandare de comportament pentru MVP: «Salvează» produce o versiune curentă vizibilă cititorilor, fără aprobare obligatorie de la Admin. Istoricul permite verificarea și restaurarea. Aceasta este o alegere propusă, nu o cerință deja confirmată. Editarea în curs rămâne locală până la salvare; se afișează starea modificărilor și avertizare la părăsirea paginii. Un circuit draft → aprobare poate fi adăugat separat dacă este dorit.

O salvare verifică permisiunea, schema și versiunea de bază, apoi scrie atomic versiunea, pointerul curent și auditul. Două editări pornite de la aceeași versiune nu se suprascriu: a doua primește conflict, păstrând textul introdus și oferind comparație cu versiunea nouă. Restaurarea creează o versiune nouă; istoricul nu este șters. Erorile de rețea nu afișează fals «Salvat».

## 4. Integrarea cu Specs și exporturile

Prima etapă începe cu localizarea editorului Confluence-like de pe disc și inventarierea modificărilor locale. Acea versiune devine baza integrării. Nu se suprascrie cu varianta mai veche din Git.

Editorul primește un contract mic: documentul curent, revisionId, canEdit, starea salvării și funcția save(document, expectedRevision). Vizualizarea și exporturile primesc același document rezolvat. UI-ul ascunde acțiunile nepermise; API-ul impune efectiv restricțiile chiar și la cereri trimise manual.

Conținutul editorial este separat de definițiile tehnice ale flow-urilor. Rămân stabile flowId, screen kinds, ID-urile regulilor și pașilor, ordinea scenariilor, prototipul, previewParameters și implementarea. Se pot edita textele regulilor ca specificație; aceasta nu modifică logica demonstrată și nu marchează automat cerința drept implementată.

Migrarea importă documentele existente o singură dată, cu verificare de echivalență. Nu rescrie modificările utilizatorilor la următorul build/restart. Câmpurile editabile sunt validate explicit pe server; întregul FlowDefinition nu devine editabil arbitrar.

PDF, Word și exportul Confluence trebuie să reflecte exact versiunea Specs afișată și să includă identificatorul ei. ZIP-ul păstrează sursele tehnice existente și adaugă documentul curent plus proveniența: versiune conținut, commit de bază și identificatorul/hash-ul snapshotului efectiv de surse. În dezvoltarea locală, snapshotul include și modificările necomise ale editorului; commitul singur nu identifică fidel acele surse. Nu prezintă definiția statică veche ca text editorial actual. Textul din editor este validat pentru afișare și pentru export, inclusiv legături și inserarea în fișiere de cod generate. Se reutilizează formatarea existentă; upload-uri noi și colaborare simultană ca în Google Docs nu fac parte din prima versiune.

Accesul comun existent validează citirea documentului curent prin API. Istoricul, conturile și drepturile sunt livrate numai după verificarea rolului personal. Nu se includ în bundle-ul public. Sistemul de conturi al editorilor nu promite retroactiv confidențialitate pentru sursele/demo-urile deja distribuite static.

## 5. Etape și livrabile

1. **Integrarea versiunii locale:** identificarea editorului de pe disc, inventar, contractul documentului și delimitarea exactă a textelor editabile. Livrabil: hartă de integrare și exemplu de document păstrat identic.
2. **Conturi și drepturi:** API local, PostgreSQL, login personal, bootstrap Admin, creare conturi și schimbarea rolurilor. Livrabil: două browsere/sesiuni distincte, unul View și altul Edit; numai Admin gestionează conturile.
3. **Documente și versiuni:** API de citire/salvare, migrare inițială, jurnal și protecție la suprascriere. Livrabil: conținutul salvat rămâne după restart și devine vizibil cititorului.
4. **Conectarea editorului existent:** mod View/Edit, salvare, modificări nesalvate, istoric, restaurare Admin și conflicte. Livrabil: parcurs complet pe un flow pilot, apoi extindere la restul.
5. **Exporturi și regresii:** documentul curent în PDF/Word/Confluence/ZIP, teste de autorizare și validare, apoi verificarea combinată a proiectului. Livrabil: raport local cu rezultate și limite.

Module noi probabile: `server/auth`, `server/flows`, `server/users`, migrări DB, `src/features/flow-library/specifications` și pagina Admin. Puncte existente de integrare: AccessGate, `FlowLibraryScreen.tsx`, `FlowDetail.tsx` și exporturile. Lista finală de fișiere se stabilește după inspectarea editorului local, nu se fixează pe vechiul UI din Git.

## 6. Probe de acceptare

- Parola comună și contul View pot citi, dar orice salvare directă la API este respinsă.
- Contul Edit salvează Specs sub identitatea sa și nu poate schimba roluri, utilizatori sau câmpuri tehnice.
- Admin creează un editor, îi retrage drepturile și îi resetează parola; vechea sesiune nu mai poate scrie.
- Parolele nu apar în baza de date ca text, răspunsuri obișnuite sau loguri. Încercările de login sunt limitate; cookie-urile, expirarea și cererile cross-origin sunt testate.
- Rolul și autorul falsificate în payload sunt ignorate/respinse; identitatea și permisiunile vin exclusiv din sesiunea serverului.
- Două sesiuni Edit produc un conflict recuperabil, fără pierderea textului introdus.
- Salvarea și restaurarea au istoric corect; conținutul supraviețuiește restartului API-ului și nu este înlocuit de migrare.
- Erorile de rețea/bază de date păstrează textul nesalvat și indică eșecul.
- Exporturile conțin aceeași versiune ca Specs; prototipurile și navigarea rămân funcționale.
- Teste unitare/integrate, verificări în browser cu roluri distincte și `npm run verify` pe starea finală.

## 7. Limita acestei lucrări

Acum livrăm numai planul. Implementarea ulterioară se dezvoltă și se verifică local, pe baza codului local al utilizatorului. Nici push, PR, merge, creare de resurse cloud, schimbare de variabile Vercel sau deployment nu sunt incluse: un push ar putea porni automat un preview Vercel.

Decizii rămase înaintea implementării: locația editorului local; numele contului Admin; confirmarea comportamentului propus «Salvează = versiune vizibilă». Nu este necesară alegerea unui serviciu cloud pentru a construi și testa local acest sistem.

## 8. Cum va funcționa ulterior pe linkul Vercel

Aceasta este arhitectura propusă pentru o eventuală activare ulterioară, nu o autorizare de publicare acum:

`Browser → site și API pe Vercel → PostgreSQL administrat`

- Vercel servește interfața și execută API-ul pentru login, verificarea rolurilor, citire și salvare. Backend-ul există, dar rulează în Functions; nu necesită un VPS administrat manual.
- O bază PostgreSQL administrată, de exemplu Neon sau Supabase folosit pentru PostgreSQL, păstrează conturile, sesiunile, rolurile, specificațiile și istoricul. Poate fi conectată proiectului Vercel; rămâne un serviciu persistent distinct de procesul API. Alegem un singur furnizor la activare, cu conexiuni/pool compatibile serverless și regiune apropiată de API.
- API-ul validează sesiunea și rolul, salvează tranzacțional și confirmă succesul numai după commitul bazei de date. Nici browserul, nici discul temporar al unei funcții nu sunt stocarea canonică.
- Un cititor obține versiunea curentă prin API. După salvare, aceasta este disponibilă la următoarea încărcare/refetch. Un tab deja deschis poate verifica periodic revizia și arăta «Există o versiune nouă»; sincronizarea caracter cu caracter nu este necesară. Cache-ul trebuie invalidat/revalidat astfel încât să nu ascundă actualizările.
- Salvarea unui text nu necesită Git, rebuild sau deployment după ce această funcționalitate a fost instalată. Un deployment de cod și configurarea bazei vor fi necesare o singură dată la activarea inițială; ele nu fac parte din lucrul autorizat acum. Modificările ulterioare ale aplicației pot necesita alte deployment-uri.
- Datele supraviețuiesc restartului funcțiilor, browserului și redeploy-ului. Migratele ulterioare trebuie să păstreze conținutul existent. Backup-urile automate, retenția și proba de restaurare se configurează la furnizorul bazei; istoricul documentelor nu înlocuiește backup-ul.
- «Disponibile tot timpul» înseamnă acces online persistent, independent de calculatorul proprietarului. Disponibilitatea serviciilor nu poate fi garantată absolut; se alege un plan potrivit utilizării, fără pauze de inactivitate nedorite, și se monitorizează erorile. Dacă salvarea eșuează, editorul păstrează textul și permite reîncercarea.
- Pentru textele Specs nu este necesar un serviciu separat de fișiere. Dacă ulterior sunt permise atașamente, acestea primesc stocare de obiecte și aceleași reguli de acces.

Dezvoltarea și demonstrarea funcționalității rămân locale acum: API local, bază locală, conturi de test, fără dependență de calculatorul proprietarului pentru arhitectura online viitoare și fără intervenție asupra site-ului publicat.
