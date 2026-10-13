import { money as accountMoney } from '../accounts/Primitives';
/** Source card privacy uses bullets; account privacy preserves the formatted mask shape. */
export const money = (value: number, hidden = false, signed = false) =>
  hidden ? '••••' : accountMoney(value, false, signed);
