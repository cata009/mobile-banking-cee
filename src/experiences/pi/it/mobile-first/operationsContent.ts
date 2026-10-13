import transfer from '@/assets/mobile-first/it/operations/transfer.svg'
import periodicTransfer from '@/assets/mobile-first/it/operations/periodic-transfer.svg'
import smartphone from '@/assets/mobile-first/it/operations/smartphone.svg'
import prepaidCard from '@/assets/mobile-first/it/operations/recharge-prepaid-card.svg'
import f24 from '@/assets/mobile-first/it/operations/f24.svg'
import bills from '@/assets/mobile-first/it/operations/bills.svg'
import transport from '@/assets/mobile-first/it/operations/private-transport.svg'
import signature from '@/assets/mobile-first/it/operations/signature.svg'
import donation from '@/assets/mobile-first/it/operations/donation.svg'
import qr from '@/assets/mobile-first/it/operations/qr.svg'
import archive from '@/assets/mobile-first/it/operations/archive.svg'
import atm from '@/assets/mobile-first/it/operations/atm.svg'

export const MOBILE_FIRST_OPERATION_QUICK_ACTIONS = [
  { label: 'Riproponi pagamento', lines: ['Riproponi', 'pagamento'], icon: transfer },
  { label: 'Paga con foto', lines: ['Paga', 'con foto'], icon: qr },
  { label: 'Archivio pagamenti', lines: ['Archivio', 'pagamenti'], icon: archive },
  { label: 'Prelievo smart', lines: ['Prelievo', 'smart'], icon: atm },
]

export const MOBILE_FIRST_OPERATION_GROUPS = [
  {
    title: 'Bonifici e Bancomat Pay',
    rows: [
      { label: 'Bonifico, Giroconto, Agevolazioni fiscali, Estero', icon: transfer },
      { label: 'Bonifico, Giroconto periodico', icon: periodicTransfer },
      { label: 'BANCOMAT® Pay', icon: periodicTransfer },
    ],
  },
  {
    title: 'Ricariche',
    rows: [
      { label: 'Ricarica cellulare', icon: smartphone },
      { label: 'Ricarica prepagata', icon: prepaidCard },
    ],
  },
  {
    title: 'Pagamenti verso Enti e Tributi',
    rows: [
      { label: 'F24', icon: f24 },
      { label: 'Bollettino CBILL/PagoPA', icon: bills },
      { label: 'Avvisi pagoPA', icon: transfer },
      { label: 'Bollo auto e moto', icon: transport },
      { label: 'Bollettino', icon: bills },
      { label: 'MAV, RAV, REP', icon: bills },
      { label: 'Pagamento effetti', icon: periodicTransfer },
      { label: 'Agenzia delle Entrate (pagoPA)', icon: signature },
      { label: 'Enti Convenzionati', icon: transfer },
    ],
  },
  {
    title: 'Altri pagamenti',
    rows: [
      { label: 'Donazione', icon: donation },
      { label: 'Pagamento con codice Terze Parti', icon: transfer },
      { label: 'My Bank', icon: transfer },
    ],
  },
]
