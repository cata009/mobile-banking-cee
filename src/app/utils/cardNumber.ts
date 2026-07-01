export function formatMaskedCardNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  const first = digits.slice(0, 4).padEnd(4, "*");
  const last = digits.length >= 8 ? digits.slice(-4) : "0000";
  return `${first} **** **** ${last}`;
}
