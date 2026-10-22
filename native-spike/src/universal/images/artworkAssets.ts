/** Lazy asset factories use the existing Metro SVG transformer; no XML copy or media conversion. */
const assets: Readonly<Record<string, () => string>> = {
  '0:10883': () => require('@/assets/design-system/images/payment-0-10883.svg'),
  '0:10891': () => require('@/assets/design-system/images/payment-0-10891.svg'),
  '0:10896': () => require('@/assets/design-system/images/payment-0-10896.svg'),
  '0:10901': () => require('@/assets/design-system/images/payment-0-10901.svg'),
  '0:10906': () => require('@/assets/design-system/images/payment-0-10906.svg'),
  '0:10911': () => require('@/assets/design-system/images/payment-0-10911.svg'),
  '0:10935': () => require('@/assets/design-system/images/payment-0-10935.svg'),
  '0:11201': () => require('@/assets/design-system/images/payment-0-11201.svg'),
  '0:11206': () => require('@/assets/design-system/images/payment-0-11206.svg'),
  '1247:5926': () =>
    require('@/assets/design-system/images/payment-1247-5926.svg'),
  '1312:2820': () =>
    require('@/assets/design-system/images/payment-1312-2820.svg'),
  '1314:2844': () =>
    require('@/assets/design-system/images/payment-1314-2844.svg'),
  '7957:7558': () =>
    require('@/assets/design-system/images/payment-7957-7558.svg'),
  '1272:8696': () =>
    require('@/assets/design-system/images/card-1272-8696.svg'),
  '1272:9371': () =>
    require('@/assets/design-system/images/card-1272-9371.svg'),
  '1272:9526': () =>
    require('@/assets/design-system/images/card-1272-9526.svg'),
  '1272:10297': () =>
    require('@/assets/design-system/images/card-1272-10297.svg'),
  '1272:10443': () =>
    require('@/assets/design-system/images/card-1272-10443.svg'),
  '1272:10574': () =>
    require('@/assets/design-system/images/card-1272-10574.svg'),
  '1272:11221': () =>
    require('@/assets/design-system/images/card-1272-11221.svg'),
  '1449:13520': () =>
    require('@/assets/design-system/images/card-1449-13520.svg'),
  '1449:14163': () =>
    require('@/assets/design-system/images/card-1449-14163.svg'),
  '1449:15533': () =>
    require('@/assets/design-system/images/card-1449-15533.svg'),
  '1449:15710': () =>
    require('@/assets/design-system/images/card-1449-15710.svg'),
  '1449:15921': () =>
    require('@/assets/design-system/images/card-1449-15921.svg'),
  '1449:16086': () =>
    require('@/assets/design-system/images/card-1449-16086.svg'),
  '1449:15401': () =>
    require('@/assets/design-system/images/card-1449-15401.svg'),
  '1272:11853': () =>
    require('@/assets/design-system/images/card-1272-11853.svg'),
  '1272:11992': () =>
    require('@/assets/design-system/images/card-1272-11992.svg'),
  '1272:12236': () =>
    require('@/assets/design-system/images/card-1272-12236.svg'),
  '1272:35505': () =>
    require('@/assets/design-system/images/card-1272-35505.svg'),
  '1448:46847': () =>
    require('@/assets/design-system/images/card-1448-46847.svg'),
  '1448:47165': () =>
    require('@/assets/design-system/images/card-1448-47165.svg'),
  '1448:47281': () =>
    require('@/assets/design-system/images/card-1448-47281.svg'),
  '1448:47447': () =>
    require('@/assets/design-system/images/card-1448-47447.svg'),
  '1917:5319': () =>
    require('@/assets/design-system/images/card-1917-5319.svg'),
  '2129:1022': () =>
    require('@/assets/design-system/images/card-2129-1022.svg'),
  '2240:1757': () =>
    require('@/assets/design-system/images/card-2240-1757.svg'),
  '7130:2301': () =>
    require('@/assets/design-system/images/card-7130-2301.svg'),
  '7130:3384': () =>
    require('@/assets/design-system/images/card-7130-3384.svg'),
  '7130:3303': () =>
    require('@/assets/design-system/images/card-7130-3303.svg'),
  '2028:337': () => require('@/assets/design-system/images/card-2028-337.svg'),
};
export function getArtworkAsset(nodeId: string): string {
  const load = assets[nodeId];
  if (!load) throw new RangeError(`Unknown original image artwork ${nodeId}`);
  return load();
}
