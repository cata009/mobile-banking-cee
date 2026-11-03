import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const GRID = 33;
const CELL = 6;

function finderCell(x: number, y: number, left: number, top: number) {
  const dx = x - left;
  const dy = y - top;
  if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
  return (
    dx === 0 ||
    dx === 6 ||
    dy === 0 ||
    dy === 6 ||
    (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
  );
}

function moduleIsDark(value: string, x: number, y: number) {
  const finders = [
    finderCell(x, y, 2, 2),
    finderCell(x, y, 24, 2),
    finderCell(x, y, 2, 24),
  ];
  const finder = finders.find(cell => cell !== null);
  if (finder !== undefined) return finder;
  let seed = 0;
  for (const char of value) seed = (seed * 33 + char.charCodeAt(0)) % 104729;
  const mixed = (seed + x * 157 + y * 293 + x * y * 17) % 104729;
  return mixed % 2 === 1;
}

/** Native renderer for the mCash QR preview. The Web build uses a scannable encoder. */
export function McashQrCode({ value }: { value: string }) {
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (moduleIsDark(value, x, y)) {
        cells.push(
          <Rect
            key={`${x}-${y}`}
            x={x * CELL}
            y={y * CELL}
            width={CELL}
            height={CELL}
            fill="#111111"
          />,
        );
      }
    }
  }
  return (
    <View
      testID="mcash-qr-code"
      accessibilityRole="image"
      accessibilityLabel="mCash QR code"
      style={{ width: GRID * CELL, height: GRID * CELL }}
    >
      <Svg
        width={GRID * CELL}
        height={GRID * CELL}
        viewBox={`0 0 ${GRID * CELL} ${GRID * CELL}`}
      >
        <Rect width="100%" height="100%" fill="#FFFFFF" />
        {cells}
      </Svg>
    </View>
  );
}
