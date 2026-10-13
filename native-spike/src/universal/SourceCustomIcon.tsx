import React, { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { SHARED_CUSTOM_ICONS } from '@/app/components/icons/domains/shared/custom';
import { SERVICES_CUSTOM_ICONS } from '@/app/components/icons/domains/services/custom';
import { ACCOUNTS_CUSTOM_ICONS } from '@/app/components/icons/domains/accounts/custom';
import { CARDS_CUSTOM_ICONS } from '@/app/components/icons/domains/cards/custom';
import { PAYMENTS_CUSTOM_ICONS } from '@/app/components/icons/domains/payments/custom';
import { INVESTMENTS_CUSTOM_ICONS } from '@/app/components/icons/domains/investments/custom';
import { IDENTITY_CUSTOM_ICONS } from '@/app/components/icons/domains/identity/custom';
import { PLATFORM_CUSTOM_ICONS } from '@/app/components/icons/domains/platform/custom';
import { PRODUCTS_CUSTOM_ICONS } from '@/app/components/icons/domains/products/custom';
import { ANALYTICS_CUSTOM_ICONS } from '@/app/components/icons/domains/analytics/custom';
import { KIDS_CUSTOM_ICONS } from '@/app/components/icons/domains/kids/custom';
import { namespaceSvgArtworkXml } from './VectorArtworkLayer';
import type { ControlTokens } from './tokens';
import { SOURCE_LUCIDE_GEOMETRY } from './sourceLucideGeometry';

const definitions: Record<string, { viewBox: string; render: () => unknown }> =
  {
    ...SHARED_CUSTOM_ICONS,
    ...SERVICES_CUSTOM_ICONS,
    ...ACCOUNTS_CUSTOM_ICONS,
    ...CARDS_CUSTOM_ICONS,
    ...PAYMENTS_CUSTOM_ICONS,
    ...INVESTMENTS_CUSTOM_ICONS,
    ...IDENTITY_CUSTOM_ICONS,
    ...PLATFORM_CUSTOM_ICONS,
    ...PRODUCTS_CUSTOM_ICONS,
    ...ANALYTICS_CUSTOM_ICONS,
    ...KIDS_CUSTOM_ICONS,
  };
function escapeXml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function attributeName(name: string): string {
  if (
    [
      'viewBox',
      'preserveAspectRatio',
      'gradientUnits',
      'gradientTransform',
      'patternUnits',
      'patternContentUnits',
      'patternTransform',
    ].includes(name)
  )
    return name;
  if (name === 'xlinkHref') return 'href';
  return name.replace(/[A-Z]/g, character => `-${character.toLowerCase()}`);
}
/** Serialize only original vector element data. No DOM or raster conversion is involved. */
function vectorXml(node: unknown, color: string): string {
  if (node === null || node === undefined || typeof node === 'boolean')
    return '';
  if (Array.isArray(node))
    return node.map(child => vectorXml(child, color)).join('');
  if (typeof node === 'string' || typeof node === 'number')
    return escapeXml(node);
  if (
    typeof node !== 'object' ||
    !('$$typeof' in node) ||
    !('type' in node) ||
    !('props' in node)
  )
    return '';
  // Source's React 18 and native's React 19 factories use different element tags.
  if (
    node.$$typeof !== Symbol.for('react.element') &&
    node.$$typeof !== Symbol.for('react.transitional.element')
  )
    return '';
  const element = node as { type: unknown; props: Record<string, unknown> };
  if (element.type === React.Fragment)
    return vectorXml(element.props.children, color);
  if (typeof element.type !== 'string')
    throw new Error('Source icon metadata must contain vector elements only');
  const attributes = Object.entries(element.props)
    .filter(
      ([key, value]) =>
        !['children', 'key', 'ref', 'className'].includes(key) &&
        value !== null &&
        value !== undefined &&
        typeof value !== 'function',
    )
    .map(([key, value]) => {
      if (key === 'style' && typeof value === 'object')
        return `style="${escapeXml(
          Object.entries(value as Record<string, unknown>)
            .map(
              ([property, setting]) =>
                `${attributeName(property)}:${String(setting).replace(
                  /currentColor/g,
                  color,
                )}`,
            )
            .join(';'),
        )}"`;
      return `${attributeName(key)}="${escapeXml(
        String(value).replace(/currentColor/g, color),
      )}"`;
    })
    .join(' ');
  return `<${element.type}${attributes ? ` ${attributes}` : ''}>${vectorXml(
    element.props.children,
    color,
  )}</${element.type}>`;
}
export function sourceCustomIconXml(
  name: string,
  color = '#262626',
  variables: Readonly<Record<string, string>> = {},
): string | undefined {
  const definition = definitions[name];
  const lucide = SOURCE_LUCIDE_GEOMETRY[name];
  const lucideXml = lucide
    ? lucide.nodes
        .map(
          ([element, attributes]) =>
            `<${element} ${Object.entries(attributes)
              .filter(([key]) => key !== 'key')
              .map(
                ([key, value]) => `${attributeName(key)}="${escapeXml(value)}"`,
              )
              .join(' ')} />`,
        )
        .join('')
    : '';
  const xml = definition
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${
        definition.viewBox
      }" fill="none">${vectorXml(definition.render(), color)}</svg>`
    : lucide
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${escapeXml(
        color,
      )}" stroke-width="${
        lucide.strokeWidth
      }" stroke-linecap="round" stroke-linejoin="round">${lucideXml}</svg>`
    : undefined;
  const colors: Readonly<Record<string, string>> = {
    '--uc-surface': '#ffffff',
    '--uc-surface-raised': '#ffffff',
    '--uc-action': '#007a91',
    ...variables,
  };
  return xml?.replace(
    /var\(\s*([^,)]+)\s*(?:,\s*([^)]+))?\)/g,
    (_match, key: string, fallback?: string) => {
      const value = colors[key.trim()] ?? fallback?.trim();
      if (!value) throw new Error(`Unresolved Source icon color: ${key}`);
      return escapeXml(value);
    },
  );
}
export function SourceCustomIcon({
  name,
  color = '#262626',
  size = 24,
  width = size,
  height = size,
  tokens,
  variables,
}: {
  name: string;
  color?: string;
  size?: number;
  width?: number;
  height?: number;
  tokens?: Pick<ControlTokens, 'accent' | 'background' | 'surface'>;
  variables?: Readonly<Record<string, string>>;
}) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const xml = useMemo(() => {
    const original = sourceCustomIconXml(name, color, {
      ...(tokens
        ? {
            '--uc-action': tokens.accent,
            '--uc-surface': tokens.background,
            '--uc-surface-raised': tokens.surface,
          }
        : {}),
      ...variables,
    });
    return original
      ? namespaceSvgArtworkXml(original, `source-icon-${id}`)
      : undefined;
  }, [name, color, id, tokens, variables]);
  return xml ? <SvgXml xml={xml} width={width} height={height} /> : null;
}
