import type { ServiceAppointment, ServiceItem } from '../../../../features/profile/mobileFirstProfileServices'

export const profileBranches = [
  {
    name: 'Milano Garibaldi',
    address: 'Piazza Gae Aulenti 1, Milano',
    phone: '+02 95364462',
    email: 'milano.garibaldi@unicredit.eu',
  },
  {
    name: 'Giulio Cesare 4',
    address: 'Via Giulio Cesare 4, Milano',
    phone: '+02 4567878909',
    email: 'giulio.cesare@unicredit.eu',
  },
  {
    name: 'Milano Certosa',
    address: 'V.le Certosa, 125, Milano',
    phone: '+02 95364457',
    email: 'milano.certosa@unicredit.eu',
  },
  { name: 'Zanè', address: 'V.le Rossi, 125, Milano', phone: '+02 95364457', email: 'zane@unicredit.eu' },
  {
    name: 'Thiene Chilesotti',
    address: 'Via Chilesotti 1, Thiene',
    phone: '+02 95364457',
    email: 'thiene.chilesotti@unicredit.eu',
  },
  {
    name: 'Thiene S.Gaetano',
    address: 'Via San Gaetano 4, Thiene',
    phone: '+02 95364457',
    email: 'thiene.sgaetano@unicredit.eu',
  },
  { name: 'Sarcedo', address: 'Via Roma 1, Sarcedo', phone: '+02 95364457', email: 'sarcedo@unicredit.eu' },
  { name: 'Breganze', address: 'Via Roma 1, Breganze', phone: '+02 95364457', email: 'breganze@unicredit.eu' },
] as const
export const appointmentCategories = [
  'Conto, Carte e Servizi digitali',
  'Prodotti assicurativi',
  'Investimenti',
  'Prestiti e finanziamenti',
  'Mutui casa',
  'Cassette di sicurezza',
  'Successione',
  'Altre operazioni',
]
export const appointmentPurposes = ['Informazioni / apertura', 'Gestione / chiusura', 'Altro']
export const appointmentSlots = [
  '11:30',
  '11:35',
  '11:40',
  '11:45',
  '11:50',
  '11:55',
  '12:00',
  '12:05',
  '12:10',
  '12:15',
  '12:20',
  '12:25',
]
export const appointmentDates = [
  ['MER 5/03', '2025-03-05'],
  ['GIO 6/03', '2025-03-06'],
  ['VEN 7/03', '2025-03-07'],
  ['SAB 8/03', '2025-03-08'],
  ['DOM 9/03', '2025-03-09'],
  ['LUN 10/03', '2025-03-10'],
] as const
export const initialServiceAppointments: ServiceAppointment[] = [
  {
    id: 'appointment-28',
    branch: 'Milano Garibaldi',
    category: 'Conto, Carte e Servizi digitali',
    purpose: 'Conto e Genius Card - Altro',
    date: '2025-03-28',
    time: '11:30',
    notes: '',
    status: 'Da eseguire',
  },
  {
    id: 'appointment-14',
    branch: 'Milano Garibaldi',
    category: 'Mutui casa',
    purpose: 'Mutui Casa - Surroga - Informazioni / Richiesta',
    date: '2025-03-14',
    time: '11:30',
    notes: '',
    status: 'Cancellato',
  },
]
export const profileDocumentCategories = [
  'Conti correnti',
  'Carte',
  'Pagamenti e operazioni',
  'Tasse e imposte',
  'Investimenti e trading',
  'Consulenze',
  'Mutui e prestiti',
  'FirmaMia - UniCredit Digital Mail Box',
  'Risparmio',
  'Contratti',
  'Moduli',
  'Questionari',
  'Caricati da te',
  'Libretti di risparmio',
  'Servizi di custodia',
  'Altri documenti e report',
  'Modifiche contrattuali',
  'Consulenze/Ordini wealth management',
]
const document = (
  id: string,
  title: string,
  category: string,
  day: string,
  read: boolean,
  reference: string,
  uploaded = false,
): ServiceItem => ({
  id,
  title,
  category,
  date: `2025-01-${day}`,
  owner: 'Andrea Rossini',
  reference,
  read,
  archived: false,
  uploaded,
})
export const initialServiceDocuments: ServiceItem[] = [
  document('statement', 'Estratto conto', 'Conti correnti', '13', false, '00000103167429'),
  document('amundi', 'Modulo Unico Amundi', 'Altri documenti e report', '22', false, '8464'),
  document('recommendation', 'Modulo di raccomandazione', 'Altri documenti e report', '01', true, '9258'),
  document('management', 'Modulo di gestione', 'Altri documenti e report', '06', true, '45678'),
  document('f24', 'Modulo di pagamento F24', 'Pagamenti e operazioni', '17', false, '123456789'),
  document(
    'questionnaire',
    'Questionario di profilazione e adeguata verifica',
    'Questionari',
    '12',
    true,
    '81263748596',
  ),
  document('credit-card', 'Estratto conto carta UniCredit Flexia', 'Carte', '18', true, '1234 5678 9012 1234'),
  document('savings', 'Rendiconto annuale del conto di risparmio', 'Risparmio', '18', true, '00000103167429'),
  document(
    'investment',
    'Informativa ex ante su costi ed oneri altre operazioni',
    'Investimenti e trading',
    '18',
    true,
    '00000103167429',
  ),
  document('advice', 'Informativa su costi ed oneri - Advice', 'Consulenze', '12', true, '2501564915901'),
  document('licence', 'Patente', 'Caricati da te', '28', true, 'Repository 1', true),
  document('identity', 'Documenti d’identità', 'Caricati da te', '23', true, 'Repository 1', true),
  document('passport', 'Passaporto', 'Caricati da te', '20', true, 'Repository 1', true),
]
export const initialProfileNotices: ServiceItem[] = ['23', '21', '15', '10', '09', '08', '05'].map((day, index) => ({
  id: ['debit-info', 'secondary-device', 'access-error', 'bank-access', 'login', 'transfer-info', 'bancomat'][index]!,
  title: index === 0 ? 'Notifica pagamento' : 'Sicurezza',
  category: index === 0 ? 'UniCredit' : 'Accesso da Dispositivo secondario',
  date: `2025-01-${day}`,
  read: index > 1,
  archived: false,
  body:
    index === 0
      ? 'Richiesta autorizzazione. Transazione di 956 € a favore di Apple.'
      : 'È stato effettuato un accesso da un dispositivo secondario. Se non riconosci questo accesso, verifica lo storico accessi nella sezione Sicurezza e contatta il servizio clienti.',
}))
export const initialProfileMessages: ServiceItem[] = [
  {
    id: 'message-btp',
    title: 'TP Più modalità di inserimento ordini tramite internet e mobile banking nella fase di collocamento',
    category: 'Comunicazione',
    date: '2025-01-23',
    read: false,
    archived: false,
    body: 'Durante la fase di collocamento, dal 17 febbraio 2025 al 21 febbraio 2025 (fino alle ore 13), salvo chiusura anticipata, i Clienti potranno inserire un ordine di acquisto nell’ambiente protetto del servizio di online banking. ISIN IT0005634792 – BTP PIÙ RIMBORSO ANTICIPATO. Fase di negoziazione: CONTINUA. Tipo prezzo: AL MEGLIO. Condizione quantità: SENZA CONDIZIONE. Taglio minimo: 1000 euro.',
  },
  {
    id: 'message-access',
    title: 'Accesso di dispositivo secondario',
    category: 'Comunicazione',
    date: '2025-01-19',
    read: false,
    archived: false,
    body: 'Puoi verificare i dispositivi associati e la cronologia degli accessi nella sezione Sicurezza del tuo profilo.',
  },
  ...['1/3', '2/3', '3/3'].map((suffix, i) => ({
    id: `message-title-${i}`,
    title: `Caratteristiche principali del titolo ${suffix}`,
    category: 'Notizia',
    date: '2025-01-14',
    read: true,
    archived: false,
    body: 'Consulta la documentazione informativa del titolo nella sezione Documenti prima di valutare un investimento.',
  })),
  {
    id: 'message-transfer',
    title: 'Informazioni importanti su bonifici per agevolazioni fiscali',
    category: 'Notizia',
    date: '2025-01-13',
    read: true,
    archived: false,
    body: 'Controlla i dati del beneficiario e la causale quando inserisci un bonifico per agevolazioni fiscali.',
  },
]
export const initialProfilePractices: ServiceItem[] = [
  {
    id: 'mifid',
    title: 'Intervista MIFID',
    category: 'Consulenza',
    date: '2025-01-17',
    status: 'Incompleta',
    read: false,
    archived: false,
  },
  {
    id: 'overdraft',
    title: 'Scoperto facile',
    category: 'Finanziamento',
    date: '2025-05-17',
    status: 'Incompleta',
    read: false,
    archived: false,
  },
  {
    id: 'advice-practice',
    title: 'Consulenza',
    category: 'Consulenza',
    date: '2025-05-15',
    status: 'Incompleta',
    read: false,
    archived: false,
  },
  {
    id: 'easy-open',
    title: 'Pratica Easy Open',
    category: 'Conti',
    date: '2025-01-18',
    status: 'In lavorazione',
    read: true,
    archived: false,
    body: 'La tua richiesta è in valutazione.',
  },
  {
    id: 'motor',
    title: 'Prestito CreditExpress Quick Motor',
    category: 'Prestiti',
    date: '2025-05-20',
    status: 'Completata',
    read: true,
    archived: false,
  },
  {
    id: 'flexia',
    title: 'UniCredit Flexia',
    category: 'Carte',
    date: '2025-01-02',
    status: 'Annullata',
    read: true,
    archived: false,
    body: 'La tua richiesta di carta di credito UniCreditCard è stata annullata.',
  },
  {
    id: 'refused',
    title: 'Pratica Easy Open',
    category: 'Conti',
    date: '2025-01-10',
    status: 'Rifiutata',
    read: true,
    archived: false,
  },
]
export const profileSupportTopics = [
  {
    category: 'Conti',
    title: 'Gestione del conto',
    description:
      'Funzionalità per controllare, personalizzare e condividere le informazioni del tuo conto corrente e patrimonio direttamente dall’app.',
    articles: [
      'Info sulla gestione in self del mio conto corrente',
      'Visualizzazione saldo e movimenti',
      'Condivisione IBAN tramite “Info Conto”',
    ],
  },
  {
    category: 'Conti',
    title: 'Il saldo nel dettaglio',
    description:
      'Dettagli sui limiti di utilizzo, saldo contabile e disponibile e altre info utili sulla tua disponibilità di conto.',
    articles: ['Saldo contabile e disponibile', 'Dove trovare tutti i movimenti'],
  },
  {
    category: 'Conti',
    title: 'Aggregazione conti',
    description:
      'Funzionalità per collegare conti di altre banche, visualizzare saldo e movimenti, e gestire consensi in modo sicuro.',
    articles: ['Conti presso altre banche', 'Gestione dei consensi'],
  },
  {
    category: 'Carte',
    title: 'Dettaglio movimenti',
    description: 'Tempi di contabilizzazione dei pagamenti, storni, addebiti e rifiuto pagamenti ricorrenti.',
    articles: ['Visualizzazione dei movimenti della carta'],
  },
  {
    category: 'Carte',
    title: 'Gestisci la tua carta',
    description:
      'Come attivare una nuova carta, impostare e gestire piani rateali, cambiare la modalità o il giorno di addebito e abilitarla ai pagamenti all’estero.',
    articles: ['Gestione e funzionalità della carta', 'PIN e numero carta', 'Panoramica del rapporto'],
  },
  {
    category: 'Carte',
    title: 'Problemi con la carta',
    description:
      'Scopri cosa fare in caso di pagamenti sospetti, frodi, blocchi e sospensione temporanea, furto o smarrimento.',
    articles: ['Furto o smarrimento della carta', 'Pagamenti sospetti'],
  },
  ...[
    'Pagamenti',
    'Mutui e Prestiti',
    'Bilancio familiare',
    'Profilo',
    'Sicurezza',
    'Documenti',
    'Investimenti',
    'Protezione',
  ].map((category) => ({
    category,
    title: `Gestione ${category.toLocaleLowerCase('it')}`,
    description: `Informazioni e funzionalità della sezione ${category}.`,
    articles: [`Come utilizzare ${category}`, `Informazioni su ${category}`],
  })),
]
export const profileSupportArticleBody =
  'Con l’app Mobile Banking puoi gestire il tuo conto in completa autonomia, senza dover andare in filiale. Puoi visualizzare il saldo aggiornato, controllare i movimenti in tempo reale e accedere a tutte le funzionalità legate a BANCOMAT Pay®.'
export const profileSupportArticleDetail =
  'Ad esempio, puoi sospendere temporaneamente il servizio, modificare i limiti di spesa giornalieri o mensili, oppure cambiare il conto preferito da usare per i pagamenti. Tutto questo è disponibile in pochi tocchi, direttamente dal tuo smartphone. L’app ti permette inoltre di avere una fotografia completa delle tue risorse (come conti, investimenti, saldo carte) e dei tuoi impegni finanziari (come prestiti o mutui).'
