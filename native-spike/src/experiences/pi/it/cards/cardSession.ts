import {
  ITALY_CARDS,
  type ItalyCard,
} from '@/experiences/pi/it/mobile-first/cardsContent';
/** Renderer metadata only. Monetary state and card status remain in the finance feature. */
const STORAGE_KEY = 'italy-native-card-metadata-v1';
type Metadata = Pick<
  ItalyCard,
  'id' | 'nickname' | 'favorite' | 'settings' | 'repayment' | 'wallet'
>;
function readMetadata(): Metadata[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(
        (row): row is Metadata =>
          !!row &&
          typeof row === 'object' &&
          typeof row.id === 'string' &&
          typeof row.favorite === 'boolean' &&
          ITALY_CARDS.some(card => card.id === row.id) &&
          ['nickname', 'repayment', 'wallet'].every(
            key => row[key] === undefined || typeof row[key] === 'string',
          ) &&
          (row.settings === undefined ||
            (row.settings &&
              typeof row.settings === 'object' &&
              !Array.isArray(row.settings) &&
              Object.values(row.settings).every(
                value =>
                  Array.isArray(value) &&
                  value.every(item => typeof item === 'string'),
              ))),
      )
      .map(({ id, nickname, favorite, settings, repayment, wallet }) => ({
        id,
        nickname,
        favorite,
        settings,
        repayment,
        wallet,
      }));
  } catch {
    return [];
  }
}
const metadata = readMetadata();
let cards: readonly ItalyCard[] = [
  ...metadata.map(row => ({
    ...ITALY_CARDS.find(card => card.id === row.id)!,
    ...row,
  })),
  ...ITALY_CARDS.filter(card => !metadata.some(row => row.id === card.id)).map(
    card => ({ ...card }),
  ),
];
const listeners = new Set<() => void>();
function publish() {
  try {
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify(
        cards.map(
          ({ id, nickname, favorite, settings, repayment, wallet }) => ({
            id,
            nickname,
            favorite,
            settings,
            repayment,
            wallet,
          }),
        ),
      ),
    );
  } catch {
    /* In-memory navigation remains available when storage is unavailable. */
  }
  listeners.forEach(listener => listener());
}
export const getNativeItalyCardSession = () => cards;
export function subscribeNativeItalyCardSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function updateNativeItalyCardSession(
  id: string,
  patch: Partial<
    Pick<
      ItalyCard,
      'nickname' | 'favorite' | 'settings' | 'repayment' | 'wallet'
    >
  >,
) {
  cards = cards.map(card => (card.id === id ? { ...card, ...patch } : card));
  publish();
}
export function saveNativeItalyCardSessionMetadata(
  draft: readonly ItalyCard[],
) {
  cards = draft.map(card => ({ ...card }));
  publish();
}
