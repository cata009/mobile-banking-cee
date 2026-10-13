/** Rendering geometry only, matching Source's monotone curve and current chart parameters. */
export type ChartCoordinate = { x: number; y: number };
export function monotoneChartPath(points: readonly ChartCoordinate[]): string {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  const slopes = points.map((point, index) => {
    if (index === 0 || index === points.length - 1) return 0;
    const before = points[index - 1]!,
      after = points[index + 1]!;
    const h0 = point.x - before.x,
      h1 = after.x - point.x;
    const s0 = (point.y - before.y) / (h0 || (h1 < 0 ? -0 : 0)),
      s1 = (after.y - point.y) / (h1 || (h0 < 0 ? -0 : 0));
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    return (
      (Math.sign(s0) + Math.sign(s1)) *
        Math.min(Math.abs(s0), Math.abs(s1), Math.abs(p) * 0.5) || 0
    );
  });
  const first = points[0]!,
    second = points[1]!,
    last = points.at(-1)!,
    penultimate = points.at(-2)!;
  if (points.length === 2) {
    const slope = (last.y - first.y) / (last.x - first.x || 1);
    slopes[0] = slope;
    slopes[1] = slope;
  } else {
    slopes[0] =
      ((3 * (second.y - first.y)) / (second.x - first.x || 1) - slopes[1]!) / 2;
    slopes[points.length - 1] =
      ((3 * (last.y - penultimate.y)) / (last.x - penultimate.x || 1) -
        slopes[points.length - 2]!) /
      2;
  }
  return (
    `M ${first.x} ${first.y}` +
    points
      .slice(1)
      .map((point, offset) => {
        const before = points[offset]!,
          dx = (point.x - before.x) / 3;
        return ` C ${before.x + dx} ${before.y + dx * slopes[offset]!} ${
          point.x - dx
        } ${point.y - dx * slopes[offset + 1]!} ${point.x} ${point.y}`;
      })
      .join('')
  );
}
export function formatChartAxis(value: number, range: number) {
  const absolute = Math.abs(value);
  const label =
    absolute >= 1000000
      ? `${Math.round(absolute / 1000000)}m`
      : absolute >= 1000
      ? `${(absolute / 1000)
          .toFixed(range < 1000 ? 2 : range < 10000 ? 1 : 0)
          .replace('.', ',')}k`
      : `${Math.round(absolute)}`;
  return value < 0 && label !== '0' ? `-${label}` : label;
}
