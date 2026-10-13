import {
  historyRowMatchesDate,
  resetFilterTypesForTab,
} from '@/features/investments/history/model';
import { canSignBulkSummary } from '@/features/investments/bulk-approval/model';
import {
  createAppointmentDraft,
  canContinueBooking,
  validAppointmentEmail,
  completeFeedback,
} from '@/features/profile/evoAppointments';
import type { InvestmentHistoryFilterState } from '@/app/config/investmentsPortfolioConfig';

test('history periods anchor to the latest Source row rather than the device clock', () => {
  const filters: InvestmentHistoryFilterState = {
    datePreset: 'last-month',
    customStartDate: '2026-01-01',
    customEndDate: '2026-01-31',
    selectedTypes: ['BUY'],
    selectedStatuses: ['EXECUTED'],
    selectedCurrencies: ['CZK'],
  };
  expect(
    historyRowMatchesDate(
      '2026-01-15T12:00:00Z',
      filters,
      new Date('2026-02-01T12:00:00Z'),
    ),
  ).toBe(true);
  expect(
    historyRowMatchesDate(
      '2025-12-01T12:00:00Z',
      filters,
      new Date('2026-02-01T12:00:00Z'),
    ),
  ).toBe(false);
  expect(resetFilterTypesForTab(filters, 'orders').selectedTypes).toEqual([
    'BUY',
    'SELL',
  ]);
});
test('bulk summary requires selected drafts, every review and accepted terms', () => {
  expect(canSignBulkSummary([], [], true)).toBe(false);
  expect(canSignBulkSummary(['draft-01', 'draft-02'], ['draft-01'], true)).toBe(
    false,
  );
  expect(canSignBulkSummary(['draft-01'], ['draft-01'], false)).toBe(false);
  expect(canSignBulkSummary(['draft-01'], ['draft-01'], true)).toBe(true);
});
test('booking details are optional, while low-rating feedback needs the Source reason/detail', () => {
  const draft = createAppointmentDraft('Branch', 'Address');
  expect(
    canContinueBooking({
      ...draft,
      reasons: ['Accounts'],
      meetingType: 'online',
      details: [],
    }),
  ).toBe(true);
  expect(
    canContinueBooking({
      ...draft,
      reasons: ['Accounts'],
      meetingType: 'branch',
      branchName: '',
    }),
  ).toBe(false);
  expect(validAppointmentEmail(' customer@example.com ')).toBe(true);
  expect(completeFeedback(2, 'organizedMeeting', '')).toBe(false);
  expect(completeFeedback(2, 'organizedMeeting', 'tooLate')).toBe(true);
  expect(completeFeedback(4, '', '')).toBe(true);
});
