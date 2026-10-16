import type { AccountTransaction } from '@/data/accountDetails';
import type { PfmCategorySelection } from '@/data/pfmCategories';
import type { CurrentContext } from '../contracts';
const overrides = new Map<string, PfmCategorySelection>();
const key = (
  context: Pick<CurrentContext, 'country' | 'release'>,
  id: string,
) => `${context.country}:${context.release}:${id}`;
export function readCategoryOverrides(
  context: Pick<CurrentContext, 'country' | 'release'>,
): Readonly<Record<string, PfmCategorySelection>> {
  const prefix = `${context.country}:${context.release}:`;
  return Object.fromEntries(
    [...overrides]
      .filter(([id]) => id.startsWith(prefix))
      .map(([id, selection]) => [id.slice(prefix.length), { ...selection }]),
  );
}
export function overrideCategory(
  context: Pick<CurrentContext, 'country' | 'release'>,
  id: string,
  selection: PfmCategorySelection,
) {
  overrides.set(key(context, id), selection);
}
export function applyCategoryOverride(
  context: Pick<CurrentContext, 'country' | 'release'>,
  transaction: AccountTransaction,
): AccountTransaction {
  const selection = overrides.get(key(context, transaction.id));
  return selection
    ? {
        ...transaction,
        category: selection.groupLabel,
        pfmCategory: selection.category,
        pfmSubcategory: selection.subcategory,
      }
    : transaction;
}
