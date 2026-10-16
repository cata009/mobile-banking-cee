import palette from './sourcePalette.json';

/** Computed Source theme variables captured from the unchanged 4004 application. */
export function sourceColor(expression: string, dark = false): string {
  const colors: Record<string, string> = palette[dark ? 'dark' : 'light'];
  return expression
    .replace(
      /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g,
      (_match, name: string, fallback?: string) => {
        const value = colors[name] || fallback;
        if (!value) throw new Error(`Unknown Source theme variable ${name}`);
        return value;
      },
    )
    .replace(
      /rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\/\s*([\d.]+)\s*\)/g,
      'rgba($1,$2,$3,$4)',
    );
}
