import { createCardMovementsExport } from '@/features/cards/mobileFirstCardsExport';
import type { CardMovement } from '@/features/cards/mobileFirstCards';
import { shareDemoFile } from '../../../../platform/nativeFiles';
export function shareCardMovements(
  rows: readonly CardMovement[],
  format: 'xlsx' | 'pdf',
  hidden: boolean,
  title?: string,
  filename = 'movimenti-carta',
) {
  const document = createCardMovementsExport(rows, format, hidden, title);
  return shareDemoFile(
    `${filename}.${document.extension}`,
    document.mime,
    document.bytes,
  );
}
