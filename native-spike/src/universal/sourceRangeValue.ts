export function sourceRangeValue(
  position: number,
  width: number,
  min: number,
  max: number,
  step: number,
) {
  const proportion = Math.max(
    0,
    Math.min(1, (position - 8) / Math.max(1, width - 16)),
  );
  return Math.max(
    min,
    Math.min(max, min + Math.round((proportion * (max - min)) / step) * step),
  );
}
