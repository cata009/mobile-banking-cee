export type ProfileArea =
  | 'hub'
  | 'persona'
  | 'personal'
  | 'contacts'
  | 'identity'
  | 'settings'
  | 'security'
  | 'bank'
  | 'support'
  | 'appointments'
  | 'documents'
  | 'communications'
  | 'apps'
  | 'token'
  | 'promotions'
  | 'branches'
  | 'notification'
  | 'partner'
export interface ProfileActivity {
  id: string
  day: string
  month: string
  category: string
  title: string
}
export const PROFILE_ACTIVITIES: Record<string, readonly ProfileActivity[]> = {
  Notifiche: [
    { id: 'debit-info', day: '23', month: 'GEN 25', category: 'Pagamenti', title: 'Pagamenti con carta di debito' },
    {
      id: 'secondary-device',
      day: '21',
      month: 'GEN 25',
      category: 'Sicurezza',
      title: 'Accesso da Dispositivo secondario',
    },
    {
      id: 'access-error',
      day: '15',
      month: 'GEN 25',
      category: 'Sicurezza',
      title: 'Errore Accesso Banca Multicanale',
    },
    { id: 'bank-access', day: '10', month: 'GEN 25', category: 'Sicurezza', title: 'Accesso Banca Multicanale' },
  ],
  Messaggi: [
    {
      id: 'message-croatia',
      day: '23',
      month: 'GEN 25',
      category: 'Comunicazioni',
      title: 'Cessazione della prestazione di servizi di pagamento in valuta croata.',
    },
    {
      id: 'message-access',
      day: '19',
      month: 'GEN 25',
      category: 'Comunicazioni',
      title: 'Accesso di dispositivo secondario',
    },
    {
      id: 'message-btp',
      day: '18',
      month: 'GEN 25',
      category: 'Comunicazioni',
      title: 'BTP Più modalità di inserimento ordini tramite internet e mobile banking nella fase di collocamento',
    },
    {
      id: 'message-title-0',
      day: '14',
      month: 'GEN 25',
      category: 'Notizia',
      title: 'Caratteristiche principali del titolo 1/3',
    },
  ],
}
export const PROFILE_PRACTICES = [
  { id: 'overdraft', name: 'Scoperto facile', status: 'Incompleta', date: '17/01/2025' },
  { id: 'easy-open', name: 'Pratica Easy Open', status: 'In lavorazione', date: '18/01/2025' },
  { id: 'motor', name: 'Prestito CreditExpress Quick Motor', status: 'Completata', date: '20/05/2025' },
] as const
export const PROFILE_PERSONAS = [
  { id: 'uci-personal', name: 'Andrea Rossini', code: '123456', bank: 'UniCredit', initials: 'AR', legal: false },
  { id: 'buddy-personal', name: 'Andrea Rossini', code: '123456', bank: 'buddy', initials: 'AR', legal: false },
  { id: 'volmax', name: 'Dgd Volmax', code: '987654', bank: 'UniCredit', initials: 'DV', legal: true },
  { id: 'ejecta', name: 'Ejecta', code: '4015348', bank: 'UniCredit', initials: 'EJ', legal: true },
] as const
export const PROFILE_BRANCHES = [
  {
    id: 'certosa',
    name: 'Milano Certosa',
    address: 'V.le Certosa, 125',
    type: 'Filiale',
    services: ['ATM', 'Eventi', 'Firma elettronica'],
    distance: '1.24 Km',
  },
  {
    id: 'monteceneri',
    name: 'Milano Monteceneri',
    address: 'V.le Certosa, 30',
    type: 'Filiale',
    services: ['ATM', 'Eventi'],
    distance: '2.01 Km',
  },
  {
    id: 'melozzo',
    name: 'Milano Melozzo da Forlì',
    address: 'P.za Melozzo da Forlì, SNC',
    type: 'Filiale',
    services: ['ATM'],
    distance: '2.52 Km',
  },
  {
    id: 'rembrandt',
    name: 'Milano Rembrandt',
    address: 'Via Rembrant, 2',
    type: 'Filiale',
    services: ['ATM', 'Telepass'],
    distance: '2.76 Km',
  },
  {
    id: 'sempione',
    name: 'Milano Corso Sempione',
    address: 'C.so Sempione, 76',
    type: 'Filiale',
    services: ['ATM', 'Firma elettronica'],
    distance: '2.82 Km',
  },
  {
    id: 'quarto',
    name: 'Milano Quarto Oggiario',
    address: 'Via de Roberto ang. Vittani, 2',
    type: 'Filiale',
    services: ['ATM'],
    distance: '3.07 Km',
  },
] as const
export const PROFILE_BRANCH_SERVICES = [
  { value: 'ATM', label: 'Sportello Automatico (ATM)' },
  { value: 'Eventi', label: 'Biglietteria Eventi' },
  { value: 'Telepass', label: 'Consegna Telepass Family' },
  { value: 'Firma elettronica', label: 'Abilitata alla firma elettronica' },
] as const
export const PROFILE_BRANCH_ROUTE = [
  'Procedi in direzione sudest su Viale Luigi Sturzo',
  'Svolta a destra e prendi Via Melchiorre Gioia',
  'Svolta a destra e prendi Via Fratelli Castiglioni',
  'Svolta a sinistra e prendi Viale Luigi Sturzo',
  'Continua su Via Giuseppe Ferrari',
  'Continua su Piazzale Cimitero Monumentale',
  'Svolta a destra e prendi Piazza Firenze / Viale Certosa',
  'La tua destinazione è sulla destra',
] as const
