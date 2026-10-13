import {
  defaultLoanPreferences,
  isMortgageSimulation,
  validateLoanName,
  type ItalianLoan,
  type LoanPreferences,
  type MortgageSimulation,
} from '@/features/credit/mobileFirstLoans';
import {
  CREDIT_PREFERENCES_STORAGE_KEY,
  CREDIT_SIMULATIONS_STORAGE_KEY,
  INITIAL_MORTGAGE_SIMULATIONS,
} from '@/experiences/pi/it/mobile-first/loansContent';

// The native host hydrates its storage bridge before composing screens. Session fallback also supports tests.
let preferences: LoanPreferences | null = null;
let simulations: MortgageSimulation[] = [...INITIAL_MORTGAGE_SIMULATIONS];
export function readNativeLoanPreferences(
  portfolio: readonly ItalianLoan[],
): LoanPreferences {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw: unknown = JSON.parse(
        localStorage.getItem(CREDIT_PREFERENCES_STORAGE_KEY) ?? 'null',
      );
      if (
        raw &&
        typeof raw === 'object' &&
        'names' in raw &&
        'favorites' in raw &&
        Array.isArray(raw.favorites)
      ) {
        const names: Record<string, string> = {};
        if (raw.names && typeof raw.names === 'object')
          for (const [id, name] of Object.entries(raw.names))
            if (typeof name === 'string' && !validateLoanName(name))
              names[id] = name;
        preferences = {
          names,
          favorites: [
            ...new Set(
              raw.favorites.filter(
                (id): id is string =>
                  typeof id === 'string' &&
                  portfolio.some(loan => loan.id === id),
              ),
            ),
          ],
        };
      } else preferences = defaultLoanPreferences(portfolio);
    } catch {
      preferences = defaultLoanPreferences(portfolio);
    }
  }
  const current = preferences ?? defaultLoanPreferences(portfolio);
  return {
    names: { ...current.names },
    favorites: current.favorites.filter(id =>
      portfolio.some(loan => loan.id === id),
    ),
  };
}
export function saveNativeLoanPreferences(next: LoanPreferences) {
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(CREDIT_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  preferences = { names: { ...next.names }, favorites: [...next.favorites] };
}
export function readNativeMortgageSimulations() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw: unknown = JSON.parse(
        localStorage.getItem(CREDIT_SIMULATIONS_STORAGE_KEY) ?? 'null',
      );
      simulations = Array.isArray(raw)
        ? raw.filter(isMortgageSimulation).slice(0, 70)
        : [...INITIAL_MORTGAGE_SIMULATIONS];
    } catch {
      simulations = [...INITIAL_MORTGAGE_SIMULATIONS];
    }
  }
  return [...simulations];
}
export function saveNativeMortgageSimulation(simulation: MortgageSimulation) {
  const next = [simulation, ...readNativeMortgageSimulations()].slice(0, 70);
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(CREDIT_SIMULATIONS_STORAGE_KEY, JSON.stringify(next));
  simulations = next;
}
