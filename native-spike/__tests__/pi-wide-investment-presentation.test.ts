import { currentInvestmentPresentation } from '../src/experiences/pi/current/investments/presentation';

test.each(['release-future-cz-robo', 'release-future-evo-2027'] as const)(
  '%s mounts the Source Robo composition and its module footer by default',
  release => {
    expect(
      currentInvestmentPresentation({
        country: 'CZ',
        release,
        scenario: 'active',
      }),
    ).toEqual({ roboAdvisorEnabled: true, showBottomNavigation: true });
  },
);

test('the Source feature projection and explicit preview presentation retain authority', () => {
  const context = {
    country: 'CZ' as const,
    release: 'release-future-cz-robo' as const,
    scenario: 'active' as const,
  };
  expect(
    currentInvestmentPresentation({ ...context, activeFeatures: [] }),
  ).toEqual({ roboAdvisorEnabled: false, showBottomNavigation: false });
  expect(
    currentInvestmentPresentation(context, {
      roboAdvisorEnabled: false,
      showBottomNavigation: false,
      bottomInset: 64,
    }),
  ).toEqual({
    roboAdvisorEnabled: false,
    showBottomNavigation: false,
    bottomInset: 64,
  });
  expect(
    currentInvestmentPresentation({ ...context, release: 'release-current' }),
  ).toEqual({ roboAdvisorEnabled: false, showBottomNavigation: false });
});
