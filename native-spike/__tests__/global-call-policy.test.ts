import {
  createCallDraft,
  canContinueCall,
  validPhone,
  CONTACT_INTERVALS,
} from '@/features/profile/evoCallRequest';
test('callback draft and completion preserve Source country number and selection requirements', () => {
  const draft = createCallDraft('CZ');
  expect(draft).toMatchObject({
    countryCode: '+420',
    phoneNumber: '602123456',
    reasons: [],
    intervals: [],
  });
  expect(canContinueCall(draft)).toBe(false);
  expect(
    canContinueCall({
      ...draft,
      reasons: ['Accounts'],
      details: ['Current account'],
      intervals: [CONTACT_INTERVALS[0]],
    }),
  ).toBe(true);
  expect(validPhone('123456')).toBe(false);
  expect(validPhone('+420 602 123 456')).toBe(true);
  expect(validPhone('1234567890123456')).toBe(false);
});
