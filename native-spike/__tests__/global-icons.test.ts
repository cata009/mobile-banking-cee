import { sourceCustomIconXml } from '../src/universal/SourceCustomIcon';
import { SHARED_CUSTOM_ICONS } from '@/app/components/icons/domains/shared/custom';
test('native vectors retain the original Source path and viewBox', () => {
  const icon = SHARED_CUSTOM_ICONS['header-profile'];
  const original = icon.render() as unknown as { props: { d: string } };
  const xml = sourceCustomIconXml('header-profile', '#262626');
  expect(xml).toContain(original.props.d);
  expect(xml).toContain(`viewBox="${icon.viewBox}"`);
  expect(xml).toContain('fill="#262626"');
  expect(sourceCustomIconXml('not-registered', '#fff')).toBeUndefined();
});
test('original Source Lucide aliases are native vectors with their exact geometry', () => {
  expect(sourceCustomIconXml('calendar-days', '#123456')).toContain(
    'M8 14h.01',
  );
  expect(sourceCustomIconXml('calendar-days', '#123456')).toContain(
    'stroke="#123456"',
  );
  expect(sourceCustomIconXml('piggy-bank', '#123456')).toContain(
    'viewBox="0 0 24 24"',
  );
});
test('stroke-only Source icons keep an unfilled SVG ground', () => {
  expect(sourceCustomIconXml('back-line', '#123456')).toMatch(
    /^<svg[^>]*fill="none"/,
  );
});
test('CSS colors are resolved before entering the native SVG parser', () => {
  const xml = sourceCustomIconXml('radio-selected', '#123456');
  expect(xml).not.toContain('var(');
  expect(xml).toContain('#ffffff');
  expect(
    sourceCustomIconXml('radio-selected', '#123456', {
      '--uc-surface': '#1a1a1a',
      '--uc-action': '#ffffff',
    }),
  ).toContain('fill="#1a1a1a"');
});

test('bundled SVG root DOM presentation attributes do not become invalid RNWeb props', () => {
  const { nativeAssetSvgXml } = require('../src/universal/AssetGlyph');
  const original =
    '<svg class="w-16" aria-hidden="true" viewBox="0 0 10 10"><path id="original" d="M0 0L10 10" fill="#123456"/></svg>';
  const xml = nativeAssetSvgXml(original);
  expect(xml).not.toContain('aria-hidden');
  expect(xml).not.toContain('class=');
  expect(xml).toContain('viewBox="0 0 10 10"');
  expect(xml).toContain('<path id="original" d="M0 0L10 10" fill="#123456"/>');
});
