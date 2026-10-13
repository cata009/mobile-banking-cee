import { allocateValues, getSecurityPositions } from '@/features/investments/mobileFirstValuation'
export const securitiesDeposits = [
  { id: 'main', label: '17010 - 0000017838112', owner: 'Andrea Rossini Bianchi', sub: '00 - Andrea Rossini Bianchi' },
  {
    id: 'joint',
    label: '03020 - 00000040194379',
    owner: 'Andrea Rossini Bianchi e Laura Bianchi',
    sub: '01 - Andrea Rossini Bianchi',
  },
]
export const securitiesAllocation = allocateValues(
  Array.from(new Set(getSecurityPositions().map((position) => position.kind)), (name) => ({
    name,
    valueCents: getSecurityPositions()
      .filter((position) => position.kind === name)
      .reduce((sum, position) => sum + position.valueCents, 0),
  })),
).map((position) => ({ ...position, value: position.valueCents / 100 }))
export const securitiesNews = [
  {
    title: '*Salta accordo per la tregua tra Israele e Hamas',
    intro: 'Fonte: Repubblica',
    date: '04/02/2025 - 09:27',
    body: 'Gli ultimi eventi internazionali e le reazioni dei mercati. Consulta le quotazioni degli indici nella sezione Mercati per seguire l’andamento della giornata.',
  },
  {
    title: 'Perdita di capitale per Apple',
    intro: 'Leggi l’approfondimento per scoprire cosa potrebbe accadere al colosso tech secondo gli analisti',
    date: '04/02/2025 - 09:27',
    body: 'Il colosso della tecnologia ha perso un’ingente somma di capitale a causa di previsioni frettolose riguardo nuovi investimenti. Apple si prepara a un nuovo piano per recuperare i danni subiti. Di Emanuele Migliano e Natalia Paganini.',
  },
  {
    title: 'Come si muove Tesla rispetto ai concorrenti?',
    intro: 'Un’analisi dell’ultimo anno per Tesla rispetto ai concorrenti in ambito tech come Microsoft e Xiaomi.',
    date: '03/02/2025 - 09:27',
    body: 'Confronta i titoli tecnologici in una watchlist e osserva variazioni e performance. Le performance passate non rappresentano una garanzia dei risultati futuri.',
  },
  {
    title: 'Quando comprare azioni Dyson?',
    intro: 'Il momento giusto per comprare azioni Dyson è vicino? Il parere degli analisti è discordante',
    date: '02/02/2025 - 09:27',
    body: 'Le valutazioni degli analisti riflettono opinioni sul mercato. Puoi consultare il consenso nella scheda di dettaglio e approfondire la composizione degli indici.',
  },
  {
    title: 'Nuovi accordi per Ferrari',
    intro: 'Nell’aria ci sono nuovi possibili accordi per l’azienda automobilistica',
    date: '01/02/2025 - 09:27',
    body: 'Scopri le news delle società quotate e segui i titoli di tuo interesse nella Watchlist.',
  },
]
export const securitiesAssemblies = [
  {
    company: 'BPER Banca SPA',
    date: '18/04/2025 - 09:30',
    deadline: '16/04/2025 - 21:00',
    address: 'Via Aristotele 195, Modena',
    type: 'Ordinaria e straordinaria',
    quantity: 12,
  },
  {
    company: 'A2A SPA',
    date: '29/04/2025 - 10:00',
    deadline: '24/04/2025 - 21:00',
    address: 'Via Gasparo da Salò 13, Brescia',
    type: 'Assemblea annuale',
    quantity: 2,
  },
  {
    company: 'We Build SPA',
    date: '16/04/2025 - 10:00',
    deadline: '14/04/2025 - 21:00',
    address: 'Milano Fiori, Strada 6 Palazzo L, Rozzano',
    type: 'Assemblea annuale',
    quantity: 10,
  },
  {
    company: 'Banco BPM SPA',
    date: '30/04/2025 - 09:00',
    deadline: '28/04/2025 - 21:00',
    address: 'Allianz MICO - Viale Scarampo, Gate 6, Milano',
    type: 'Assemblea annuale',
    quantity: 20,
  },
]
export const securitiesIndices = [
  { name: 'Indice FTSE MIB', value: 34736.74, change: 7.61 },
  { name: 'Mid Cap', value: 40008.77, change: 4.9 },
  { name: 'All-Share', value: 25367.22, change: 9.31 },
  { name: 'NASDAQ', value: 18189.17, change: 1.22 },
  { name: 'S&P 500', value: 5712.5, change: 0.85 },
  { name: 'DAX', value: 22380.31, change: -0.43 },
]
