import type { FlowDefinition, FlowPrototypeNode, FlowScenario, FlowScreenKind, FlowScreenSpec } from './types'
import { RS_PROPERTY_INSURANCE_FLOW } from './rsPropertyInsurance'

const products = 'genius-my-car-products' as const
const menu = 'genius-my-car-insurance-sheet' as const
const intro = 'genius-my-car-car-cover' as const
const vehicles = 'genius-my-car-vehicles' as const
const attention = 'genius-my-car-vehicles-attention' as const
const uninsured = 'genius-my-car-vehicles-uninsured' as const
const owner = 'genius-my-car-owner' as const
const details = 'genius-my-car-vehicle-details' as const
const period = 'genius-my-car-period' as const
const offer = 'genius-my-car-offer' as const
const terms = 'genius-my-car-terms' as const
const payment = 'genius-my-car-payment' as const
const success = 'genius-my-car-success' as const
const addOwner = 'genius-my-car-add-owner' as const
const addDetails = 'genius-my-car-add-vehicle-details' as const
const cascoScreen = (screen: FlowScreenKind) =>
  screen.replace('genius-my-car-', 'genius-my-car-casco-') as FlowScreenKind

const purchaseScreens: FlowScreenKind[] = [owner, details, period, offer, terms, payment, success]
const screenSpecs: Partial<Record<FlowScreenKind, FlowScreenSpec>> = {
  [products]: {
    title: 'Produse',
    purpose: 'Intrarea din meniul existent de produse.',
    actions: [{ label: 'Insurance', result: 'Deschide meniul de asigurări.' }],
  },
  [menu]: {
    title: 'Insurance',
    purpose: 'Păstrează toate opțiunile meniului furnizat.',
    states: [
      'GENIUS PROTECT',
      'HOUSE INSURANCE',
      'TRAVEL INSURANCE (MY TRAVEL)',
      'CAR INSURANCE (MY CAR)',
      'UMBRELLA',
      'START INVEST',
    ],
    actions: [{ label: 'CAR INSURANCE (MY CAR)', result: 'Deschide Genius My Car.' }],
    acceptance: [
      'Cele șase opțiuni păstrează aspectul normal și ordinea din referință.',
      'Intrarea CAR INSURANCE (MY CAR) este conectată la parcurs.',
    ],
  },
  [intro]: {
    title: 'Asigurări auto',
    purpose: 'Prezintă RCA și CASCO, cu imaginea auto dedicată și beneficii în aplicație.',
    actions: [{ label: 'Alege mașina ta', result: 'Deschide mașinile salvate.' }],
    back: 'Meniul de asigurări.',
  },
  [vehicles]: {
    title: 'Mașinile mele',
    purpose: 'Arată mașinile salvate și statusul individual RCA și CASCO.',
    states: [
      'Kodiaq: RCA activă, CASCO absentă',
      'Duster: RCA expirată, CASCO expiră în 17 zile',
      'Octavia: fără RCA și CASCO',
    ],
    fields: [
      { name: 'Logo marcă', type: 'Imagine în stânga, model dedesubt' },
      { name: 'Număr înmatriculare', type: 'Identificator în dreapta' },
      { name: 'RCA / CASCO', type: 'Status și expirare' },
    ],
    actions: [
      { label: 'Ofertă RCA', result: 'Pornește oferta RCA pentru mașina afișată.' },
      { label: 'Ofertă CASCO', result: 'Pornește oferta CASCO pentru mașina afișată.' },
      { label: 'Adaugă o mașină', result: 'Proprietar → mașină → perioadă → ofertă.' },
    ],
    edgeCases: [
      'Data demonstrativă: 1 octombrie 2026.',
      'Expirată: roșu; maximum 30 de zile rămase: portocaliu.',
      'Cumpărarea unei polițe păstrează statusul celeilalte asigurări.',
    ],
    acceptance: [
      'Trei mașini inițiale.',
      'Mașina și asigurarea selectate se păstrează între pași.',
      'Mașinile adăugate rămân în sesiunea prototipului.',
    ],
  },
  [owner]: {
    title: 'Proprietar și șofer',
    purpose: 'Profil bancar nemodificabil și declarații specifice asigurării.',
    defaultState: 'Client persoană fizică. Date personale sintetice, precompletate și nemodificabile.',
    fields: [
      { name: 'Contract de leasing', type: 'Da / Nu', required: true },
      ...[
        'Nume',
        'Prenume',
        'CNP',
        'An obținere permis',
        'Act de identitate',
        'Serie / număr act',
        'Județ',
        'Localitate',
        'Cod poștal',
        'Stradă',
        'Număr',
        'Bloc',
        'Scară',
        'Etaj',
        'Apartament',
      ].map((name) => ({
        name,
        type: 'Date bancare afișate, fără editare',
        notes: 'Identificatorii personali sunt mascați.',
      })),
      { name: 'Drept de proprietate / utilizare', type: 'Declarație', required: true },
      { name: 'Proprietar = conducător', type: 'Da / Nu', required: true },
      { name: 'Conducător suplimentar', type: 'Nume, CNP, an permis', validation: 'CNP: 13 cifre; an permis valid.' },
      { name: 'Renunțare la consultanță', type: 'Declarație distinctă', required: true },
    ],
    actions: [
      { label: 'Continuă cu datele mașinii', result: 'Validează declarațiile și eventualul șofer suplimentar.' },
    ],
    acceptance: [
      'Datele clientului băncii nu au inputuri editabile.',
      'Declarațiile nu sunt bifate implicit.',
      'Alt șofer se completează separat de profilul bancar.',
    ],
  },
  [details]: {
    title: 'Datele mașinii',
    purpose: 'Datele esențiale din talon pentru calculul ofertei.',
    fields: [
      { name: 'Pentru înmatriculare', type: 'Da / Nu', required: true },
      ...[
        'Număr înmatriculare',
        'Serie șasiu',
        'Tip auto',
        'Marcă',
        'Model',
        'An producție',
        'Combustibil',
        'Masă maximă',
        'Cilindree',
        'Putere kW',
        'Număr locuri',
        'Serie CIV',
      ].map((name) => ({ name, type: 'Date autovehicul', required: true })),
    ],
    actions: [{ label: 'Alege începutul poliței', result: 'Validează, salvează mașina și deschide perioada.' }],
    edgeCases: [
      'Numărul poate lipsi dacă mașina urmează să fie înmatriculată.',
      'VIN: 17 caractere fără I, O sau Q; an de producție până la 2026.',
      'Nu se poate adăuga de două ori același număr de înmatriculare.',
      'Pentru o mașină electrică, cilindreea poate lipsi sau poate fi zero. Parcursul demonstrativ acceptă maximum 9 locuri.',
      'Datele auto salvate sunt precompletate și pot fi corectate; profilul bancar nu poate fi modificat.',
    ],
    acceptance: [
      'Toate câmpurile auto esențiale din referință sunt incluse.',
      'Erorile sunt afișate la câmp.',
      'Înapoi păstrează datele.',
    ],
  },
  [period]: {
    title: 'Începutul asigurării',
    purpose: 'Data de început și durata poliței pentru mașina curentă.',
    fields: [
      { name: 'Data de început', type: 'Calendar nativ', required: true },
      { name: 'Durată', type: 'RCA: 6 / 12 luni; CASCO: 12 luni în prototip', required: true },
    ],
    actions: [{ label: 'Vezi oferta', result: 'Validează data și deschide Allianz.' }],
    edgeCases: ['Începutul nu poate fi în trecut.', 'Noua poliță de același tip începe după expirarea celei active.'],
  },
  [offer]: {
    title: 'Oferta Allianz',
    purpose: 'O singură ofertă Allianz pentru mașina și asigurarea selectate.',
    fields: [
      { name: 'Allianz', type: 'Unicul asigurător' },
      { name: 'Preț total', type: 'RON, demonstrativ' },
      { name: 'Decontare directă RCA', type: 'Fără / Cu' },
      { name: 'Documente', type: 'Panou de detalii' },
    ],
    actions: [
      { label: 'Fără / Cu decontare directă', result: 'Schimbă opțiunea și prețul demonstrativ RCA.' },
      { label: 'Detalii și documente', result: 'Deschide panoul ofertei.' },
      { label: 'Continuă cu această ofertă', result: 'Deschide termenii.' },
    ],
    acceptance: [
      'Un singur asigurător, fără listă de oferte.',
      'Ambele opțiuni de decontare directă sunt prezente pentru RCA.',
      'Decontarea directă RCA nu este prezentată la CASCO.',
      'Prețul este marcat demonstrativ.',
    ],
  },
  [terms]: {
    title: 'Termeni și condiții',
    purpose: 'Consultarea documentelor și acordul explicit cu oferta.',
    fields: [
      { name: 'Acceptare documente', type: 'Bifă explicită', required: true },
      { name: 'Date personale', type: 'Informare' },
    ],
    actions: [
      { label: 'Termenii și documentele asigurării', result: 'Deschide panoul de documente.' },
      { label: 'Verifică și plătește', result: 'Continuă după acceptare.' },
    ],
    edgeCases: [
      'Textele eMAG / Safety Broker nu sunt atribuite UniCredit sau Allianz. Documentele finale rămân de furnizat.',
      'Modificarea mașinii, produsului, perioadei, decontării directe sau conducătorului anulează acordul anterior și impune o nouă acceptare.',
    ],
  },
  [payment]: {
    title: 'Verifică și plătește',
    purpose: 'Rezumatul ofertei și contul RON de plată.',
    fields: [
      { name: 'Cont', type: 'Cont RON UniCredit' },
      { name: 'Rezumat', type: 'Mașină, produs, dată, durată, opțiune, proprietar, șofer și total' },
    ],
    actions: [{ label: 'Confirmă plata', result: 'Simulează cumpărarea și actualizează polița în sesiune.' }],
    acceptance: ['Fără debitare sau emitere reală.', 'Mașina și tipul poliței rămân cele selectate.'],
  },
  [success]: {
    title: 'Asigurarea ta',
    purpose: 'Confirmare demonstrativă.',
    actions: [{ label: 'Înapoi la mașinile mele', result: 'Arată mașina asigurată și noul status.' }],
  },
}
screenSpecs[attention] = {
  ...screenSpecs[vehicles]!,
  title: 'Expirată / expiră curând',
  defaultState: 'Duster: RCA expirată la 14 septembrie; CASCO expiră în 17 zile.',
}
screenSpecs[uninsured] = {
  ...screenSpecs[vehicles]!,
  title: 'Fără RCA și CASCO',
  defaultState: 'Octavia nu are nicio poliță; ambele oferte pot fi pornite.',
}
screenSpecs[addOwner] = {
  ...screenSpecs[owner]!,
  title: 'Adaugă o mașină · proprietar',
  defaultState: 'Mașină nouă. Alege RCA sau CASCO; profilul bancar rămâne nemodificabil.',
  fields: [{ name: 'Tip asigurare', type: 'RCA / CASCO', required: true }, ...(screenSpecs[owner]!.fields ?? [])],
}
screenSpecs[addDetails] = {
  ...screenSpecs[details]!,
  title: 'Adaugă o mașină · talon',
  defaultState: 'Număr, VIN, model și CIV de completat.',
}
for (const screen of purchaseScreens) {
  screenSpecs[cascoScreen(screen)] = {
    ...screenSpecs[screen]!,
    title: `${screenSpecs[screen]!.title} · CASCO`,
    defaultState: 'CASCO selectat pentru mașina curentă. Fără opțiune RCA de decontare directă.',
  }
}
screenSpecs[cascoScreen(period)] = {
  ...screenSpecs[cascoScreen(period)]!,
  fields: [
    { name: 'Data de început', type: 'Calendar nativ', required: true },
    { name: 'Durată', type: '12 luni în prototip', required: true },
  ],
  actions: [{ label: 'Vezi oferta CASCO', result: 'Validează data și deschide oferta CASCO Allianz.' }],
}
screenSpecs[cascoScreen(offer)] = {
  ...screenSpecs[cascoScreen(offer)]!,
  fields: (screenSpecs[offer]!.fields ?? []).filter((field) => field.name !== 'Decontare directă RCA'),
  actions: (screenSpecs[offer]!.actions ?? []).filter((action) => action.label !== 'Fără / Cu decontare directă'),
  acceptance: [
    'Se afișează o singură ofertă Allianz CASCO pentru 12 luni.',
    'Nu se afișează opțiuni de decontare directă RCA.',
    'Prețul și documentele sunt demonstrative; condițiile CASCO finale rămân de furnizat.',
  ],
}

const nodes: Partial<Record<FlowScreenKind, FlowPrototypeNode>> = {
  [products]: { primary: { label: 'Insurance', to: menu } },
  [menu]: {
    primary: { label: 'CAR INSURANCE (MY CAR)', to: intro },
    secondary: { label: 'Închide meniul', to: products },
    back: products,
  },
  [intro]: { primary: { label: 'Alege mașina ta', to: vehicles }, back: menu },
  [vehicles]: { primary: { label: 'Începe o ofertă', to: owner }, back: intro },
  [attention]: { primary: { label: 'Începe o ofertă', to: owner }, back: vehicles },
  [uninsured]: { primary: { label: 'Începe o ofertă', to: owner }, back: vehicles },
  [owner]: { primary: { label: 'Continuă cu datele mașinii', to: details }, back: vehicles },
  [details]: { primary: { label: 'Alege începutul poliței', to: period }, back: owner },
  [period]: { primary: { label: 'Vezi oferta', to: offer }, back: details },
  [offer]: { primary: { label: 'Continuă cu această ofertă', to: terms }, back: period },
  [terms]: { primary: { label: 'Verifică și plătește', to: payment }, back: offer },
  [payment]: { primary: { label: 'Confirmă plata demonstrativă', to: success }, back: terms },
  [success]: { primary: { label: 'Înapoi la mașinile mele', to: vehicles }, back: vehicles },
  [addOwner]: { primary: { label: 'Continuă cu datele mașinii', to: addDetails }, back: vehicles },
  [addDetails]: { primary: { label: 'Alege începutul poliței', to: period }, back: addOwner },
}
for (const screen of purchaseScreens) {
  const node = nodes[screen]!
  nodes[cascoScreen(screen)] = {
    primary: node.primary
      ? {
          ...node.primary,
          to: purchaseScreens.includes(node.primary.to) ? cascoScreen(node.primary.to) : node.primary.to,
        }
      : undefined,
    back: node.back ? (purchaseScreens.includes(node.back) ? cascoScreen(node.back) : node.back) : undefined,
  }
}
const step = (screen: FlowScreenKind, description: string) => ({
  id: screen,
  screen,
  title: screenSpecs[screen]?.title ?? '',
  description,
})
const purchaseSteps = [
  step(owner, 'Profil bancar nemodificabil, declarații și conducător auto.'),
  step(details, 'Date din talon și salvarea mașinii.'),
  step(period, 'Începutul și durata poliței.'),
  step(offer, 'O ofertă Allianz; cu / fără decontare directă pentru RCA.'),
  step(terms, 'Consultă documentele și confirmă acordul.'),
  step(payment, 'Verifică rezumatul și simulează plata.'),
  step(success, 'Revino la mașini cu statusul poliței actualizat.'),
]
const scenarios: FlowScenario[] = [
  {
    id: 'buy-and-pay',
    label: 'Cumpără RCA sau CASCO',
    kind: 'happy',
    description: 'Meniul existent, mașinile salvate și oferta Allianz.',
    steps: [
      step(products, 'Deschide Insurance.'),
      step(menu, 'Alege CAR INSURANCE (MY CAR).'),
      step(intro, 'Descoperă RCA și CASCO.'),
      step(vehicles, 'Alege mașina și tipul de asigurare.'),
      ...purchaseSteps,
    ],
  },
  {
    id: 'vehicle-policy-attention',
    label: 'Expirată / expiră curând',
    kind: 'alternate',
    description: 'Duster are RCA expirată și CASCO aproape de expirare.',
    steps: [step(attention, 'Alege asigurarea pe care vrei să o reînnoiești.'), ...purchaseSteps],
  },
  {
    id: 'vehicle-no-policies',
    label: 'Fără RCA și CASCO',
    kind: 'alternate',
    description: 'Octavia nu are nicio asigurare. Pornește RCA sau CASCO separat.',
    steps: [step(uninsured, 'Ambele asigurări lipsesc.'), ...purchaseSteps],
  },
  {
    id: 'add-car',
    label: 'Adaugă o mașină',
    kind: 'alternate',
    description: 'Înregistrează o mașină nouă și continuă cu oferta RCA sau CASCO.',
    steps: [
      step(vehicles, 'Selectează Adaugă o mașină.'),
      step(addOwner, 'Alege asigurarea și confirmă datele proprietarului.'),
      step(addDetails, 'Introdu datele din talon.'),
      ...purchaseSteps.slice(2),
    ],
  },
  {
    id: 'casco-purchase',
    label: 'Cumpără CASCO',
    kind: 'alternate',
    description: 'Parcurs CASCO pentru o mașină fără poliță activă.',
    steps: [
      step(uninsured, 'Selectează Ofertă CASCO.'),
      ...purchaseSteps.map((item) => ({
        ...item,
        id: cascoScreen(item.screen),
        screen: cascoScreen(item.screen),
        title: screenSpecs[cascoScreen(item.screen)]!.title!,
        description: screenSpecs[cascoScreen(item.screen)]!.purpose,
      })),
    ],
  },
]

export const GENIUS_MY_CAR_FLOW: FlowDefinition = {
  id: 'ro-genius-my-car',
  title: 'Genius My Car',
  label: 'Genius My Car',
  summary: 'RCA și CASCO pentru mașinile tale: date precompletate, o ofertă Allianz și plată din aplicație.',
  domain: 'Genius My Car',
  countryScope: ['RO'],
  status: 'in-review',
  figmaFile: 'Referință de structură · Serbia · DBN · Flows',
  figmaNodeId: RS_PROPERTY_INSURANCE_FLOW.figmaNodeId,
  sourceUrl: RS_PROPERTY_INSURANCE_FLOW.sourceUrl,
  defaultScenarioId: 'buy-and-pay',
  specLayout: 'document-and-screens',
  screenSpecs,
  scenarios,
  prototype: {
    start: products,
    groups: [
      { title: 'Intrare MY CAR', screens: [products, menu, intro, vehicles] },
      { title: 'Ofertă și cumpărare RCA', screens: purchaseScreens },
      { title: 'Adaugă o mașină', screens: [addOwner, addDetails] },
      { title: 'CASCO', screens: purchaseScreens.map(cascoScreen) },
      { title: 'Status polițe', screens: [attention, uninsured] },
    ],
    nodes,
  },
  overview: {
    purpose:
      'Clientul UniCredit România își adaugă mașinile și parcurge oferta RCA sau CASCO de la Allianz în aplicația bancară.',
    scopeNote:
      'Prototip în română, inspirat din capturile furnizate. Prețurile, plata și emiterea sunt demonstrative. RS Property Insurance este un flux separat.',
    entryPoints: [
      { label: 'Insurance → CAR INSURANCE (MY CAR)', intent: 'Descoperă produsul și mașinile salvate.' },
      { label: 'Adaugă o mașină', intent: 'Proprietar → autovehicul → perioadă → ofertă.' },
      { label: 'Ofertă RCA / CASCO', intent: 'Oferta pentru mașina selectată.' },
    ],
    preconditions: [
      'Client persoană fizică autentificat.',
      'Profil bancar precompletat, afișat și nemodificabil.',
      'Date din talon disponibile.',
    ],
    businessRules: [
      'Un singur asigurător afișat: Allianz.',
      'RCA: cu sau fără decontare directă. Această opțiune nu se aplică la CASCO.',
      'Profilul clientului nu este editabil; datele auto și alt șofer se completează separat.',
      'Declarațiile și acceptarea documentelor sunt explicite, fără bifare implicită.',
      'Mașina se salvează după validare; polița după confirmarea demonstrativă.',
      'Schimbarea datelor mașinii sau ale ofertei anulează acceptarea anterioară a documentelor.',
    ],
    successDestinations: ['Mașinile mele, cu polița selectată.'],
    analyticsEvents: [],
    openQuestions: [
      'Tarife, acoperiri, franșize și documente Allianz finale.',
      'Referința arată calculul reînnoirii cu maximum 59 de zile înainte de expirare; regula Allianz trebuie confirmată.',
      'Disponibilitatea în profilul băncii a permisului și adresei din talon.',
      'Calcul real, autorizare plată și emitere poliță.',
    ],
    notes: [
      {
        title: 'Referințe',
        body: 'Pașii și câmpurile esențiale provin din capturile utilizatorului. Identitatea juridică eMAG / Safety Broker nu este copiată în documentele Allianz. Datele personale din imagini nu sunt reutilizate.',
      },
    ],
    businessAnalysis: {
      generalInformation: [
        { label: 'Produs', value: 'Genius My Car · România · Mobile PI' },
        { label: 'Partener', value: 'Allianz' },
        { label: 'Public', value: 'Clienți persoane fizice ai băncii' },
        { label: 'Stadiu', value: 'Prototip demonstrativ' },
      ],
      versionContext: 'Adaptare MY CAR pe baza referințelor de adăugare auto și ofertare.',
      versionHistory: [
        {
          version: '0.3',
          date: '2026-10-01',
          detail:
            'Implementare, scenarii și contracte de ecran RCA/CASCO aliniate pentru publicare; context MY CAR stabil la actualizarea codului.',
        },
      ],
      openIssues: [
        {
          reference: 'MYCAR-01',
          status: 'Open',
          title: 'Contract și ofertare Allianz',
          detail: 'Prețuri și documente exemplificative; integrarea reală rămâne de furnizat.',
        },
      ],
      requirements: [
        {
          title: 'Parcurs',
          items: [
            'Patru pași până la ofertă.',
            'Toate câmpurile esențiale din talon.',
            'O singură ofertă Allianz, cu decontare directă RCA opțională.',
            'Profil bancar nemodificabil.',
          ],
        },
      ],
      currentStatus: [
        {
          title: 'Disponibil',
          items: [
            'Trei mașini cu polițe active, expirate, aproape de expirare sau absente.',
            'RCA și CASCO pornesc separat.',
            'Date păstrate în sesiunea prototipului.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Experiență mobilă',
          items: [
            'Formular gradual și buton fix de continuare.',
            'Profilul proprietarului este afișat fără editare.',
            'Documente și rezumat înainte de confirmare.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Claritate',
          items: [
            'Profil sintetic, identificatori mascați.',
            'Validări la câmp și date păstrate la întoarcere.',
            'Fără debitare sau emitere reală.',
          ],
        },
      ],
    },
  },
}
