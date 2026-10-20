import React from 'react';
import { View } from 'react-native';
import { resolveCanonicalIcon } from '@/app/components/contracts/canonicalIcons';
import type { CanonicalIconLayer } from '@/app/components/contracts/canonicalIcons';
import { VectorArtworkLayer } from './VectorArtworkLayer';
import { SourceCustomIcon } from './SourceCustomIcon';
import { Text } from './Typography';

import asset0 from '@/assets/design-system/icons/variant-10183-65552.svg';
import asset1 from '@/assets/design-system/icons/variant-10183-65555.svg';
import asset2 from '@/assets/design-system/icons/variant-10183-65558.svg';
import asset3 from '@/assets/design-system/icons/variant-10183-65565.svg';
import asset4 from '@/assets/design-system/icons/variant-10183-65568.svg';
import asset5 from '@/assets/design-system/icons/variant-10183-65573.svg';
import asset6 from '@/assets/design-system/icons/variant-10183-65576.svg';
import asset7 from '@/assets/design-system/icons/variant-10183-65579.svg';
import asset8 from '@/assets/design-system/icons/variant-10183-65586.svg';
import asset9 from '@/assets/design-system/icons/variant-10183-65589.svg';
import asset10 from '@/assets/design-system/icons/variant-10183-65594.svg';
import asset11 from '@/assets/design-system/icons/variant-10183-65597.svg';
import asset12 from '@/assets/design-system/icons/variant-10183-65600.svg';
import asset13 from '@/assets/design-system/icons/variant-10183-65604.svg';
import asset14 from '@/assets/design-system/icons/variant-10183-65607.svg';
import asset15 from '@/assets/design-system/icons/variant-10183-65615.svg';
import asset16 from '@/assets/design-system/icons/variant-10183-65618.svg';
import asset17 from '@/assets/design-system/icons/variant-10183-65621.svg';
import asset18 from '@/assets/design-system/icons/variant-10183-65628.svg';
import asset19 from '@/assets/design-system/icons/variant-10183-65631.svg';
import asset20 from '@/assets/design-system/icons/variant-10183-65636.svg';
import asset21 from '@/assets/design-system/icons/variant-10183-65639.svg';
import asset22 from '@/assets/design-system/icons/variant-10183-65642.svg';
import asset23 from '@/assets/design-system/icons/variant-10183-65646.svg';
import asset24 from '@/assets/design-system/icons/variant-10183-65649.svg';
import asset25 from '@/assets/design-system/icons/variant-10183-65657.svg';
import asset26 from '@/assets/design-system/icons/variant-10183-65660.svg';
import asset27 from '@/assets/design-system/icons/variant-10183-65663.svg';
import asset28 from '@/assets/design-system/icons/variant-10183-65670.svg';
import asset29 from '@/assets/design-system/icons/variant-10183-65673.svg';
import asset30 from '@/assets/design-system/icons/variant-10183-65678.svg';
import asset31 from '@/assets/design-system/icons/variant-10183-65681.svg';
import asset32 from '@/assets/design-system/icons/variant-10183-65684.svg';
import asset33 from '@/assets/design-system/icons/variant-10183-65688.svg';
import asset34 from '@/assets/design-system/icons/variant-10183-65691.svg';
import asset35 from '@/assets/design-system/icons/variant-10183-65699.svg';
import asset36 from '@/assets/design-system/icons/variant-10183-65705.svg';
import asset37 from '@/assets/design-system/icons/variant-10183-65711.svg';
import asset38 from '@/assets/design-system/icons/variant-10183-65724.svg';
import asset39 from '@/assets/design-system/icons/variant-10183-65730.svg';
import asset40 from '@/assets/design-system/icons/variant-10183-65759.svg';
import asset41 from '@/assets/design-system/icons/variant-10183-65762.svg';
import asset42 from '@/assets/design-system/icons/variant-10183-65765.svg';
import asset43 from '@/assets/design-system/icons/variant-10183-65772.svg';
import asset44 from '@/assets/design-system/icons/variant-10183-65775.svg';
import asset45 from '@/assets/design-system/icons/variant-10183-65780.svg';
import asset46 from '@/assets/design-system/icons/variant-10183-65783.svg';
import asset47 from '@/assets/design-system/icons/variant-10183-65786.svg';
import asset48 from '@/assets/design-system/icons/variant-10183-65790.svg';
import asset49 from '@/assets/design-system/icons/variant-10183-65793.svg';
import asset50 from '@/assets/design-system/icons/variant-10183-65801.svg';
import asset51 from '@/assets/design-system/icons/variant-10183-65804.svg';
import asset52 from '@/assets/design-system/icons/variant-10183-65807.svg';
import asset53 from '@/assets/design-system/icons/variant-10183-65811.svg';
import asset54 from '@/assets/design-system/icons/variant-10183-65814.svg';
import asset55 from '@/assets/design-system/icons/variant-10183-65822.svg';
import asset56 from '@/assets/design-system/icons/variant-10183-65833.svg';
import asset57 from '@/assets/design-system/icons/variant-10183-65844.svg';
import asset58 from '@/assets/design-system/icons/variant-10183-65856.svg';
import asset59 from '@/assets/design-system/icons/variant-10183-65867.svg';
import asset60 from '@/assets/design-system/icons/variant-10183-65891.svg';
import asset61 from '@/assets/design-system/icons/variant-10183-65894.svg';
import asset62 from '@/assets/design-system/icons/variant-10183-65897.svg';
import asset63 from '@/assets/design-system/icons/variant-10183-65901.svg';
import asset64 from '@/assets/design-system/icons/variant-10183-65904.svg';
import asset65 from '@/assets/design-system/icons/variant-10183-65912.svg';
import asset66 from '@/assets/design-system/icons/variant-10183-65918.svg';
import asset67 from '@/assets/design-system/icons/variant-10183-65924.svg';
import asset68 from '@/assets/design-system/icons/variant-10183-65931.svg';
import asset69 from '@/assets/design-system/icons/variant-10183-65937.svg';
import asset70 from '@/assets/design-system/icons/variant-10183-65951.svg';
import asset71 from '@/assets/design-system/icons/variant-10183-65954.svg';
import asset72 from '@/assets/design-system/icons/variant-10183-65957.svg';
import asset73 from '@/assets/design-system/icons/variant-10183-65961.svg';
import asset74 from '@/assets/design-system/icons/variant-10183-65964.svg';
import asset75 from '@/assets/design-system/icons/variant-10183-65972.svg';
import asset76 from '@/assets/design-system/icons/variant-10183-65978.svg';
import asset77 from '@/assets/design-system/icons/variant-10183-65984.svg';
import asset78 from '@/assets/design-system/icons/variant-10183-65997.svg';
import asset79 from '@/assets/design-system/icons/variant-10183-66003.svg';
import asset80 from '@/assets/design-system/icons/variant-10183-66011.svg';
import asset81 from '@/assets/design-system/icons/variant-10183-66014.svg';
import asset82 from '@/assets/design-system/icons/variant-10183-66017.svg';
import asset83 from '@/assets/design-system/icons/variant-10183-66021.svg';
import asset84 from '@/assets/design-system/icons/variant-10183-66024.svg';
import asset85 from '@/assets/design-system/icons/variant-10183-66032.svg';
import asset86 from '@/assets/design-system/icons/variant-10183-66035.svg';
import asset87 from '@/assets/design-system/icons/variant-10183-66038.svg';
import asset88 from '@/assets/design-system/icons/variant-10183-66042.svg';
import asset89 from '@/assets/design-system/icons/variant-10183-66045.svg';
import asset90 from '@/assets/design-system/icons/variant-10183-66053.svg';
import asset91 from '@/assets/design-system/icons/variant-10183-66061.svg';
import asset92 from '@/assets/design-system/icons/variant-10183-66069.svg';
import asset93 from '@/assets/design-system/icons/variant-10183-66086.svg';
import asset94 from '@/assets/design-system/icons/variant-10183-66094.svg';
import asset95 from '@/assets/design-system/icons/variant-10183-66104.svg';
import asset96 from '@/assets/design-system/icons/variant-10183-66113.svg';
import asset97 from '@/assets/design-system/icons/variant-10183-66132.svg';
import asset98 from '@/assets/design-system/icons/variant-10183-66141.svg';
import asset99 from '@/assets/design-system/icons/variant-10183-60919.svg';
import asset100 from '@/assets/design-system/icons/variant-10183-60927.svg';
import asset101 from '@/assets/design-system/icons/variant-10183-60923.svg';
import asset102 from '@/assets/design-system/icons/variant-10183-62782.svg';
import asset103 from '@/assets/design-system/icons/variant-10183-62790.svg';
import asset104 from '@/assets/design-system/icons/variant-10183-62799.svg';
import asset105 from '@/assets/design-system/icons/variant-10183-62807.svg';
import asset106 from '@/assets/design-system/icons/variant-10183-62815-layer-0.svg';
import asset107 from '@/assets/design-system/icons/variant-10183-62815-layer-1.svg';
import asset108 from '@/assets/design-system/icons/variant-10183-62823.svg';
import asset109 from '@/assets/design-system/icons/variant-10183-62963.svg';
import asset110 from '@/assets/design-system/icons/variant-10183-62979-layer-1.svg';
import asset111 from '@/assets/design-system/icons/variant-10183-62979-layer-2.svg';
import asset112 from '@/assets/design-system/icons/variant-10183-62886.svg';
import asset113 from '@/assets/design-system/icons/variant-10183-62944.svg';
import extra0 from '@/assets/design-system/icons/brand-10141-39886-0.svg';
import extra1 from '@/assets/design-system/icons/brand-10141-39886-1.svg';
import extra2 from '@/assets/design-system/icons/brand-10141-39886-2.svg';
import extra3 from '@/assets/design-system/icons/brand-10141-39886-3.svg';
import extra4 from '@/assets/design-system/icons/brand-10141-39886-4.svg';
import extra5 from '@/assets/design-system/icons/brand-10141-39886-5.svg';
import extra6 from '@/assets/design-system/icons/brand-10141-39886-6.svg';
import extra7 from '@/assets/design-system/icons/brand-10141-39886-7.svg';
import extra8 from '@/assets/design-system/icons/brand-10141-39886-8.svg';
import extra9 from '@/assets/design-system/icons/brand-10141-39886-9.svg';
import extra10 from '@/assets/design-system/icons/brand-10141-39886-10.svg';
import extra11 from '@/assets/design-system/icons/brand-10141-39886-11.svg';
import extra12 from '@/assets/design-system/icons/brand-10141-39886-12.svg';
import extra13 from '@/assets/design-system/icons/brand-10141-39886-13.svg';
import extra14 from '@/assets/design-system/icons/brand-10141-39886-14.svg';
import extra15 from '@/assets/design-system/icons/brand-10141-39886-15.svg';
import extra16 from '@/assets/design-system/icons/brand-10141-39899-0.svg';
import extra17 from '@/assets/design-system/icons/brand-10141-39924-0.svg';
import extra18 from '@/assets/design-system/icons/brand-10141-39949-0.svg';
import extra19 from '@/assets/design-system/icons/brand-10141-39949-1.svg';
import extra20 from '@/assets/design-system/icons/brand-10141-39967-0.svg';
import extra21 from '@/assets/design-system/icons/brand-10141-39967-1.svg';
import extra22 from '@/assets/design-system/icons/brand-10141-39985-0.svg';
import extra23 from '@/assets/design-system/icons/brand-10141-39985-1.svg';
import extra24 from '@/assets/design-system/icons/brand-10141-39985-2.svg';
import extra25 from '@/assets/design-system/icons/brand-10141-39985-3.svg';
import extra26 from '@/assets/design-system/icons/brand-10141-39985-4.svg';
import extra27 from '@/assets/design-system/icons/brand-10141-39985-5.svg';
import extra28 from '@/assets/design-system/icons/brand-10141-39985-6.svg';
import extra29 from '@/assets/design-system/icons/brand-10141-39985-7.svg';
import extra30 from '@/assets/design-system/icons/brand-10141-39985-8.svg';
import extra31 from '@/assets/design-system/icons/brand-10141-39985-9.svg';
import extra32 from '@/assets/design-system/icons/brand-10141-39985-10.svg';
import extra33 from '@/assets/design-system/icons/brand-10141-39985-11.svg';
import extra34 from '@/assets/design-system/icons/brand-10141-39985-12.svg';
import extra35 from '@/assets/design-system/icons/brand-10141-39985-13.svg';
import extra36 from '@/assets/design-system/icons/brand-10141-39985-14.svg';
import extra37 from '@/assets/design-system/icons/brand-10141-39985-15.svg';
import extra38 from '@/assets/design-system/icons/brand-10141-40013-0.svg';
import extra39 from '@/assets/design-system/icons/brand-10141-40013-1.svg';
import extra40 from '@/assets/design-system/icons/brand-10141-40063-0.svg';
import extra41 from '@/assets/design-system/icons/brand-10141-40063-1.svg';
import extra42 from '@/assets/design-system/icons/brand-10141-40063-2.svg';
import extra43 from '@/assets/design-system/icons/brand-10141-40063-3.svg';
import extra44 from '@/assets/design-system/icons/brand-10141-40063-4.svg';
import extra45 from '@/assets/design-system/icons/brand-10141-40063-5.svg';
import extra46 from '@/assets/design-system/icons/brand-10141-40063-6.svg';
import extra47 from '@/assets/design-system/icons/brand-10141-40063-7.svg';
import extra48 from '@/assets/design-system/icons/brand-10141-40063-8.svg';
import extra49 from '@/assets/design-system/icons/brand-10141-40063-9.svg';
import extra50 from '@/assets/design-system/icons/brand-10141-40095-0.svg';
import extra51 from '@/assets/design-system/icons/brand-10141-40095-1.svg';
import extra52 from '@/assets/design-system/icons/brand-10141-40095-2.svg';
import extra53 from '@/assets/design-system/icons/brand-10141-40095-3.svg';
import extra54 from '@/assets/design-system/icons/brand-10141-40095-4.svg';
import extra55 from '@/assets/design-system/icons/brand-10141-40095-5.svg';
import extra56 from '@/assets/design-system/icons/brand-10141-40095-6.svg';
import extra57 from '@/assets/design-system/icons/brand-10141-40095-7.svg';
import extra58 from '@/assets/design-system/icons/brand-10141-40095-8.svg';
import extra59 from '@/assets/design-system/icons/brand-10141-40095-9.svg';
import extra60 from '@/assets/design-system/icons/brand-10141-40095-10.svg';
import extra61 from '@/assets/design-system/icons/brand-10141-40095-11.svg';
import extra62 from '@/assets/design-system/icons/brand-10141-40095-12.svg';
import extra63 from '@/assets/design-system/icons/brand-10141-40095-13.svg';
import extra64 from '@/assets/design-system/icons/brand-10141-40095-14.svg';
import extra65 from '@/assets/design-system/icons/brand-10141-40095-15.svg';
import extra66 from '@/assets/design-system/icons/brand-10141-40109-0.svg';
import extra67 from '@/assets/design-system/icons/brand-10141-40109-1.svg';
import extra68 from '@/assets/design-system/icons/brand-10141-40109-2.svg';
import extra69 from '@/assets/design-system/icons/brand-10141-40109-3.svg';
import extra70 from '@/assets/design-system/icons/brand-10141-40109-4.svg';
import extra71 from '@/assets/design-system/icons/brand-10141-40109-5.svg';
import extra72 from '@/assets/design-system/icons/brand-10141-40109-6.svg';
import extra73 from '@/assets/design-system/icons/brand-10141-40109-7.svg';
import extra74 from '@/assets/design-system/icons/brand-10141-40109-8.svg';
import extra75 from '@/assets/design-system/icons/brand-10141-40109-9.svg';
import extra76 from '@/assets/design-system/icons/brand-10141-40109-10.svg';
import extra77 from '@/assets/design-system/icons/brand-10141-40127-0.svg';
import extra78 from '@/assets/design-system/icons/brand-10141-40127-1.svg';
import extra79 from '@/assets/design-system/icons/brand-10141-40127-2.svg';
import extra80 from '@/assets/design-system/icons/brand-10141-40127-3.svg';
import extra81 from '@/assets/design-system/icons/brand-10141-40127-4.svg';
import extra82 from '@/assets/design-system/icons/brand-10141-40127-5.svg';
import extra83 from '@/assets/design-system/icons/brand-10141-40127-6.svg';
import extra84 from '@/assets/design-system/icons/brand-10141-40127-7.svg';
import extra85 from '@/assets/design-system/icons/brand-10141-40127-8.svg';
import extra86 from '@/assets/design-system/icons/brand-10141-40127-9.svg';
import extra87 from '@/assets/mobile-first/it/profile/token-imgVector.svg';
import extra88 from '@/assets/design-system/icons/brand-10141-40233-0.svg';
import extra89 from '@/assets/design-system/icons/brand-10183-65516-0.svg';
import extra90 from '@/assets/design-system/icons/brand-10183-65523-0.svg';
import extra91 from '@/assets/design-system/icons/brand-9382-18707-0.svg';
import extra92 from '@/assets/design-system/icons/brand-9382-18711-1.svg';
import extra93 from '@/assets/design-system/icons/brand-9382-18718-0.svg';
import extra94 from '@/assets/design-system/icons/brand-9382-18722-1.svg';
import extra95 from '@/assets/design-system/icons/brand-9382-18729-0.svg';
const assets: Readonly<Record<string, string | number>> = {
  'variant-10183-65552.svg': asset0,
  'variant-10183-65555.svg': asset1,
  'variant-10183-65558.svg': asset2,
  'variant-10183-65565.svg': asset3,
  'variant-10183-65568.svg': asset4,
  'variant-10183-65573.svg': asset5,
  'variant-10183-65576.svg': asset6,
  'variant-10183-65579.svg': asset7,
  'variant-10183-65586.svg': asset8,
  'variant-10183-65589.svg': asset9,
  'variant-10183-65594.svg': asset10,
  'variant-10183-65597.svg': asset11,
  'variant-10183-65600.svg': asset12,
  'variant-10183-65604.svg': asset13,
  'variant-10183-65607.svg': asset14,
  'variant-10183-65615.svg': asset15,
  'variant-10183-65618.svg': asset16,
  'variant-10183-65621.svg': asset17,
  'variant-10183-65628.svg': asset18,
  'variant-10183-65631.svg': asset19,
  'variant-10183-65636.svg': asset20,
  'variant-10183-65639.svg': asset21,
  'variant-10183-65642.svg': asset22,
  'variant-10183-65646.svg': asset23,
  'variant-10183-65649.svg': asset24,
  'variant-10183-65657.svg': asset25,
  'variant-10183-65660.svg': asset26,
  'variant-10183-65663.svg': asset27,
  'variant-10183-65670.svg': asset28,
  'variant-10183-65673.svg': asset29,
  'variant-10183-65678.svg': asset30,
  'variant-10183-65681.svg': asset31,
  'variant-10183-65684.svg': asset32,
  'variant-10183-65688.svg': asset33,
  'variant-10183-65691.svg': asset34,
  'variant-10183-65699.svg': asset35,
  'variant-10183-65705.svg': asset36,
  'variant-10183-65711.svg': asset37,
  'variant-10183-65724.svg': asset38,
  'variant-10183-65730.svg': asset39,
  'variant-10183-65759.svg': asset40,
  'variant-10183-65762.svg': asset41,
  'variant-10183-65765.svg': asset42,
  'variant-10183-65772.svg': asset43,
  'variant-10183-65775.svg': asset44,
  'variant-10183-65780.svg': asset45,
  'variant-10183-65783.svg': asset46,
  'variant-10183-65786.svg': asset47,
  'variant-10183-65790.svg': asset48,
  'variant-10183-65793.svg': asset49,
  'variant-10183-65801.svg': asset50,
  'variant-10183-65804.svg': asset51,
  'variant-10183-65807.svg': asset52,
  'variant-10183-65811.svg': asset53,
  'variant-10183-65814.svg': asset54,
  'variant-10183-65822.svg': asset55,
  'variant-10183-65833.svg': asset56,
  'variant-10183-65844.svg': asset57,
  'variant-10183-65856.svg': asset58,
  'variant-10183-65867.svg': asset59,
  'variant-10183-65891.svg': asset60,
  'variant-10183-65894.svg': asset61,
  'variant-10183-65897.svg': asset62,
  'variant-10183-65901.svg': asset63,
  'variant-10183-65904.svg': asset64,
  'variant-10183-65912.svg': asset65,
  'variant-10183-65918.svg': asset66,
  'variant-10183-65924.svg': asset67,
  'variant-10183-65931.svg': asset68,
  'variant-10183-65937.svg': asset69,
  'variant-10183-65951.svg': asset70,
  'variant-10183-65954.svg': asset71,
  'variant-10183-65957.svg': asset72,
  'variant-10183-65961.svg': asset73,
  'variant-10183-65964.svg': asset74,
  'variant-10183-65972.svg': asset75,
  'variant-10183-65978.svg': asset76,
  'variant-10183-65984.svg': asset77,
  'variant-10183-65997.svg': asset78,
  'variant-10183-66003.svg': asset79,
  'variant-10183-66011.svg': asset80,
  'variant-10183-66014.svg': asset81,
  'variant-10183-66017.svg': asset82,
  'variant-10183-66021.svg': asset83,
  'variant-10183-66024.svg': asset84,
  'variant-10183-66032.svg': asset85,
  'variant-10183-66035.svg': asset86,
  'variant-10183-66038.svg': asset87,
  'variant-10183-66042.svg': asset88,
  'variant-10183-66045.svg': asset89,
  'variant-10183-66053.svg': asset90,
  'variant-10183-66061.svg': asset91,
  'variant-10183-66069.svg': asset92,
  'variant-10183-66086.svg': asset93,
  'variant-10183-66094.svg': asset94,
  'variant-10183-66104.svg': asset95,
  'variant-10183-66113.svg': asset96,
  'variant-10183-66132.svg': asset97,
  'variant-10183-66141.svg': asset98,
  'variant-10183-60919.svg': asset99,
  'variant-10183-60927.svg': asset100,
  'variant-10183-60923.svg': asset101,
  'variant-10183-62782.svg': asset102,
  'variant-10183-62790.svg': asset103,
  'variant-10183-62799.svg': asset104,
  'variant-10183-62807.svg': asset105,
  'variant-10183-62815-layer-0.svg': asset106,
  'variant-10183-62815-layer-1.svg': asset107,
  'variant-10183-62823.svg': asset108,
  'variant-10183-62963.svg': asset109,
  'variant-10183-62979-layer-1.svg': asset110,
  'variant-10183-62979-layer-2.svg': asset111,
  'variant-10183-62886.svg': asset112,
  'variant-10183-62944.svg': asset113,
  'brand-10141-39886-0.svg': extra0,
  'brand-10141-39886-1.svg': extra1,
  'brand-10141-39886-2.svg': extra2,
  'brand-10141-39886-3.svg': extra3,
  'brand-10141-39886-4.svg': extra4,
  'brand-10141-39886-5.svg': extra5,
  'brand-10141-39886-6.svg': extra6,
  'brand-10141-39886-7.svg': extra7,
  'brand-10141-39886-8.svg': extra8,
  'brand-10141-39886-9.svg': extra9,
  'brand-10141-39886-10.svg': extra10,
  'brand-10141-39886-11.svg': extra11,
  'brand-10141-39886-12.svg': extra12,
  'brand-10141-39886-13.svg': extra13,
  'brand-10141-39886-14.svg': extra14,
  'brand-10141-39886-15.svg': extra15,
  'brand-10141-39899-0.svg': extra16,
  'brand-10141-39924-0.svg': extra17,
  'brand-10141-39949-0.svg': extra18,
  'brand-10141-39949-1.svg': extra19,
  'brand-10141-39967-0.svg': extra20,
  'brand-10141-39967-1.svg': extra21,
  'brand-10141-39985-0.svg': extra22,
  'brand-10141-39985-1.svg': extra23,
  'brand-10141-39985-2.svg': extra24,
  'brand-10141-39985-3.svg': extra25,
  'brand-10141-39985-4.svg': extra26,
  'brand-10141-39985-5.svg': extra27,
  'brand-10141-39985-6.svg': extra28,
  'brand-10141-39985-7.svg': extra29,
  'brand-10141-39985-8.svg': extra30,
  'brand-10141-39985-9.svg': extra31,
  'brand-10141-39985-10.svg': extra32,
  'brand-10141-39985-11.svg': extra33,
  'brand-10141-39985-12.svg': extra34,
  'brand-10141-39985-13.svg': extra35,
  'brand-10141-39985-14.svg': extra36,
  'brand-10141-39985-15.svg': extra37,
  'brand-10141-40013-0.svg': extra38,
  'brand-10141-40013-1.svg': extra39,
  'brand-10141-40063-0.svg': extra40,
  'brand-10141-40063-1.svg': extra41,
  'brand-10141-40063-2.svg': extra42,
  'brand-10141-40063-3.svg': extra43,
  'brand-10141-40063-4.svg': extra44,
  'brand-10141-40063-5.svg': extra45,
  'brand-10141-40063-6.svg': extra46,
  'brand-10141-40063-7.svg': extra47,
  'brand-10141-40063-8.svg': extra48,
  'brand-10141-40063-9.svg': extra49,
  'brand-10141-40095-0.svg': extra50,
  'brand-10141-40095-1.svg': extra51,
  'brand-10141-40095-2.svg': extra52,
  'brand-10141-40095-3.svg': extra53,
  'brand-10141-40095-4.svg': extra54,
  'brand-10141-40095-5.svg': extra55,
  'brand-10141-40095-6.svg': extra56,
  'brand-10141-40095-7.svg': extra57,
  'brand-10141-40095-8.svg': extra58,
  'brand-10141-40095-9.svg': extra59,
  'brand-10141-40095-10.svg': extra60,
  'brand-10141-40095-11.svg': extra61,
  'brand-10141-40095-12.svg': extra62,
  'brand-10141-40095-13.svg': extra63,
  'brand-10141-40095-14.svg': extra64,
  'brand-10141-40095-15.svg': extra65,
  'brand-10141-40109-0.svg': extra66,
  'brand-10141-40109-1.svg': extra67,
  'brand-10141-40109-2.svg': extra68,
  'brand-10141-40109-3.svg': extra69,
  'brand-10141-40109-4.svg': extra70,
  'brand-10141-40109-5.svg': extra71,
  'brand-10141-40109-6.svg': extra72,
  'brand-10141-40109-7.svg': extra73,
  'brand-10141-40109-8.svg': extra74,
  'brand-10141-40109-9.svg': extra75,
  'brand-10141-40109-10.svg': extra76,
  'brand-10141-40127-0.svg': extra77,
  'brand-10141-40127-1.svg': extra78,
  'brand-10141-40127-2.svg': extra79,
  'brand-10141-40127-3.svg': extra80,
  'brand-10141-40127-4.svg': extra81,
  'brand-10141-40127-5.svg': extra82,
  'brand-10141-40127-6.svg': extra83,
  'brand-10141-40127-7.svg': extra84,
  'brand-10141-40127-8.svg': extra85,
  'brand-10141-40127-9.svg': extra86,
  'brand-10141-40231-0.svg': extra87,
  'brand-10141-40233-0.svg': extra88,
  'brand-10183-65516-0.svg': extra89,
  'brand-10183-65523-0.svg': extra90,
  'brand-9382-18707-0.svg': extra91,
  'brand-9382-18711-1.svg': extra92,
  'brand-9382-18718-0.svg': extra93,
  'brand-9382-18722-1.svg': extra94,
  'brand-9382-18729-0.svg': extra95,
};

/** Source lookup/layout only; the existing vector renderer owns SVG decoding. */
export function BaselineCanonicalIcon({
  variantId,
  label,
  number = 1,
  business,
  product = true,
}: {
  variantId: string;
  label?: string;
  number?: string | number;
  business?: string;
  product?: boolean;
}) {
  const source = resolveCanonicalIcon(variantId);
  if (!source) return null;
  const existing = source.existing;
  return (
    <View
      testID="canonical-icon"
      accessible={Boolean(label)}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      style={{
        width: source.width,
        height: source.height,
        position: 'relative',
      }}
    >
      {source.shapes?.map((shape, index) => (
        <View
          key={`shape-${index}`}
          accessible={false}
          style={{
            position: 'absolute',
            left: shape.x,
            top: shape.y,
            width: shape.width,
            height: shape.height,
            borderRadius: shape.radius,
            backgroundColor: shape.color,
            borderWidth: shape.borderWidth,
            borderColor: shape.borderColor,
          }}
        />
      ))}
      {existing ? (
        <View
          style={{
            position: 'absolute',
            left: existing.x,
            top: existing.y,
            width: existing.size,
            height: existing.size,
          }}
        >
          <SourceCustomIcon
            name={existing.name}
            size={existing.size}
            color={existing.color}
          />
        </View>
      ) : (
        source.layers.map((layer, index) => (
          <CanonicalArtwork key={index} layer={layer} />
        ))
      )}
      {source.number ? (
        <Text
          testID="canonical-map-number"
          accessible={false}
          style={{
            position: 'absolute',
            left: source.number.x,
            top: source.number.y,
            minWidth: source.number.width,
            fontFamily: 'UniCredit-bold',
            fontSize: source.number.fontSize,
            lineHeight: source.number.height,
            letterSpacing: source.number.letterSpacing,
            color: '#FFFFFF',
          }}
        >
          {String(number)}
        </Text>
      ) : null}
      {source.texts?.map((text, index) =>
        !product && text.value === 'Business' ? null : (
          <Text
            key={index}
            testID={`canonical-source-text-${index}`}
            accessible={false}
            style={{
              position: 'absolute',
              right: source.width - text.x - text.width,
              top: text.y,
              minWidth: text.width,
              fontFamily: text.font,
              fontSize: text.fontSize,
              lineHeight: text.lineHeight ?? text.height,
              letterSpacing: text.letterSpacing,
              color: text.color,
            }}
          >
            {text.value === 'Business' ? business ?? text.value : text.value}
          </Text>
        ),
      )}
    </View>
  );
}

function CanonicalArtwork({ layer }: { layer: CanonicalIconLayer }) {
  const clip = layer.clip;
  const x = layer.x - (clip?.x ?? 0),
    y = layer.y - (clip?.y ?? 0);
  const scaleX = layer.scaleX ?? 1,
    scaleY = layer.scaleY ?? 1;
  const artwork =
    layer.rotate || scaleX !== 1 || scaleY !== 1 ? (
      <View
        style={{
          position: 'absolute',
          left: x + (layer.width * (scaleX - 1)) / 2,
          top: y + (layer.height * (scaleY - 1)) / 2,
          width: layer.width,
          height: layer.height,
          transform: [
            { rotate: `${layer.rotate ?? 0}deg` },
            { scaleX },
            { scaleY },
          ],
        }}
      >
        <VectorArtworkLayer
          asset={assets[layer.asset]}
          width={layer.width}
          height={layer.height}
        />
      </View>
    ) : (
      <VectorArtworkLayer
        asset={assets[layer.asset]}
        x={x}
        y={y}
        width={layer.width}
        height={layer.height}
      />
    );
  return clip ? (
    <View
      style={{
        position: 'absolute',
        left: clip.x,
        top: clip.y,
        width: clip.width,
        height: clip.height,
        overflow: 'hidden',
      }}
    >
      {artwork}
    </View>
  ) : (
    artwork
  );
}
