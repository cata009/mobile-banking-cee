import asset0 from '@/assets/design-system/images/payment-0-10883.svg'
import asset1 from '@/assets/design-system/images/payment-0-10891.svg'
import asset2 from '@/assets/design-system/images/payment-0-10896.svg'
import asset3 from '@/assets/design-system/images/payment-0-10901.svg'
import asset4 from '@/assets/design-system/images/payment-0-10906.svg'
import asset5 from '@/assets/design-system/images/payment-0-10911.svg'
import asset6 from '@/assets/design-system/images/payment-0-10935.svg'
import asset7 from '@/assets/design-system/images/payment-0-11201.svg'
import asset8 from '@/assets/design-system/images/payment-0-11206.svg'
import asset9 from '@/assets/design-system/images/payment-1247-5926.svg'
import asset10 from '@/assets/design-system/images/payment-1312-2820.svg'
import asset11 from '@/assets/design-system/images/payment-1314-2844.svg'
import asset12 from '@/assets/design-system/images/payment-7957-7558.svg'
import asset13 from '@/assets/design-system/images/card-1272-8696.svg'
import asset14 from '@/assets/design-system/images/card-1272-9371.svg'
import asset15 from '@/assets/design-system/images/card-1272-9526.svg'
import asset16 from '@/assets/design-system/images/card-1272-10297.svg'
import asset17 from '@/assets/design-system/images/card-1272-10443.svg'
import asset18 from '@/assets/design-system/images/card-1272-10574.svg'
import asset19 from '@/assets/design-system/images/card-1272-11221.svg'
import asset20 from '@/assets/design-system/images/card-1449-13520.svg'
import asset21 from '@/assets/design-system/images/card-1449-14163.svg'
import asset22 from '@/assets/design-system/images/card-1449-15533.svg'
import asset23 from '@/assets/design-system/images/card-1449-15710.svg'
import asset24 from '@/assets/design-system/images/card-1449-15921.svg'
import asset25 from '@/assets/design-system/images/card-1449-16086.svg'
import asset26 from '@/assets/design-system/images/card-1449-15401.svg'
import asset27 from '@/assets/design-system/images/card-1272-11853.svg'
import asset28 from '@/assets/design-system/images/card-1272-11992.svg'
import asset29 from '@/assets/design-system/images/card-1272-12236.svg'
import asset30 from '@/assets/design-system/images/card-1272-35505.svg'
import asset31 from '@/assets/design-system/images/card-1448-46847.svg'
import asset32 from '@/assets/design-system/images/card-1448-47165.svg'
import asset33 from '@/assets/design-system/images/card-1448-47281.svg'
import asset34 from '@/assets/design-system/images/card-1448-47447.svg'
import asset35 from '@/assets/design-system/images/card-1917-5319.svg'
import asset36 from '@/assets/design-system/images/card-2129-1022.svg'
import asset37 from '@/assets/design-system/images/card-2240-1757.svg'
import asset38 from '@/assets/design-system/images/card-7130-2301.svg'
import asset39 from '@/assets/design-system/images/card-7130-3384.svg'
import asset40 from '@/assets/design-system/images/card-7130-3303.svg'
import asset41 from '@/assets/design-system/images/card-2028-337.svg'

const assets: Readonly<Record<string, string>> = {
  '0:10883': asset0,
  '0:10891': asset1,
  '0:10896': asset2,
  '0:10901': asset3,
  '0:10906': asset4,
  '0:10911': asset5,
  '0:10935': asset6,
  '0:11201': asset7,
  '0:11206': asset8,
  '1247:5926': asset9,
  '1312:2820': asset10,
  '1314:2844': asset11,
  '7957:7558': asset12,
  '1272:8696': asset13,
  '1272:9371': asset14,
  '1272:9526': asset15,
  '1272:10297': asset16,
  '1272:10443': asset17,
  '1272:10574': asset18,
  '1272:11221': asset19,
  '1449:13520': asset20,
  '1449:14163': asset21,
  '1449:15533': asset22,
  '1449:15710': asset23,
  '1449:15921': asset24,
  '1449:16086': asset25,
  '1449:15401': asset26,
  '1272:11853': asset27,
  '1272:11992': asset28,
  '1272:12236': asset29,
  '1272:35505': asset30,
  '1448:46847': asset31,
  '1448:47165': asset32,
  '1448:47281': asset33,
  '1448:47447': asset34,
  '1917:5319': asset35,
  '2129:1022': asset36,
  '2240:1757': asset37,
  '7130:2301': asset38,
  '7130:3384': asset39,
  '7130:3303': asset40,
  '2028:337': asset41,
}

export function getArtworkAsset(nodeId: string): string {
  const asset = assets[nodeId]
  if (!asset) throw new RangeError(`Unknown original image artwork ${nodeId}`)
  return asset
}
