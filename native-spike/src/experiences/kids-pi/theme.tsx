import React from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { getHuTheme, type HuThemeId } from '@/app/screens/kids/hu/theme';
import { SOURCE_KIDS_COLORS } from './themeColors';
function splitTopLevel(input: string) {
  const parts: string[] = [];
  let depth = 0,
    start = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '(') depth++;
    else if (input[i] === ')') depth--;
    else if (input[i] === ',' && depth === 0) {
      parts.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(input.slice(start).trim());
  return parts;
}
function rgba(input: string): number[] {
  if (input.startsWith('#')) {
    const value = input.slice(1);
    const full =
      value.length === 3
        ? value
            .split('')
            .map(c => c + c)
            .join('')
        : value;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
      1,
    ];
  }
  if (input === 'transparent') return [0, 0, 0, 0];
  const parsed = input.match(/[\d.]+/g)?.map(Number);
  if (parsed && parsed.length >= 3)
    return [...parsed.slice(0, 3), parsed[3] ?? 1];
  throw new Error(`Unsupported Source Kids color ${input}`);
}
export function resolveKidsColor(
  input: string,
  variables: Readonly<Record<string, string>> = SOURCE_KIDS_COLORS,
): string {
  const value = input.trim();
  if (value.startsWith('var(')) {
    const key = value.slice(4, -1).trim(),
      replacement = variables[key];
    if (!replacement) throw new Error(`Missing Source Kids token ${key}`);
    return resolveKidsColor(replacement, variables);
  }
  if (value.startsWith('color-mix(')) {
    const terms = splitTopLevel(value.slice(10, -1)).slice(1);
    const first = terms[0].match(/^(.*?)\s+([\d.]+)%$/),
      second = terms[1].match(/^(.*?)\s+([\d.]+)%$/);
    const weight = first
      ? Number(first[2]) / 100
      : second
      ? 1 - Number(second[2]) / 100
      : 0.5;
    const a = rgba(resolveKidsColor(first ? first[1] : terms[0], variables)),
      b = rgba(resolveKidsColor(second ? second[1] : terms[1], variables));
    const alpha = a[3] * weight + b[3] * (1 - weight);
    const channels = a
      .slice(0, 3)
      .map((channel, i) =>
        Math.round(
          alpha
            ? (channel * a[3] * weight + b[i] * b[3] * (1 - weight)) / alpha
            : 0,
        ),
      );
    return `rgba(${channels.join(',')},${alpha})`;
  }
  return value;
}
export function sourceThemeGradient(
  input: string,
  height = 600,
): { color: string; offset: number }[] {
  if (!input.startsWith('linear-gradient(')) return [];
  const stops = splitTopLevel(input.slice(16, -1)).slice(1);
  return stops.map((stop, index) => {
    const match = stop.match(/^(.*?)\s+([\d.]+)(px|%)$/);
    return {
      color: resolveKidsColor(match ? match[1] : stop),
      offset: match
        ? Number(match[2]) / (match[3] === 'px' ? height : 100)
        : index / (stops.length - 1),
    };
  });
}
export function KidsThemeBackdrop({
  themeId,
  height,
}: {
  themeId: string;
  height: number;
}) {
  const theme = getHuTheme(themeId as HuThemeId),
    stops = sourceThemeGradient(theme.pageBackground, height);
  const id = React.useId().replace(/[^a-z0-9]/gi, '');
  if (!stops.length) return null;
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map((stop, index) => (
            <Stop
              key={index}
              offset={Math.max(0, Math.min(1, stop.offset))}
              stopColor={stop.color}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
export function kidsThemeAccent(themeId: string) {
  const theme = getHuTheme(themeId as HuThemeId);
  return resolveKidsColor(theme.accentStrong ?? theme.accent, {
    ...SOURCE_KIDS_COLORS,
    '--hu-theme-accent': theme.accent,
  });
}
