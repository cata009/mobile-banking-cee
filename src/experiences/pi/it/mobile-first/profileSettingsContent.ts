export const SETTINGS_MENU = [
  {
    title: 'Gestione e Preferenze',
    rows: [
      ['Generali', 'general'],
      ['Dispositivi', 'devices'],
      ['Notifiche', 'notifications'],
      ['Newsletter', 'newsletter'],
    ],
  },
  {
    title: 'Banca',
    rows: [
      ['Limiti e operatività rapporti', 'limits'],
      ['Diritto di recesso contratti conclusi a distanza', 'withdrawal'],
      ['Operazioni veloci', 'quick'],
      ['Terze parti', 'third-party'],
    ],
  },
  {
    title: 'Sicurezza',
    rows: [
      ['Face ID', 'face-id'],
      ['Sicurezza', 'security'],
      ['Consensi e Privacy', 'privacy'],
    ],
  },
] as const
export const SETTINGS_RESULTS: Record<string, string> = {
  'Richiesta inserita correttamente!':
    'Riceverai una email di conferma quando i nuovi limiti operativi saranno attivi. La modifica sarà valida fino al giorno 01/04/2025, dopo questa data i limiti torneranno ad essere quelli precedenti.',
  'Operazione completata con successo':
    'Il consenso è ora attivo e da oggi puoi consultare i rapporti importati nella Banca via internet e sull’APP Mobile Banking UniCredit.\nRicordarti di rinnovare il consenso alla scadenza.',
  'Il bonifico istantaneo è stato attivato correttamente':
    'Potrai disattivarlo in qualsiasi momento dalla tua area personale.',
  'Codice PIN modificato con successo!':
    'Il tuo codice PIN è stato modificato correttamente. Da ora potrai utilizzarlo per accedere e autorizzare le operazioni in sicurezza.\n\nSe non hai richiesto questa modifica o hai bisogno di assistenza, contatta il supporto clienti.',
  'Storico accessi inviato con successo!':
    'Lo storico accessi è stato inviato correttamente all’indirizzo email fornito.',
  'Mobile Code modificato con successo!':
    'Il tuo Mobile Code è stato modificato correttamente. Da ora potrai utilizzarlo per accedere e autorizzare le operazioni in sicurezza.\n\nSe non hai richiesto questa modifica o hai bisogno di assistenza, contatta il supporto clienti.',
  'Mobile Code creato con successo!':
    'Ti abbiamo inviato al numero di cellulare che hai inserito un SMS con un nuovo codice Mobile Code che potrai modificare nella sezione Sicurezza della tua Banca Multicanale. Per rendere la modifica effettiva accedi nuovamente all’App Mobile Banking.',
  'Certificato attivato correttamente!':
    'Il tuo certificato per la firma digitale è stato attivato con successo. \n\nOra puoi utilizzarlo per firmare documenti in modo semplice e sicuro. ',
  'Certificato sospeso correttamente':
    'Il tuo certificato per la firma digitale è stato sospeso con successo. Questa operazione è reversibile, potrai riattivarlo in qualsiasi momento dalla tua area personale.',
  'Certificato revocato correttamente':
    'Il tuo certificato per la firma digitale è stato revocato con successo. Potrai richiederlo nuovamente in qualsiasi momento dalla tua area personale.',
  'Il bonifico istantaneo, il bonifico SEPA e il bonifico extra SEPA sono stati attivati correttamente':
    'Potrai disattivarli in qualsiasi momento dalla tua area personale.',
  'Hai attivato il servizio con successo!':
    'Grazie! Il servizio è stato attivato correttamente. Ora puoi iniziare a utilizzarlo per bonifici e ricariche in modo semplice e veloce. \nPuoi gestire il servizio dalle tue Impostazioni.\n\nSe hai bisogno di assistenza, il nostro team è sempre a tua disposizione.',
  'Hai modificato il servizio con successo!':
    'Grazie! Il servizio è stato modificato correttamente.\n\nSe hai bisogno di assistenza, il nostro team è sempre a tua disposizione.',
  'Grazie cliente, l’operazione è stata eseguita correttamente.':
    'Clicca sul pulsante per tornare alla pagina della Terza Parte o attendi pochi secondi per essere reindirizzato automaticamente.',
}
export const NOTIFICATION_GROUPS = [
  'Sicurezza',
  'Conti correnti',
  'Carte',
  'Parental control',
  'Investimenti e risparmio',
  'Mutui e prestiti',
  'Bilancio familiare e budget',
  'Comunicazioni commerciali',
  'Altre comunicazioni',
] as const
export const NOTIFICATION_EVENTS: Record<string, readonly string[]> = {
  Sicurezza: [
    'Accesso Banca Multicanale',
    'Accesso da dispositivo secondario',
    'Errore accesso',
    'Operazioni autorizzate',
  ],
  'Conti correnti': ['Bonifici e ricariche', 'Accrediti', 'Addebiti', 'Avvisi'],
  Carte: ['Pagamenti', 'Prelievi', 'Ricariche', 'Scadenza carta'],
  'Parental control': ['Pagamenti con carta', 'Limite di spesa'],
  'Investimenti e risparmio': ['Ordini', 'Altre comunicazioni'],
  'Mutui e prestiti': ['Scadenza rata', 'Esito richiesta'],
  'Bilancio familiare e budget': ['Bilancio familiare', 'Budget mensile', 'Budget di categoria'],
  'Comunicazioni commerciali': ['Offerte e iniziative'],
  'Altre comunicazioni': ['Documenti disponibili', 'Comunicazioni della banca'],
}
export const PRIVACY_LABELS = [
  'Messaggistica',
  'Invio Email',
  'Sistemi di comunicazione multimediali, digitali e/o elettronici',
  'Chiamate',
  'Profilazione e Arricchimento',
] as const
export const CATEGORIES = [
  'Assicurazioni e finanziamenti',
  'Tasse e sanzioni',
  'Casa',
  'Utenze',
  'Trasporti',
  'Scuola e formazione',
  'Salute',
  'Shopping',
  'Cura della persona',
  'Tempo libero e viaggi',
  'Alimentari e spesa',
] as const
export const TRANSPORT_SUBCATEGORIES = [
  'Altro Trasporti',
  'Carburante',
  'Riparazioni, Tagliandi e Gomme',
  'Accessori Auto, Moto e Barche',
  'Parcheggi, Garage e Lavaggio',
  'Pedaggi autostradali',
  'Bus e Metro',
  'Car Sharing, Noleggi, Taxi',
  'Treni',
  'Voli e Traghetti',
  'Bicicletta',
] as const
export const QUICK_COSTS =
  'Attivazione della funzionalità: 0 €. Il costo delle Operazioni Veloci è lo stesso previsto per le normali operazioni effettuate tramite Banca via Internet. SMS di conferma: 26 centesimi, addebitati sul conto telefonico dal tuo operatore. Operatori abilitati: TIM, Vodafone, WINDTRE, Poste Mobile e Coop Voce.'
export const PIN_RULES = [
  'Avere massimo 8 caratteri numerici',
  'Essere differente dagli ultimi 5 PIN che hai utilizzato',
  'Essere diverso dal tuo Codice Adesione',
  'Non ripetere più di 3 volte lo stesso numero consecutivamente',
  'Non inserire più di 3 numeri in sequenza',
  'Non usare la tua data di nascita',
]
export const MOBILE_CODE_RULES = [
  'Essere un numero di lunghezza compresa tra 6 e 10 cifre',
  'Non contenere numeri consecutivi',
  'Non contenere lo stesso numero in sequenza più di 3 volte',
  'Non contenere la stessa sequenza di due o tre numeri più di due volte',
  'Essere diverso dal codice adesione, PIN, data di nascita e Mobile Code precedente',
  'Non iniziare con il numero zero',
]
export const SECURITY_MISSIONS = [
  [
    'device',
    'Ripristina il dispositivo',
    'Riporta il device alle impostazioni di fabbrica. Tutti i dati locali verranno eliminati.',
  ],
  [
    'version',
    'Scarica l’ultima versione dell’app',
    'Vai allo store ufficiale per reinstallare l’app in modo semplice e sicuro.',
  ],
  ['email', 'Verifica la tua email', 'Accedi alla sezione profilo e verifica il recapito.'],
  ['phone', 'Verifica il tuo numero di telefono', 'Accedi alla sezione profilo e verifica il recapito.'],
  [
    'knowledge',
    'Consulta la pagina Sicurezza',
    'Resta aggiornato su comunicazioni ufficiali e consigli per proteggere i tuoi dati.',
  ],
  [
    'sim',
    'SIM cambiata di recente',
    'Per la tua sicurezza, alcune operazioni potrebbero essere temporaneamente limitate. Aspetta qualche giorno per un’operatività sicura.',
  ],
] as const
export const SECURITY_ARTICLES = [
  {
    id: 'phishing',
    title: 'Impara a riconoscere il phishing',
    text: 'Si tratta di una truffa realizzata tramite email.\nLa vittima riceve un email, apparentemente inviata dalla propria banca o da altra nota società, in cui è presente un link attraverso il quale accedere direttamente al sito internet del mittente.\n\nIn realtà nei casi di phishing il link rimanda ad un "sito clone" appositamente creato riproducendo grafica e contenuti del sito ufficiale così da farlo apparire identico a quello vero.\n\nAttraverso il sito clone vengono raccolti dati personali, codici di accesso o dati delle carte al fine di utilizzarli fraudolentemente.',
    tip: "Esistono alcuni accorgimenti per difendersi dal phishing: diffidare delle email che nell'intestazione non riportano.",
  },
  {
    id: 'telephone',
    title: 'Tutelati dalle truffe al telefono',
    text: 'Le truffe telefoniche possono usare nomi e numeri che sembrano quelli della banca per chiederti di autorizzare operazioni o condividere codici.',
    tip: 'Non condividere PIN, Mobile Code o password monouso. Interrompi la chiamata e usa i contatti ufficiali.',
  },
  {
    id: 'atm',
    title: 'Tutelati dalle truffe all’ATM',
    text: 'Controlla lo sportello e proteggi il PIN quando effettui un prelievo.',
    tip: 'Copri la tastiera. Se noti elementi insoliti, scegli un altro sportello e informa la banca.',
  },
] as const
