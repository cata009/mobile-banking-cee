import NavigationAndActionForthT2 from '@/assets/mobile-first/it/investments/services/NavigationAndActionForthT2.svg'
import NavigationAndActionEdit from '@/assets/mobile-first/it/investments/services/NavigationAndActionEdit.svg'
import DeviceAndTechnologyPushNotification from '@/assets/mobile-first/it/investments/services/DeviceAndTechnologyPushNotification.svg'
import imgHeroBannerMobile from '@/assets/mobile-first/it/investments/services/imgHeroBannerMobile.png'
import imgNavigationAndActionDownloadT2 from '@/assets/mobile-first/it/investments/services/imgNavigationAndActionDownloadT2.svg'
import imgMobileTemporaryCardNew from '@/assets/mobile-first/it/investments/services/imgMobileTemporaryCardNew.png'
import imgNavigationAndActionSuccessLargeTkyPage from '@/assets/mobile-first/it/investments/services/imgNavigationAndActionSuccessLargeTkyPage.svg'
import mifidDocument from '@/assets/mobile-first/it/investments/services/mifidDocument.png'
import mifidDeclaration from '@/assets/mobile-first/it/investments/services/mifidDeclaration.png'
import advisoryDocument1 from '@/assets/mobile-first/it/investments/services/advisoryDocument1.png'
import advisoryDocument2 from '@/assets/mobile-first/it/investments/services/advisoryDocument2.png'
import insuranceLine from '@/assets/mobile-first/it/investments/services/insuranceLine.svg'

export const serviceDocuments = { mifidDocument, mifidDeclaration, advisoryDocument1, advisoryDocument2 }
export const insuranceLineIcon = insuranceLine

export const servicesAssets = {
  NavigationAndActionForthT2,
  NavigationAndActionEdit,
  DeviceAndTechnologyPushNotification,
  imgHeroBannerMobile,
  imgNavigationAndActionDownloadT2,
  imgMobileTemporaryCardNew,
  imgNavigationAndActionSuccessLargeTkyPage,
}
export const investmentInterviewQuestions = [
  {
    id: 'q0',
    source: '24262:780644',
    title: 'Fascia delle entrate mensili',
    description: 'In quale delle seguenti fasce ricadono le Sue entrate regolari mensili?',
    options: [
      'Non ho entrate regolari mensili',
      'Fino a 1.000€',
      'Tra i 1.001 e i 2.000€',
      'Tra i 2.001 e i 3.500€',
      'Oltre i 3.500€',
      'Non rispondo',
    ],
    multiple: false,
    group: 'financial',
  },
  {
    id: 'q1',
    source: '24262:780449',
    title: 'Impegni finanziari mensili con terzi',
    description:
      'In quale fascia ricadono i Suoi impegni finanziari mensili presso intermediari terzi?\nGli impegni finanziari presso intermediari terzi, sono ad esempio le rate che devi pagare per un prestito o un mutuo che hai sottoscritto con un’altra banca',
    options: [
      'Non ho impegni finanziari mensili presso intermediari terzi',
      'Fino a 250€',
      'Tra i 251 e i 750€',
      'Oltre i 2.000€',
      'Non rispondo',
    ],
    multiple: false,
    group: 'financial',
  },
  {
    id: 'q2',
    source: '24262:780467',
    title: 'Uscite mensili ricorrenti',
    description: 'In quale fascia ricadono le Sue altre uscite mensili ricorrenti?',
    options: [
      'Non ho altre uscite mensili ricorrenti',
      'Fino a 250€',
      'Tra i 251 e i 750€',
      'Tra i 751 e 2.000€',
      'Oltre i 2.000€',
      'Non rispondo',
    ],
    multiple: false,
    group: 'financial',
  },
  {
    id: 'q3',
    source: '24262:780485',
    title: 'Patrimonio immobiliare presso terzi',
    description: 'In quale fascia ricade il suo patrimonio mobiliare presso intermediari terzi?',
    options: [
      'Non possiedo patrimonio mobiliare presso intermediari terzi',
      'Fino a 20.000€',
      'Tra i 20.001 e i 50.000€',
      'Tra i 50.001 e 150.000€',
      'Tra i 150.001 e 300.000€',
      'Oltre 300.000€',
      'Non rispondo',
    ],
    multiple: false,
    group: 'financial',
  },
  {
    id: 'q4',
    source: '24262:780504',
    title: 'Patrimonio immobiliare',
    description: 'In quale fascia ricade il suo patrimonio immobiliare?',
    options: [
      'Non possiedo patrimonio immobiliare',
      'Fino a 15.000€',
      'Tra i 15.001 e i 75.000€',
      'Tra i 75.001 e 200.000€',
      'Tra i 200.001 e 300.000€',
      'Oltre 300.000€',
      'Non rispondo',
    ],
    multiple: false,
    group: 'financial',
  },
  {
    id: 'q5',
    source: '24262:780523',
    title: 'Debito residuo presso terzi',
    description: 'In quale fascia ricade il suo debito residuo presso intermediari terzi?',
    options: [
      'Non ho debito presso intermediari terzi',
      'Fino a 15.000€',
      'Tra i 15.001 e i 75.000€',
      'Tra i 75.001 e 200.000€',
      'Tra i 200.001 e 300.000€',
      'Oltre 300.000€',
      'Non rispondo',
    ],
    multiple: false,
    group: 'financial',
  },
  {
    id: 'q6',
    source: '24262:780542',
    title: 'Priorità tra rendimento e rischio negli investimenti',
    description:
      'Considerando che le oscillazioni dei mercati finanzairi impattano positivamente o negativamente sul valore del portafoglio e che ad ogni rendimento atteso è collegato un correlato gradi di rischio, negli investimenti la Sua priorità è:',
    options: [
      'Puntare a preservare in modo costante il valore dell’investimento a fronte di un livello di rischio basso e di un rendimento anche basso (profilo cauto)',
      'Puntare ad un lieve incremento del valore dell’investimento a fronte di un livello di rischio medio basso (profilo prudente)',
      'Puntare ad un lieve incremento del valore dell’investimento a fronte di un livello di rischio medio alto (profilo bilanciato)',
      'Puntare a cogliere le opportunità di mercato per massimizzare il rendimento e fronte di un rischio alto (profilo dinamico)',
    ],
    multiple: false,
    group: 'risk',
  },
  {
    id: 'q7',
    source: '24262:780555',
    title: 'Reazione a una perdita improvvisa del portafoglio',
    description:
      'Se un prodotto nel suo portafoglio dovesse subire una repentina perdita di valore di mercato, quale sarebbe il Suo approccio?',
    options: [
      'Disinvestirei perchè non sono disposto ad accettare ulteriori perdite',
      'Valuterei un disinvestimento parziale per limitare il rischio di ulteriori perdite',
      'Non necessariamente disinvestirei ma valuterei l’opportunità di incrementare l’investimento',
      'Non rispondo',
    ],
    multiple: false,
    group: 'risk',
  },
  {
    id: 'q8',
    source: '24262:780571',
    title: 'Orizzonte temporale degli investimenti',
    description:
      'Definito l’orizzonte temporale come il periodo di tempo per il quale un investitore intende conservare i propri investimenti finanziari, qual’è il Suo orizzonte temporale?',
    options: [
      'Breve periodo (fino a 18 mesi)',
      'Prevalentemente breve periodo (fino a 18 mesi) limitando eventuali investimenti nel medio/lungo periodo del 20% del portafoglio',
      'Medio periodo (fino a 60 mesi)',
      'Prevalentemente medio periodo (fino a 60 mesi), limitando eventuali investimenti nel lungo periodo al 30% del portafoglio',
      'Prevalentemente o totalmente lungo periodo (oltre 60 mesi)',
    ],
    multiple: false,
    group: 'risk',
  },
  {
    id: 'q9',
    source: '24262:780588',
    title: 'Preferenze di sostenibilità negli investimenti',
    description:
      'Pe preferenze di sostenibilità si intende la scelta se includere o meno, e se sì in che misura, nel portafoglio i seguenti strumenti (c.d. “strumenti rilevanti ai fini delle preferenze di sostenibilità”)\nstrumenti finanziari per i quali una quota minima è investita in investimenti ecosostenibili ai sensi di quanto stabilito tempo per tempo dalla normativa in materia, ossia investimenti in attività economiche che contribuiscono in modo sostanziale al raggiungimento di uno o più dei seguenti obiettivi ambientali (a condizione che le imprese che beneficiano di tali investimenti rispettino prassi di buona governance):\nMostra di più\nRispetto al Suo portafoglio, è interessato ad investire una porzione minima in “strumenti rilevanti ai fini delle preferenze di sosteniblità?',
    options: ['No, non sono interessato', 'Si, almeno il 10%', 'Si, almeno il 20%', 'Si, almeno il 35%'],
    multiple: false,
    group: 'risk',
  },
  {
    id: 'q10',
    source: '24262:780662',
    title: 'Titolo di studio',
    description: 'Quale titolo di studio ha conseguito?',
    options: [
      'Laurea o Master in discipline economiche/giuridiche/ingegneria, con orientamento finanza e mercati',
      'Laurea in discipline economiche/scienze matematiche/ingegneria/giuridiche, senza orientamento finanza e mercati',
      'Laurea in altre discipline/ Licenza media superiore',
      'Licenza media inferiore',
      'Nessuno dei precedenti',
    ],
    multiple: false,
    group: 'education',
  },
  {
    id: 'q11',
    source: '24262:780679',
    title: 'Professione',
    description:
      'In quale categoria rientra la Sua professione svolta negli ultimi 10 anni? in caso di più di una professione selezionarne più di una',
    options: [
      'Attività lavorativa, anche in libera professione, in ambito economico/finanziario/giuridico con focus su finanza/mercati',
      'Attività lavorativa, anche in libera professione, in ambito economico/finanziario/giuridico senza focus su finanza/mercati',
      'Imprenditore titolare di azienda/manager di azienda con almeno 10 dipendenti',
      'Imprenditore titolare di azienda/manager di azienda con meno di10 dipendenti',
      'Attività lavorativa, anche in libera professione, in ambiti diversi da quello economico/finanziario/giuridico',
      'In pensione da oltre 10 anni e con attività lavorativa svolta in ambito economico/finanziario/giuridico',
      'Nessuna delle precedenti risposte',
    ],
    multiple: true,
    group: 'education',
  },
  {
    id: 'q12',
    source: '24262:780698',
    title: 'Conoscenza sui mercati',
    description: 'Si tiene aggiornato sull’andamento dei mercati finanziari?',
    options: [
      'Si, mi tengo informato sui mercati tutti i giorni',
      'Si, mi tengo informato sui mercati almeno una volta a settimana',
      'Non ricerco specificatamente informazioni sui mercati ma mi tengo aggiornato nell’ambito dell’informazione di carattere più generico',
    ],
    multiple: false,
    group: 'education',
  },
  {
    id: 'q13',
    source: '24262:780801',
    title: 'Fattori che influenzano il rischio dell’investimento',
    description:
      'Secondo la Sua conoscenza, quale di questi fattori può comportare un aumento del rischio dell’investimento? Per ciascuna delle seguenti affermazioni le chiediamo di indicare una risposta.\nUn fondo commissioni di sottoscrizioni ha un rischio di oscillazione del valore di mercato maggiore rispetto ad un fondo senza commissioni di sottoscrizione.',
    options: ['Vero', 'Falso', 'Non saprei'],
    multiple: false,
    group: 'knowledge',
  },
  {
    id: 'q14',
    source: '24262:780817',
    title: 'Rischio legato alla liquidità dei titoli quotati',
    description:
      'Un titolo quotato su un mercato regolamentato (ad esempio Borsa Italiana) con pochi scambi è più rischioso, in termini anche di smobilizzo, rispetto ad un titolo quotato su un mercato regolamentato (ad esempio Borsa Italiana) con rilevanti volumi di negoziazione.',
    options: ['Vero', 'Falso', 'Non saprei'],
    multiple: false,
    group: 'knowledge',
  },
  {
    id: 'q15',
    source: '24262:780832',
    title: 'Impatto del rating sulla rischiosità dei titoli',
    description:
      'Una modifica del rating di un emittente di un titolo impatta sulla reputazione della società ma non anche sulla rischiosità dei titoli.',
    options: ['Vero', 'Falso', 'Non saprei'],
    multiple: false,
    group: 'knowledge',
  },
  {
    id: 'q16',
    source: '24262:780713',
    title: 'Considerazioni sul rischio',
    description: 'Secondo la Sua conoscenza, per una compiuta valutazione di uno strumento finanziario:',
    options: [
      'E’ sufficiente considerare il rendimento passato, poichè lo stesso rappresenta una sintesi del grado di rischiosità dell’investimento tenuto conto del fatto che i rendimenti passati sono sempre indicativi dei rendimenti futuri.',
      'E’ necessario considerare tutte le caratteristiche particolari dello strumento che ne determinano il funzionamento nel corso dell’investimento (per esempio, caratteristiche della protezione del capitale, quali protezione totale, parziale, condizionata all’andamento del valore di mercato del sottostante, calusole di rimborso anticipato, corresponsione di cedole/proveninenti, possibile assoggettamento al bail in).',
      'Non saprei.',
    ],
    multiple: false,
    group: 'knowledge',
  },
  {
    id: 'q17',
    source: '24262:780728',
    title: 'frontiera efficiente',
    description:
      'Si definisce “frontiera efficiente” la curva che collega tutti i portafogli che rappresentano la migliore combinazione possibile di un rendimento e rischio. Un portafoglio si colloca sulla frontiera efficiente se per quel dato livello di rischio massimizza il rendimento atteso o se per quel dato livello di rendimento atteso minimizza il rischio. Ipotizzando due portafogli sulla frontiera efficiente:\n​\nPortafoglio A con rendimento atteso del 3% e rischio 5%\nUn terzo portafoglio C sempre sulla frontiera efficiente, con rendimento atteso del 7%, secondo Lei che valore plausibile di rischio potrebbe avere tra quelli indicati?',
    options: ['5%', '15%', 'Non saprei.'],
    multiple: false,
    group: 'knowledge',
  },
  {
    id: 'q18',
    source: '24262:780740',
    title: 'Diversificazione di portafoglio',
    description:
      'Secondo la sua conoscenza, quale di queste proposte sarebbe più efficace in termini di diversificazione di portafoglio?',
    options: [
      'Portafoglio investito in società che operano nello stesso settore merceologico, ad esempio 10 società diverse che operano nel settore automobilistico.',
      'Portafoglio investito in società che operano in settori diversi, ad esempio 3 società finanziarie, 3 società farmaceutiche e 4 società metalmeccaniche.',
      'Non saprei.',
    ],
    multiple: false,
    group: 'knowledge',
  },
  {
    id: 'q19',
    source: '24262:780752',
    title: 'Operatività finanziaria con altri intermediari',
    description:
      'Quante operazioni su strumenti/prodotti finanziari ha effettuato nell’ultimo anno, per il tramite di intermediari diversi dalla Banca?',
    options: ['Nessuna', 'Fino a 10', 'Tra 11 e 24', 'Oltre 24'],
    multiple: false,
    group: 'experience',
  },
  {
    id: 'q20',
    source: '24262:780766',
    title: 'Controvalore operazioni effettuate con altri intermediari',
    description:
      'In caso di risposta diversa da “nessuna” alla domanda precedente, qual’è stato il controvalore complessivo delle operazioni eseguite nel corso dell’ultimo anno, per il tramite di intermediari diversi dalla Banca?',
    options: ['Fino a 10.000€', 'Tra 10.001€ e 30.000€', 'Tra 30.001€ e 50.000€', 'Oltre 50.000€'],
    multiple: false,
    group: 'experience',
  },
  {
    id: 'q21',
    source: '24262:780783',
    title: 'Tipologie di strumenti utilizzati con altri intermediari',
    description: '(è possibile selezionare più di una risposta)',
    options: [
      'Nessuna',
      'Obbligazioni, Titoli di stato, Fondi comuni, Pronti contro termine',
      'Azioni, Prodotti di investimento assicurativi',
      'Obbligazioni subordinate, Obbligazioni strutturate, Fondi Chiusi',
      'Certificati, Derivati regolamentati',
    ],
    multiple: true,
    group: 'experience',
  },
] as const

export const servicePackages = [
  { name: 'Money Trading', fee: 3, active: true, source: '24262:778145' },
  { name: 'Money Trading Advanced', fee: 5, active: false, source: '24262:778188' },
  { name: 'Trading Real Time NYSE', fee: 5, active: false, source: '24262:778071' },
  { name: 'Trading Real Time NASDAQ', fee: 5, active: false, source: '24262:778089' },
  { name: 'Trading Real Time LSE', fee: 10, active: false, source: '24262:778118' },
  { name: 'Trading Real Time XETRA', fee: 10, active: false, source: '24262:778131' },
  { name: 'Trading Real Time EURONEXT', fee: 5, active: false, source: '24262:778106' },
  { name: 'Push Book 5 livelli', fee: 5, active: false, source: '24262:778169' },
] as const

export const marketSubscriberQuestions = [
  'Utilizzi le quotazioni del mercato per uso personale ovvero per uso non professionale? (Do you use Market Data for your personal, non-business use?)',
  'Ricevi i dati di mercato per la tua azienda o altri enti e istituzioni? (Do you receive Market Data for your business or any other entity?)',
  'Sei attualmente registrato o abilitato presso la Securities and Exchange Commission (SEC) e/o la Commodity Futures Trading Commission (CFTC)? (Are you currently registered or qualified with the SEC or the CFTC?)',
  'Sei attualmente registrato o abilitato a qualsiasi intermediario, borsa valori, ente o organismo di regolamentazione, mercati per la negoziazione di commodities e futures, enti o organismi regolamentati, negli Stati Uniti o altrove? (Are you currently registered or qualified with any securities agency, any securities exchange, association or regulatory body, or any commodities or futures contract market, association or regulatory body, in the United States or elsewhere?)',
  'Svolgi attività di consulenza a singoli individui o società? (Are you engaged to provide investment advice to any individual or entity?)',
  'Svolgi attività in qualità di gestore patrimoniale? (Are you engaged as an asset manager?)',
  'Nella tua attività di trading, gestisci il capitale di altri soggetti o enti e istituzioni? (Do you use the capital of any other individual or entity in the conduct of your trading?)',
  'Svolgi attività di trading a beneficio di società, associazioni o altri enti e istituzioni? (Do you conduct trading for the benefit of a corporation, partnership, or other entity?)',
  'Hai stipulato accordi per ricevere un compenso o condividere con altri i profitti derivanti dalla sua attività di trading? (Have you entered into any agreement to share the profit of your trading activities or receive compensation for your trading activities?)',
  'Hai a disposizione spazi di ufficio, attrezzature o altri benefit in cambio della tua attività di trading o del lavoro svolto come consulente finanziario nei confronti di persone, aziende, enti o istituzioni? (Are you receiving office space, and equipment or other benefits in exchange for your trading or work as a financial consultant to any person, firm or business entity?)',
] as const
