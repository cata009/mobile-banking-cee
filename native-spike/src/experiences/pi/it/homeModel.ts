import { useSyncExternalStore } from 'react';
import { normalizeItalianAutoInteger } from './numberFormatting';
import type { ProductCounts } from '@/app/state/demoTypes';
import {
  getAccountLedgerRecord,
  getAccountPreferences,
  selectHomeAccounts,
  subscribeAccountMovementChanges,
} from '@/features/accounts-payments/mobileFirstAccounts';
import {
  getCardLedgerRecord,
  selectHomepageCards,
} from '@/features/cards/mobileFirstCards';
import { buildLoanPortfolio } from '@/features/credit/mobileFirstLoans';
import {
  getInsuranceFavorites,
  getInsuranceSnapshot,
  selectHomepageInsurance,
  subscribeInsurance,
} from '@/features/insurance/mobileFirstInsurance';
import {
  getItalyFinancialSnapshot,
  fromCents,
  subscribeItalyFinancialChanges,
} from '@/features/finance/italyFinancials';
import {
  getPfmWealthSummary,
  selectPfmSummary,
} from '@/features/analytics/mobileFirstPfm';
import {
  getPfmBudgetSnapshot,
  subscribePfmBudgetChanges,
} from '@/features/analytics/mobileFirstPfmState';
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings';
import { ACCOUNT_DIRECTORY } from '@/experiences/pi/it/mobile-first/accountContent';
import {
  getNativeItalyCardSession,
  subscribeNativeItalyCardSession,
} from './cards/cardSession';
import { ITALY_INSURANCE_POLICIES } from '@/experiences/pi/it/mobile-first/insuranceContent';
import { getItalyPfmFinancialInput } from '@/experiences/pi/it/mobile-first/pfmFinancialContent';
import { readNativeLoanPreferences } from './loans/session';

/** Composition only: balances, visibility and household wealth remain feature policies. */
export function useItalyHomeModel(counts: ProductCounts) {
  const cards = useSyncExternalStore(
    subscribeNativeItalyCardSession,
    getNativeItalyCardSession,
    getNativeItalyCardSession,
  );
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
    getItalyFinancialSnapshot,
  );
  const preferences = useSyncExternalStore(
    subscribeAccountMovementChanges,
    getAccountPreferences,
    getAccountPreferences,
  );
  const budget = useSyncExternalStore(
    subscribePfmBudgetChanges,
    getPfmBudgetSnapshot,
    getPfmBudgetSnapshot,
  );
  const profile = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
    profileSettingsStore.getSnapshot,
  );
  const insurance = useSyncExternalStore(
    subscribeInsurance,
    getInsuranceSnapshot,
    getInsuranceSnapshot,
  );
  const input = getItalyPfmFinancialInput(financial, counts);
  const summary = selectPfmSummary(financial, input);
  const wealth = getPfmWealthSummary(input, {
    year: financial.asOf.slice(0, 4),
  });
  const loans = buildLoanPortfolio(counts);
  const loanPreferences = readNativeLoanPreferences(loans);
  const favorites = loanPreferences.favorites.flatMap(id =>
    loans.filter(loan => loan.id === id),
  );
  const homeLoans = (favorites.length ? favorites : loans)
    .slice(0, 2)
    .map(loan => ({
      ...loan,
      name: loanPreferences.names[loan.id] ?? loan.name,
    }));
  return {
    accounts: selectHomeAccounts(
      ACCOUNT_DIRECTORY.slice(0, counts.accounts).map(account =>
        getAccountLedgerRecord(account, financial),
      ),
      preferences,
    ),
    cards: selectHomepageCards(
      cards.map(card => getCardLedgerRecord(card, financial)),
      { debit: counts.debitCards, credit: counts.creditCards },
    ),
    loans,
    homeLoans,
    policies: selectHomepageInsurance(
      ITALY_INSURANCE_POLICIES,
      getInsuranceFavorites(ITALY_INSURANCE_POLICIES, insurance),
    ),
    activePolicyCount: ITALY_INSURANCE_POLICIES.filter(
      policy => policy.status === 'active',
    ).length,
    preferredProfile: profile.preferredProfile,
    date: financial.asOf.split('-').reverse().join('/'),
    widgets: [
      {
        title: 'Quanto hai speso questo mese?',
        amount: fromCents(summary.spendCents),
        action: 'VAI AL BILANCIO',
        tab: 'Bilancio familiare' as const,
      },
      {
        title: 'Ecco il valore del tuo patrimonio netto:',
        amount: fromCents(wealth.netWorthCents),
        action: 'VAI AL PATRIMONIO',
        tab: 'Patrimonio' as const,
      },
      {
        title: 'Il tuo budget di spesa mensile',
        amount: fromCents(budget.targetCents),
        action: 'VAI AL BUDGET',
        tab: 'Budget' as const,
      },
    ],
  };
}

export function homeAmountParts(
  value: number,
  hidden: boolean,
  small = false,
  grouping: 'auto' | 'always' = 'auto',
) {
  const [engineInteger, decimals] = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...(grouping === 'always' ? { useGrouping: 'always' as const } : {}),
  })
    .format(value)
    .split(',');
  // Source Chrome's Italian auto grouping starts at five integer digits. Hermes
  // groups four; normalize the already-rounded presentation, not the money.
  const integer =
    grouping === 'auto'
      ? normalizeItalianAutoInteger(engineInteger)
      : engineInteger;
  return {
    integer: hidden ? (small ? '*.***.***' : '**.***') : integer,
    decimals: hidden ? ',** €' : `,${decimals} €`,
  };
}
