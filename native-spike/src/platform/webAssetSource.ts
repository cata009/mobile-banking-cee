interface RegisteredWebAsset {
  httpServerLocation: string;
  name: string;
  type: string;
  width: number;
  height: number;
  scales: readonly number[];
}

/** Match RN Web Image's registered-asset URI and nearest-density selection. */
export function registeredWebAssetSource(asset: RegisteredWebAsset | undefined, preferredScale: number) {
  if (!asset) return null;
  const scale = asset.scales.reduce((nearest, candidate) => Math.abs(candidate - preferredScale) < Math.abs(nearest - preferredScale) ? candidate : nearest, asset.scales[0] ?? 1);
  const suffix = scale === 1 ? '' : `@${scale}x`;
  return { uri: `${asset.httpServerLocation}/${asset.name}${suffix}.${asset.type}`, width: asset.width, height: asset.height, scale };
}
