import {sourceLinearGradient} from '../src/universal/sourceLinearGradient';

type ParsedGradient = {
  type: string;
  direction: {type: string; value: string};
  colorStops: Array<{color: number | null; position: number | string | null}>;
};

// eslint-disable-next-line @react-native/no-deep-imports -- verify RN 0.87's actual gradient parser.
const processBackgroundImage = require('react-native/Libraries/StyleSheet/processBackgroundImage')
  .default as (backgroundImage: string) => ParsedGradient[];

describe('sourceLinearGradient', () => {
  it('preserves the canonical Oklab CSS gradient on web', () => {
    expect(sourceLinearGradient('#3F6A8B', '#94B1BA', 'web')).toBe(
      'linear-gradient(to bottom right in oklab, #3F6A8B 0%, #94B1BA 100%)',
    );
  });

  it('uses the canonical Oklab midpoint and RN-supported CSS stops on native', () => {
    const cases = [
      {from: '#3F6A8B', to: '#94B1BA', midpoint: '#698DA3'},
      {from: '#78B6E8', to: '#2E7C88', midpoint: '#5499B7'},
    ];

    for (const {from, to, midpoint} of cases) {
      const css = sourceLinearGradient(from, to, 'native');
      const colorStops = [...css.matchAll(/(#[\da-f]{6})\s+([\d.]+)%/gi)];

      expect(css).toMatch(/^linear-gradient\(to bottom right,/);
      expect(css).not.toContain('oklab');
      expect(colorStops).toHaveLength(17);
      expect(colorStops[0]?.[1]?.toUpperCase()).toBe(from);
      expect(colorStops[0]?.[2]).toBe('0');
      expect(colorStops[8]?.[1]?.toUpperCase()).toBe(midpoint);
      expect(colorStops[8]?.[2]).toBe('50');
      expect(colorStops[16]?.[1]?.toUpperCase()).toBe(to);
      expect(colorStops[16]?.[2]).toBe('100');

      const parsed = processBackgroundImage(css);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.type).toBe('linear-gradient');
      expect(parsed[0]?.direction).toEqual({
        type: 'keyword',
        value: 'to bottom right',
      });
      expect(parsed[0]?.colorStops).toHaveLength(17);
      expect(parsed[0]?.colorStops.every(stop => stop.color !== null)).toBe(true);
    }
  });

  it('confirms RN 0.87 rejects the original color-interpolation syntax', () => {
    expect(
      processBackgroundImage(
        'linear-gradient(to bottom right in oklab, #3F6A8B, #94B1BA)',
      ),
    ).toEqual([]);
  });
});
