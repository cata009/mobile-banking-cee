/**
 * Czech domestic account rules and payment-system codes published by the
 * Czech National Bank (directory 255, valid from 1 October 2026).
 * Source: https://www.cnb.cz/cs/platebni-styk/ucty-kody-bank/
 */
export const CZECH_PAYMENT_BANKS: Readonly<Record<string, string>> = {
  "0100": "Komerční banka, a.s.",
  "0300": "Československá obchodní banka, a. s.",
  "0600": "MONETA Money Bank, a.s.",
  "0710": "ČESKÁ NÁRODNÍ BANKA",
  "0800": "Česká spořitelna, a.s.",
  "2010": "Fio banka, a.s.",
  "2060": "Citfin, spořitelní družstvo",
  "2070": "TRINITY BANK a.s.",
  "2100": "ČSOB Hypoteční banka, a.s.",
  "2200": "Peněžní dům, spořitelní družstvo",
  "2220": "Artesa, spořitelní družstvo",
  "2250": "Banka CREDITAS a.s.",
  "2600": "Citibank Europe plc, organizační složka",
  "2700": "UniCredit Bank Czech Republic and Slovakia, a.s.",
  "3030": "Air Bank a.s.",
  "3060": "PKO BP S.A., Czech Branch",
  "3500": "ING Bank N.V.",
  "4300": "Národní rozvojová banka, a.s.",
  "5500": "Raiffeisenbank a.s.",
  "5800": "J&T BANKA, a.s.",
  "6000": "PPF banka a.s.",
  "6200": "COMMERZBANK Aktiengesellschaft, pobočka Praha",
  "6210": "mBank S.A., organizační složka",
  "6300": "BNP Paribas S.A., pobočka Česká republika",
  "6363": "Partners Banka, a.s.",
  "6600": "Banking Circle S.A., Czech Republic",
  "6700": "Všeobecná úverová banka a.s., pobočka Praha",
  "6800": "Sberbank CZ, a.s. v likvidaci",
  "7910": "Deutsche Bank Aktiengesellschaft Filiale Prag, organizační složka",
  "7950": "Raiffeisen stavební spořitelna a.s.",
  "7960": "ČSOB Stavební spořitelna, a.s.",
  "7970": "MONETA Stavební Spořitelna, a.s.",
  "7990": "Modrá pyramida stavební spořitelna, a.s.",
  "8030": "Volksbank Raiffeisenbank Nordoberpfalz eG pobočka Cheb",
  "8040": "Oberbank AG pobočka Česká republika",
  "8060": "Stavební spořitelna České spořitelny, a.s.",
  "8090": "Česká exportní banka, a.s.",
  "8150": "HSBC Continental Europe, Czech Republic",
  "8198": "FAS finance company s.r.o.",
  "8220": "Payment execution s.r.o.",
  "8250": "Bank of China (CEE) Ltd. Prague Branch",
  "8255": "Bank of Communications Co., Ltd., Prague Branch odštěpný závod",
  "8265": "Industrial and Commercial Bank of China Limited, Prague Branch, odštěpný závod",
  "8500": "Multitude Bank p.l.c.",
  "8610": "Devizová burza a.s.",
  "8620": "Comgate a.s.",
  "8660": "PAYMONT, UAB",
};

const MODULO_11_WEIGHTS_FROM_RIGHT = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6] as const;

function hasCzechModulo11Checksum(value: string) {
  let sum = 0;
  for (let index = 0; index < value.length; index += 1) {
    const digit = Number(value[value.length - 1 - index]);
    const weight = MODULO_11_WEIGHTS_FROM_RIGHT[index];
    if (weight === undefined) return false;
    sum += digit * weight;
  }
  return sum % 11 === 0;
}

export function getCzechPaymentBankName(bankCode: string) {
  return /^\d{4}$/.test(bankCode) ? CZECH_PAYMENT_BANKS[bankCode] : undefined;
}

export function isValidCzechPrefix(prefix: string) {
  return prefix === "" || (/^\d{1,6}$/.test(prefix) && hasCzechModulo11Checksum(prefix));
}

export function isValidCzechMainAccountNumber(accountNumber: string) {
  return /^\d{2,10}$/.test(accountNumber)
    && /[1-9]/.test(accountNumber)
    && hasCzechModulo11Checksum(accountNumber);
}

export function isValidCzechBankCode(bankCode: string) {
  return Boolean(getCzechPaymentBankName(bankCode));
}

export type CzechDomesticAccountParts = {
  prefix: string;
  accountNumber: string;
  bankCode: string;
};

/** Accepts only a Czech local-account shape with a bank code in the CNB directory. */
export function parseCzechDomesticAccountClipboard(value: string): CzechDomesticAccountParts | null {
  const match = value.trim().match(/^(?:(\d{1,6})-)?(\d{2,10})\s*\/\s*(\d{4})$/);
  if (!match) return null;
  const [, prefix, accountNumber, bankCode] = match;
  if (!accountNumber || !bankCode || !isValidCzechBankCode(bankCode)) return null;

  return {
    prefix: prefix ?? "",
    accountNumber,
    bankCode,
  };
}
