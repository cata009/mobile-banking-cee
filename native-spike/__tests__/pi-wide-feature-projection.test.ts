import { currentFeature } from '../src/experiences/pi/current/context';

test('a controlled effective feature projection is authoritative, including an explicitly empty projection', () => {
  const context = {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
  } as const;
  expect(
    currentFeature(
      { ...context, activeFeatures: ['fx_cardsRedesign'] },
      'fx_cardsRedesign',
    ),
  ).toBe(true);
  expect(
    currentFeature({ ...context, activeFeatures: [] }, 'fx_cardsRedesign'),
  ).toBe(false);
  expect(
    currentFeature(
      {
        country: 'CZ',
        release: 'release-future-cz-robo',
        scenario: 'active',
        activeFeatures: [],
      },
      'fx_czRoboAdvisor',
    ),
  ).toBe(false);
});
