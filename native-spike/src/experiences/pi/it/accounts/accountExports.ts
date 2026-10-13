import {
  createAccountExcel,
  createAccountPdf,
} from '@/features/accounts-payments/mobileFirstAccountExports';
import type {
  AccountMovement,
  MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts';
import { shareDemoFile } from '../../../../platform/nativeFiles';
export async function shareAccountMovements(
  rows: readonly AccountMovement[],
  format: 'xlsx' | 'pdf',
  hidden: boolean,
) {
  if (hidden)
    throw new Error('Mostra gli importi per condividere i movimenti.');
  if (!rows.length) throw new Error('Nessun movimento da condividere.');
  return shareDemoFile(
    `movimenti.${format}`,
    format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf',
    format === 'xlsx' ? createAccountExcel(rows) : createAccountPdf(rows),
  );
}
export const ACCOUNT_CONTRACT_LINES = [
  'Tutti i conti e carte con IBAN in un unico ambiente',
  'Hai scelto di aggiungere un conto o una carta con IBAN',
  'che hai su altre banche.',
  'Il documento resta a tua disposizione nel Communication Hub.',
  'Ricordati di rinnovare il consenso alla scadenza.',
] as const;
export function shareAccountContract() {
  return shareDemoFile(
    'integrazione-contrattuale.pdf',
    'application/pdf',
    createAccountPdf([], {
      title: 'Integrazione contrattuale',
      lines: ACCOUNT_CONTRACT_LINES,
    }),
  );
}
export function shareAccountInformation(
  account: MobileFirstAccountRecord,
  hidden: boolean,
) {
  if (hidden)
    return Promise.reject(
      new Error('Mostra i dati del conto per condividere le informazioni.'),
    );
  return shareDemoFile(
    'info-conto.pdf',
    'application/pdf',
    createAccountPdf([], {
      title: 'Info conto',
      lines: [
        `Nome del conto: ${account.name}`,
        `Banca: ${account.bank ?? 'UniCredit'}`,
        `IBAN: ${account.iban ?? 'IT02Q0200814703400103035954'}`,
        `Intestato a: ${account.name}`,
        'Data di apertura: 01/03/2004',
        'BIC/SWIFT: UNCRTM1222',
      ],
    }),
  );
}
