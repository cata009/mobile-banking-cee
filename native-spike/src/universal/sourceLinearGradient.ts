type RGB8 = [number, number, number];
type Oklab = [number, number, number];

const NATIVE_GRADIENT_SEGMENTS = 16;

/**
 * Keep the browser's original Oklab gradient and approximate it on native with
 * RN-supported sRGB stops sampled uniformly along the same Oklab path.
 */
export function sourceLinearGradient(
  fromHex: string,
  toHex: string,
  platform: 'web' | 'native',
): string {
  const from = parseHexColor(fromHex);
  const to = parseHexColor(toHex);

  if (platform === 'web') {
    return `linear-gradient(to bottom right in oklab, ${fromHex} 0%, ${toHex} 100%)`;
  }

  const fromLab = srgbToOklab(from);
  const toLab = srgbToOklab(to);
  const stops = Array.from({length: NATIVE_GRADIENT_SEGMENTS + 1}, (_, index) => {
    const progress = index / NATIVE_GRADIENT_SEGMENTS;
    const color = oklabToSrgb([
      interpolate(fromLab[0], toLab[0], progress),
      interpolate(fromLab[1], toLab[1], progress),
      interpolate(fromLab[2], toLab[2], progress),
    ]);
    const position = progress * 100;

    return `${rgb8ToHex(color)} ${position}%`;
  });

  return `linear-gradient(to bottom right, ${stops.join(', ')})`;
}

function parseHexColor(hex: string): RGB8 {
  const value = hex.startsWith('#') ? hex.slice(1) : '';
  if (!/^[\da-f]{6}$/i.test(value)) {
    throw new TypeError(`Expected a six-digit hex color, received "${hex}"`);
  }

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function srgbToOklab([red8, green8, blue8]: RGB8): Oklab {
  const red = srgbByteToLinear(red8);
  const green = srgbByteToLinear(green8);
  const blue = srgbByteToLinear(blue8);

  const lightness = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const middle = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const short = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );

  return [
    0.2104542553 * lightness + 0.793617785 * middle - 0.0040720468 * short,
    1.9779984951 * lightness - 2.428592205 * middle + 0.4505937099 * short,
    0.0259040371 * lightness + 0.7827717662 * middle - 0.808675766 * short,
  ];
}

function oklabToSrgb([lightness, greenRed, yellowBlue]: Oklab): RGB8 {
  const lightnessRoot =
    lightness + 0.3963377774 * greenRed + 0.2158037573 * yellowBlue;
  const middleRoot =
    lightness - 0.1055613458 * greenRed - 0.0638541728 * yellowBlue;
  const shortRoot =
    lightness - 0.0894841775 * greenRed - 1.291485548 * yellowBlue;

  const lightnessCube = lightnessRoot ** 3;
  const middleCube = middleRoot ** 3;
  const shortCube = shortRoot ** 3;

  return [
    linearToSrgbByte(
      4.0767416621 * lightnessCube -
        3.3077115913 * middleCube +
        0.2309699292 * shortCube,
    ),
    linearToSrgbByte(
      -1.2684380046 * lightnessCube +
        2.6097574011 * middleCube -
        0.3413193965 * shortCube,
    ),
    linearToSrgbByte(
      -0.0041960863 * lightnessCube -
        0.7034186147 * middleCube +
        1.707614701 * shortCube,
    ),
  ];
}

function srgbByteToLinear(channel: number): number {
  const encoded = channel / 255;
  return encoded <= 0.04045
    ? encoded / 12.92
    : ((encoded + 0.055) / 1.055) ** 2.4;
}

function linearToSrgbByte(channel: number): number {
  const clamped = Math.max(0, Math.min(1, channel));
  const encoded =
    clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}

function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function rgb8ToHex([red, green, blue]: RGB8): string {
  return `#${[red, green, blue]
    .map(channel => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}
