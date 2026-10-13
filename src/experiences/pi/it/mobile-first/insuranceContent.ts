import type {
  InsurancePolicy,
  InsuranceModule,
  InsuranceDocument,
  InsuranceDocumentFilter,
} from '@/features/insurance/mobileFirstInsurance'

export const INSURANCE_REFERENCE_DATE = '2025-04-02'
export const INSURANCE_REFERENCE_YEAR = 2025
/** Text supplied by Figma screen 24282:370656; display-only demo coverage. */
export const INSURANCE_CIVIL_LIABILITY_DETAIL = {
  title: 'Responsabilità civile',
  covered:
    'La garanzia copre la persona assicurata nel caso di invalidità permanente da infortunio superiore al 7%. Sino al 48% sarà liquidata una somma coerente con la percentuale di invalidità detratta la franchigia del 7%. Tra il 49% e il 65% sarà liquidato il 100% della somma assicurata. Dal 66% in su verrà applicata una supervalutazione sino a una liquidazione massima del 200% della somma assicurata nei casi di invalidità massima (100%).',
  excluded:
    'La garanzia in caso di infortuni derivanti da attività sportiva non professionale la copertura opera con il limite del 10% della somma assicurata per sinistro ed anno assicurativo; in caso di interesse si invita a visionare il modulo Sport.',
} as const
export const INSURANCE_MODULES: readonly InsuranceModule[] = [
  {
    id: 'casa',
    name: 'Casa',
    premium: 150,
    start: '2024-05-23',
    expiry: '2028-06-09',
    addresses: ['Via Livio Campi, 11, 20800, Verona, VR', 'Via Livio Campi, 12, 20800, Verona, VR'],
    guarantees: ['Garanzia', 'Garanzia 2'],
  },
  {
    id: 'famiglia',
    name: 'Famiglia',
    premium: 150,
    start: '2024-05-23',
    expiry: '2028-06-09',
    guarantees: ['Responsabilità civile', 'Tutela legale'],
    people: [
      { name: 'Rossini Andrea', guarantees: ['Responsabilità civile'] },
      { name: 'Bianchini Flavia', guarantees: ['Responsabilità civile', 'Tutela legale'] },
    ],
  },
  {
    id: 'persona',
    name: 'Persona',
    premium: 150,
    start: '2024-05-23',
    expiry: '2028-06-09',
    guarantees: ['Assistenza', 'Responsabilità civile', 'Rimborso spese mediche da infortunio', 'Tutela legale'],
    people: [
      {
        name: 'Rossini Andrea',
        guarantees: ['Assistenza', 'Responsabilità civile', 'Rimborso spese mediche da infortunio', 'Tutela legale'],
        beneficiary: 'Andrea Rossini',
        contact: 'Marco Rossi',
      },
      {
        name: 'Bianchini Flavia',
        guarantees: ['Assistenza', 'Responsabilità civile'],
        beneficiary: 'Flavia Bianchini',
        contact: 'Andrea Rossini',
      },
      {
        name: 'Rossini Sara',
        guarantees: ['Assistenza', 'Rimborso spese mediche da infortunio'],
        beneficiary: 'Sara Rossini',
        contact: 'Andrea Rossini',
      },
    ],
  },
]
const base = {
  company: 'Allianz',
  start: '2024-05-23',
  expiry: '2028-06-09',
  premium: 21.81,
  frequency: 'Mensile',
  nextPayment: '2025-07-09',
  email: 'an****.ros****@mail.it',
  status: 'active' as const,
}
const protection = {
  holder: 'Andrea Rossini',
  insured: 'Andrea Rossini',
  beneficiary: 'Andrea Rossini',
  guarantees: ['Decesso'],
  capital: 10500,
}
/** Canonical page fixtures: policy numbers and channel capabilities are distinct. */
export const ITALY_INSURANCE_POLICIES: readonly InsurancePolicy[] = [
  {
    ...base,
    id: 'famiglia-20',
    premium: 450,
    history: [
      { id: 'source-subscription', label: 'Sottoscrizione', expiry: '2022-01-17', amount: 2385, status: 'collected' },
    ],
    name: 'My Care Famiglia',
    number: '20',
    channel: 'digital',
    modules: INSURANCE_MODULES,
  },
  {
    ...base,
    id: 'incendio-30',
    name: 'Polizza Incendio e scoppio',
    number: '30',
    channel: 'assistance',
    modules: [],
    protection: { ...protection, beneficiary: undefined, capital: undefined },
  },
  { ...base, id: 'auto-12', name: 'Guida Protetta Auto', number: '12', channel: 'digital', modules: [], protection },
  { ...base, id: 'futuro-25', name: 'My Care Futuro', number: '25', channel: 'digital', modules: [], protection },
  { ...base, id: 'life-08', name: 'My Life Care', number: '08', channel: 'assistance', modules: [], protection },
  {
    ...base,
    id: 'unicredit-famiglia-10',
    premium: 450,
    name: 'UniCredit My Care Famiglia',
    number: '10',
    channel: 'assistance',
    modules: INSURANCE_MODULES,
  },
  {
    ...base,
    id: 'annullata-28',
    name: 'My Care Famiglia',
    number: '28',
    status: 'inactive',
    channel: 'assistance',
    modules: INSURANCE_MODULES,
    expiry: '2024-06-09',
  },
  {
    ...base,
    id: 'annullata-32',
    name: 'Polizza Incendio e scoppio',
    number: '32',
    status: 'inactive',
    channel: 'assistance',
    modules: [],
    protection,
    expiry: '2024-06-09',
  },
]
export const DEFAULT_INSURANCE_DOCUMENT_FILTER: InsuranceDocumentFilter = {
  from: '2024-09-11',
  to: '2025-03-11',
  category: 'Documenti firmati digitalmente',
}
export function insuranceDocuments(policyId: string): InsuranceDocument[] {
  return [
    {
      id: `${policyId}-contract-2025-03-11`,
      policyId,
      title: 'Contratto di polizza',
      category: 'Documenti firmati digitalmente',
      date: '2025-03-11',
      reference: '00000103167429',
      read: false,
    },
    {
      id: `${policyId}-contract-2025-03-10`,
      policyId,
      title: 'Contratto di polizza',
      category: 'Documenti firmati digitalmente',
      date: '2025-03-10',
      reference: '00000103167430',
      read: false,
    },
    {
      id: `${policyId}-contract-2025-02-06`,
      policyId,
      title: 'Contratto di polizza',
      category: 'Documenti firmati digitalmente',
      date: '2025-02-06',
      reference: '00000103167404',
      read: true,
    },
    {
      id: `${policyId}-contract-2024-10-12`,
      policyId,
      title: 'Contratto di polizza',
      category: 'Documenti firmati digitalmente',
      date: '2024-10-12',
      reference: '00000103167429',
      read: true,
    },
    {
      id: `${policyId}-contract-2024-10-18`,
      policyId,
      title: 'Contratto di polizza',
      category: 'Documenti firmati digitalmente',
      date: '2024-10-18',
      reference: '00000103167430',
      read: true,
    },
    {
      id: `${policyId}-set-2025-04-03`,
      policyId,
      title: 'Set Informativo',
      category: 'Moduli',
      date: '2025-04-03',
      reference: '00000103167431',
      read: true,
    },
    {
      id: `${policyId}-contract-2025-04-03`,
      policyId,
      title: 'Contratto di polizza',
      category: 'Documenti firmati digitalmente',
      date: '2025-04-03',
      reference: '00000103167432',
      read: true,
    },
  ]
}
export const INSURANCE_DOCUMENT_CATEGORIES = [
  { heading: 'Gestione conto', values: ['Conti correnti', 'Carte', 'Pagamenti e operazioni'] },
  {
    heading: 'Risparmio e Investimenti',
    values: ['Risparmio', 'Libretti di risparmio', 'Investimenti e Trading', 'Servizi di custodia', 'Mutui e prestiti'],
  },
  { heading: 'Consulenza e finanza', values: ['Consulenze'] },
  { heading: 'Documenti e contratti', values: ['Contratti', 'Moduli', 'Altri documenti e report'] },
  {
    heading: 'Strumenti digitali e di gestione',
    values: ['Documenti firmati digitalmente', 'Questionari', 'Caricati da te'],
  },
  { heading: 'Obblighi fiscali', values: ['Tasse e Imposte'] },
] as const
export const INSURANCE_MANAGEMENT_ACTIONS = [
  { id: 'payment', label: 'Modifica metodo di pagamento' },
  { id: 'annual-cancellation', label: 'Disdetta a scadenza annua' },
  { id: 'risk-ended', label: 'Interruzione per cessato rischio' },
  { id: 'withdrawal', label: 'Ripensamento' },
] as const
export const INSURANCE_FAQ = [
  {
    question: 'Che informazioni trovo per ogni polizza?',
    answer:
      'Puoi consultare compagnia, numero di polizza, data di decorrenza e scadenza, premio e prossimo pagamento. Per le polizze con moduli trovi anche il dettaglio delle protezioni.',
  },
  {
    question: 'Che polizze trovo nella sezione “Polizze assicurative”?',
    answer:
      'Le polizze assicurative di protezione distribuite da UniCredit. Inizialmente alcuni prodotti potrebbero non essere presenti: stiamo lavorando per inserirli e darti piena visibilità delle tue polizze.',
  },
] as const
