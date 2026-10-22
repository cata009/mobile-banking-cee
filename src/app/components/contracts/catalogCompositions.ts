/** Pure canonical source facts and controlled presentation contracts; no UI imports. */
export interface CatalogCompositionSource {
  familyId: string
  familyKey: string
  variantId: string
  key: string
  name: string
  page: string
  width: number
  height: number
  componentId: string
  status: 'implemented' | 'blocked' | 'excluded'
  reason: string | null
  missingImageHashes: readonly string[]
  instanceId: string
  presentationLimitations?: readonly string[]
}
export const CATALOG_COMPOSITION_SOURCES: readonly CatalogCompositionSource[] = [
  {
    familyId: '7467:13095',
    familyKey: '999cc77abb3c39306079055aeec54888ebd86725',
    variantId: '7467:13122',
    key: 'c51397138c50109c7375a91c4012260113cc30b0',
    name: 'Property 1=PI',
    page: 'Buttons',
    width: 78,
    height: 32,
    componentId: 'brand.prime-advisory',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10276:38456',
  },
  {
    familyId: '7467:13095',
    familyKey: '999cc77abb3c39306079055aeec54888ebd86725',
    variantId: '8969:3993',
    key: 'f9410e6e011c9ebf44df4f2cb59cd4aba5404a72',
    name: 'Property 1=SME',
    page: 'Buttons',
    width: 97,
    height: 32,
    componentId: 'brand.prime-advisory',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10276:38471',
  },
  {
    familyId: '8038:6624',
    familyKey: '7490ed66421ce1a7f749ca99aa51abb68bf62ed3',
    variantId: '8038:6624',
    key: '7490ed66421ce1a7f749ca99aa51abb68bf62ed3',
    name: 'Card payment images/Type14',
    page: 'Images',
    width: 219,
    height: 138,
    componentId: 'images.card-type14',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:47889',
  },
  {
    familyId: '1517:13080',
    familyKey: 'c448c6216cfd11bd4591528ce8be1c54074980d4',
    variantId: '1517:13081',
    key: 'de68303e46fe319faac4eb96518892533c04bee9',
    name: 'Style=White',
    page: 'Products & Services',
    width: 327,
    height: 56,
    componentId: 'products.company-selection',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:48464',
  },
  {
    familyId: '1517:13080',
    familyKey: 'c448c6216cfd11bd4591528ce8be1c54074980d4',
    variantId: '1517:13087',
    key: '9fa8535103fe8e4486d74d6bafe72a28f957d5a2',
    name: 'Style=Grey',
    page: 'Products & Services',
    width: 327,
    height: 56,
    componentId: 'products.company-selection',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:48473',
  },
  {
    familyId: '1517:12815',
    familyKey: 'c0ed51331474885b19b43b85d6363e9ca8206cf7',
    variantId: '1517:12816',
    key: '75a94d1a8902a25ad11e562aa58f2bb65ed82906',
    name: 'Style=PI app, Type=Title 1',
    page: 'Products & Services',
    width: 343,
    height: 120,
    componentId: 'payments.card-payment',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:50048',
  },
  {
    familyId: '1517:12815',
    familyKey: 'c0ed51331474885b19b43b85d6363e9ca8206cf7',
    variantId: '1517:12824',
    key: 'c5e5572773d0736ffa717a268979bc01ec7d6812',
    name: 'Style=PI app, Type=Title 2',
    page: 'Products & Services',
    width: 343,
    height: 120,
    componentId: 'payments.card-payment',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:50066',
  },
  {
    familyId: '1517:12815',
    familyKey: 'c0ed51331474885b19b43b85d6363e9ca8206cf7',
    variantId: '1518:3435',
    key: '09c12b4562e79871162ba4ed21fbca7ad5e5fabb',
    name: 'Style=SME app, Type=Title 2',
    page: 'Products & Services',
    width: 343,
    height: 120,
    componentId: 'payments.card-payment',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:50084',
  },
  {
    familyId: '1517:12815',
    familyKey: 'c0ed51331474885b19b43b85d6363e9ca8206cf7',
    variantId: '1518:3464',
    key: 'f3b896f33212063f2f222949520eb0f94c96953e',
    name: 'Style=SME app, Type=Title 1',
    page: 'Products & Services',
    width: 343,
    height: 120,
    componentId: 'payments.card-payment',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:50101',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '715:8125',
    key: 'bfeb0952e60eab9a784a84928a60f00bd00586dd',
    name: 'Type=Breakdown',
    page: 'PFM & Data Display',
    width: 375,
    height: 188,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55603',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '1518:4734',
    key: 'fb4039383442fbcdc0b553eec55fd372f89488d3',
    name: 'Type=Savings',
    page: 'PFM & Data Display',
    width: 375,
    height: 188,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55632',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '715:8151',
    key: '47129f36336d507dfc26801d6fad3d6c9731604d',
    name: 'Type=Financial report',
    page: 'PFM & Data Display',
    width: 375,
    height: 188,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55657',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '1518:4781',
    key: 'e2fd07eed3aa74f72079a579fc24afee3947fbbf',
    name: 'Type=Loan',
    page: 'PFM & Data Display',
    width: 375,
    height: 188,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55681',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '715:8184',
    key: '96740947ae18941f7835c1f543e98d14fdb04ca1',
    name: 'Type=Orizontal yearly overview',
    page: 'PFM & Data Display',
    width: 375,
    height: 182,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55692',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '7047:1937',
    key: '39787cab47503d1d1fbd4b5c1cfb9e671eb124ce',
    name: 'Type=CZ/SK Monthly overview_3 categories',
    page: 'PFM & Data Display',
    width: 375,
    height: 328,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55712',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '7160:1522',
    key: '959eae511063798aabfd490a050965166c504389',
    name: 'Type=CZ/SK  Monthly overview_5 categories',
    page: 'PFM & Data Display',
    width: 375,
    height: 328,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55732',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '7160:1551',
    key: '75235963ed299a43b4b45adf0c0781d249144ddc',
    name: 'Type=CZ/SK Monthly overview_7 categories max',
    page: 'PFM & Data Display',
    width: 375,
    height: 328,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55761',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '7064:1461',
    key: '05fe70824c3cdcb4da0b9202d4d229973b44df1b',
    name: 'Type=CZ/SK Monthly overview_1 category',
    page: 'PFM & Data Display',
    width: 375,
    height: 328,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55798',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '7065:1754',
    key: 'd3621eca1bd65e3243a74b54a0dd9a61aab89399',
    name: 'Type=CZ/SK Monthly overview_2 categories',
    page: 'PFM & Data Display',
    width: 375,
    height: 328,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55810',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '1518:4794',
    key: '8d4dfe654f0478adfd3852db20614404c2b187ff',
    name: 'Type=Term deposit',
    page: 'PFM & Data Display',
    width: 364,
    height: 182,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55826',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '1057:21700',
    key: 'df0945930f971cf629696c1a0c62fe359ae3aa19',
    name: 'Type=Type7',
    page: 'PFM & Data Display',
    width: 368,
    height: 188,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55840',
  },
  {
    familyId: '715:8102',
    familyKey: 'efa8f1f95c301641c813dae5012325d5d1c019b9',
    variantId: '1057:21734',
    key: 'eea17800389babc30b33dbbd770e8b0fe662813f',
    name: 'Type=Type5',
    page: 'PFM & Data Display',
    width: 368,
    height: 188,
    componentId: 'pfm.source-graph',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:55868',
  },
  {
    familyId: '243:8097',
    familyKey: '6e961faec44ef32864fbea191d6f4c1e21bead2e',
    variantId: '0:9211',
    key: '689abad7603ce82d07b23c6b3f0b8fc519fc75cd',
    name: 'Property 2=Connector',
    page: 'PFM & Data Display',
    width: 1,
    height: 48,
    componentId: 'ui.timeline-atom',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:8436',
  },
  {
    familyId: '243:8097',
    familyKey: '6e961faec44ef32864fbea191d6f4c1e21bead2e',
    variantId: '0:9213',
    key: 'b76d258f80ea5c91bc3d549f6d8ab727438d0e3a',
    name: 'Property 2=Date',
    page: 'PFM & Data Display',
    width: 25,
    height: 32,
    componentId: 'ui.timeline-atom',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:8441',
  },
  {
    familyId: '243:8097',
    familyKey: '6e961faec44ef32864fbea191d6f4c1e21bead2e',
    variantId: '0:9238',
    key: 'd8adf08a8843d2ff9e23ead29dea8f990aff19a1',
    name: 'Property 2=UnconfirmedCategory',
    page: 'PFM & Data Display',
    width: 16,
    height: 16,
    componentId: 'ui.timeline-atom',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:8447',
  },
  {
    familyId: '243:8097',
    familyKey: '6e961faec44ef32864fbea191d6f4c1e21bead2e',
    variantId: '0:9284',
    key: '982cbc619df8a2255f85ad1811c8aa993b91fd78',
    name: 'Property 2=triangle',
    page: 'PFM & Data Display',
    width: 25,
    height: 25,
    componentId: 'ui.timeline-atom',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:8456',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24751',
    key: '3e31e4e8a61314895ac2ae8b7bbb27e87ac64e08',
    name: 'Type=Buy Securities',
    page: 'Investments',
    width: 375,
    height: 105,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59255',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '310:8985',
    key: 'a2696a5354ee31d3deaed103a31cb503cfe51d39',
    name: 'Type=Pre login',
    page: 'Investments',
    width: 138,
    height: 32,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59274',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '310:8609',
    key: '15a556cd0e6a1ae0bff947bd1400519db94e8c60',
    name: 'Type=Own Products Negative',
    page: 'Investments',
    width: 375,
    height: 95,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59292',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24340',
    key: '5fc19f48f341e753166661a1d2740c2a6982f913',
    name: 'Type=Own Products Positive',
    page: 'Investments',
    width: 375,
    height: 95,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59314',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24339',
    key: '664fee3cee744083a1f29df046940205d3eac600',
    name: 'Type=Sec.Details Classis',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59336',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24338',
    key: '384019def77c5412c00dc6c12459ee56e510b2dd',
    name: 'Type=Sec.Details Currency',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59349',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '310:8929',
    key: '2fa1af959127ecbd1bb32bf2d48e60a0632e0115',
    name: 'Type=Sec.Details %',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59365',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24754',
    key: 'eb241cac43a6eaeb9e5c9585cba133800bf19a80',
    name: 'Type=Amount',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59376',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24341',
    key: '7357b432778af105f63ee7b82b43dc2b4c28903e',
    name: 'Type=TRX Negative',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59384',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24342',
    key: '6556e742029d8c989a35dff14f90cd26ed865436',
    name: 'Type=Order Positive',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59393',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '7927:14795',
    key: '0aa47329a1c721404c515ac5f7e55f3e7fe28c14',
    name: 'Type=Order Negative',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59410',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24358',
    key: 'a0791628f6c0fd1bafcfc778ec608fd1d9b66b6d',
    name: 'Type=Input field',
    page: 'Investments',
    width: 375,
    height: 96,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59427',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24359',
    key: '4ffa2476d24f92be5724f1cb1ffe4740a923b0e0',
    name: 'Type=Input field signature 🚫 (not in use with this grey color)',
    page: 'Investments',
    width: 375,
    height: 96,
    componentId: 'investments.source-list',
    status: 'blocked',
    reason: 'legacy-variant-not-reactivated',
    missingImageHashes: [],
    instanceId: '10277:59446',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24408',
    key: '5d9fd94d3c36785c3c6927161f87c187f3573730',
    name: 'Type=Accordion',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59463',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24409',
    key: 'f9bec291f897bb52276e37f54f0edd93ffcb1289',
    name: 'Type=Info List',
    page: 'Investments',
    width: 375,
    height: 87,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59479',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24453',
    key: 'c3b26ee2fd21fef056032876353322e88323e3b4',
    name: 'Type=Entry point',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59490',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24612',
    key: 'c3a7b8caa65c059763c9504464e964f1101238cd',
    name: 'Type=Error list',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59501',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '303:24378',
    key: 'c747400e347c1ba262145cdaf8708fea44c58a03',
    name: 'Type=Regular Investment',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59512',
  },
  {
    familyId: '310:9061',
    familyKey: '78706107a77daf2aa8679f015cc3ca46809a48ac',
    variantId: '7927:14235',
    key: '4d2205b352feb3ec54d18ed44a6f9591399fd853',
    name: 'Type=Transaction',
    page: 'Investments',
    width: 375,
    height: 80,
    componentId: 'investments.source-list',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:59527',
  },
  {
    familyId: '290:13357',
    familyKey: '7d907afcfb2ad5781df7cbe1691001932707d611',
    variantId: '290:13357',
    key: '7d907afcfb2ad5781df7cbe1691001932707d611',
    name: 'Action Bar',
    page: 'Investments',
    width: 375,
    height: 55,
    componentId: 'investments.source-action-bar',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:60546',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:4924',
    key: '5f23d05603e1b54092a35137450f403f5453e107',
    name: 'Type=Yellow, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:60967',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:4940',
    key: '7690ec410c637c48426614bd60a6678116a886b6',
    name: 'Type=Pink, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:60989',
    presentationLimitations: [
      'The original photograph and affine crop are preserved. The Figma image temperature filter (0.23) has no exact native mapping in the available source context and is not approximated.',
    ],
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:4956',
    key: 'c748ccd898dd60ddaf775a9c12a05471aaf822d3',
    name: 'Type=Orange, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61010',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:4971',
    key: '6581d4c0155d46083cba4b722daff678afb37131',
    name: 'Type=Yellow, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61031',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:4987',
    key: 'aa52f8a38bbeb9d88112b51af8bf4327e639126a',
    name: 'Type=Pink, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61055',
    presentationLimitations: [
      'The original photograph and affine crop are preserved. The Figma image temperature filter (0.23) has no exact native mapping in the available source context and is not approximated.',
    ],
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5003',
    key: 'b44f90cef9009935ed044aacd448ceffde7dd98b',
    name: 'Type=Orange, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61076',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5018',
    key: '4036ebcfd564c379a4445fcad7fde5856cd686b5',
    name: 'Type=Grey, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61099',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5226',
    key: 'ef53aa860c763b8f2ea928b3ff513bb413dc1ed2',
    name: 'Type=Red, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61120',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5244',
    key: '846f188f445ea5bcde1a467fe33893838376b702',
    name: 'Type=Green, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61141',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5262',
    key: '765d9060514837571186c939f5d6219641e5ea77',
    name: 'Type=Green, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61162',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5280',
    key: 'f01c1bd6b004488712fd723be93d9b9ae8f872f3',
    name: 'Type=Red, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61183',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5298',
    key: '7e4a70284b180348c0acfac2829e1b1eabf29027',
    name: 'Type=Blue, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'excluded',
    reason: 'excluded-non-photographic-stock-illustration',
    missingImageHashes: [],
    instanceId: '10277:61204',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5352',
    key: 'afe60ad1736e0ca98fd9166096cdec1fab767737',
    name: 'Type=Black, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61224',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '815:5402',
    key: 'be2a5e1acf96c37431235479521c213d283bbe0c',
    name: 'Type=placeholder, Lighter version=No',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61245',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '825:5493',
    key: '5f215deacdcd153a8fee3279b6a2132985865394',
    name: 'Type=placeholder, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61258',
  },
  {
    familyId: '804:4923',
    familyKey: 'cf6d1986bfe86ca67d70a9ac37f8679336eccbbd',
    variantId: '804:5316',
    key: '5a4d7f852f59766429013c6475a9122c6083db42',
    name: 'Type=Blue, Lighter version=Yes',
    page: 'Investments',
    width: 343,
    height: 157,
    componentId: 'investments.source-campaign',
    status: 'excluded',
    reason: 'excluded-non-photographic-stock-illustration',
    missingImageHashes: [],
    instanceId: '10277:61271',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:204',
    key: '2bb5187753cad4a398c13a6d2cd557e5141d5f38',
    name: 'Type=Bottom banner, Style=Yellow, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9723',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:220',
    key: '7d6fa2a7ee565a21706f908ba7729028856460d7',
    name: 'Type=Bottom banner, Style=Pink, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9744',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:236',
    key: 'eed2ff9b6787982485651caa1b2866aa7a7d7a9a',
    name: 'Type=Bottom banner, Style=Orange, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9765',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:251',
    key: '3976b019b48b137a28824cfd8e41a42f0856403e',
    name: 'Type=Bottom banner, Style=Yellow, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9785',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:268',
    key: '69924b4774107e7951958a895be3825a3f66bd7b',
    name: 'Type=Bottom banner, Style=Pink, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9807',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:284',
    key: 'ebf485169d77c3da0ef42549a307771f21f174b9',
    name: 'Type=Bottom banner, Style=Orange, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9828',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:299',
    key: '03d8d1d3a3634693e5750d29fc283cce63c27385',
    name: 'Type=Bottom banner, Style=Grey, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9848',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:315',
    key: '56e66f5e3539c88fbbe35b0ef72d0b908c936306',
    name: 'Type=Top banner, Style=Red, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9869',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:334',
    key: '22c57ec570050e62027dd9efe1f78ade5c8066a6',
    name: 'Type=Top banner, Style=Red, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9896',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:353',
    key: '8e48daf7b153feaea476890a00204fb3c0d0265c',
    name: 'Type=Top banner, Style=Green, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9923',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:371',
    key: 'f5507638bf765ef0233d1457c4ffa072fef548c2',
    name: 'Type=Top banner, Style=Green, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9949',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:389',
    key: '64bdf6fa4f8bdf6dcb0fd44e8779ec06d343c22f',
    name: 'Type=Top banner, Style=Blue, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:9975',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:407',
    key: 'd1d409445b13fee451cb386a622575bddead5587',
    name: 'Type=Top banner, Style=Blue, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:10000',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:425',
    key: '8070bac8cbd1d7434f0e64e71636a34d0e473534',
    name: 'Type=Top banner, Style=Extra campaign, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10282:10025',
  },
  {
    familyId: '8889:203',
    familyKey: 'fb10363a9ff8866e872dff5f5c3c8e91f666d770',
    variantId: '8889:444',
    key: '48658f6269f6f420530c06b2d38498dfd01c4c67',
    name: 'Type=Bottom banner, Style=Yellow, Light version=Yes',
    page: 'Commercial Banners',
    width: 1308,
    height: 628,
    componentId: 'marketing.source-campaign',
    status: 'blocked',
    reason: 'authored-4x-documentation-scale',
    missingImageHashes: [],
    instanceId: '10282:10051',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8625',
    key: 'd566a47e8334ee033b621fbebdf1f7bcd003fec6',
    name: 'Type=Bottom banner, Style=Yellow, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61806',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8641',
    key: '7e84c1130cdcc5890ce3a01170f4e7fbd137f0a7',
    name: 'Type=Bottom banner, Style=Pink, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61827',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8657',
    key: '395de6439268e85b9f11f47a3bbc55c1f9b0ee90',
    name: 'Type=Bottom banner, Style=Orange, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61848',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8672',
    key: '6d407a9020e2d6c87dd09805297b51c4e9e7a710',
    name: 'Type=Bottom banner, Style=Yellow, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61868',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8688',
    key: '5fe3e63b6243e4587198341a00a233a35c5ec9f2',
    name: 'Type=Bottom banner, Style=Pink, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61889',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8704',
    key: '31a1f2fa762d2ddbff735236f9761a0aecccd1fc',
    name: 'Type=Bottom banner, Style=Orange, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61910',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '1093:8719',
    key: '0fb0a4d051577c0ce73c45fbff852ab955f470f2',
    name: 'Type=Bottom banner, Style=Grey, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61930',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5922',
    key: '872057e9788df270e588b0b8ebca68a529a4ee52',
    name: 'Type=Top banner, Style=Red, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61951',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5870',
    key: '805ce1a52f0fa46a10c021483e968e7218ee1fd6',
    name: 'Type=Top banner, Style=Red, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:61977',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5957',
    key: '67ebbbc8dce030473039d64ea938b02974a083be',
    name: 'Type=Top banner, Style=Green, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62003',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5905',
    key: '27bb0ffafe84afe74c5ef1b867f312d07a03d468',
    name: 'Type=Top banner, Style=Green, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62028',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5940',
    key: 'c7a13b64cbef3790eef58bd21f6eba9a4e6270fb',
    name: 'Type=Top banner, Style=Blue, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62049',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5888',
    key: '163c2512c7cea20fd010b2a8d8516efb60efd708',
    name: 'Type=Top banner, Style=Blue, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62073',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5974',
    key: '4e8f615c4fb4bca2cee81866c1c7f5f9e840cbf2',
    name: 'Type=Top banner, Style=Extra campaign, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62097',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:6001',
    key: 'a32becad038fd18bd1c309ac1fadf121c28d1d29',
    name: 'Type=Ghost product, Style=Red, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62122',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:6003',
    key: 'de89fc7b6d2702c2f7b55470415f4f236595f08f',
    name: 'Type=Ghost product, Style=Red, Light version=Yes',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62147',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5993',
    key: '5437d7b7f022123d7e0d9c40b26de929ce1be551',
    name: 'Type=Ghost product, Style=Green, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62174',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5995',
    key: '2d7d1d9bea9c482f0821e79e1a1ee4ef8d148a0a',
    name: 'Type=Ghost product, Style=Green, Light version=Yes',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62199',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5997',
    key: '2853c9fe2e2bfc2aea9f2d0b827081ee3ee3ada6',
    name: 'Type=Ghost product, Style=Blue, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62224',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:5999',
    key: '5783ae0fc2ed3b3bda4165f3e8e5cfa8d27c6a43',
    name: 'Type=Ghost product, Style=Blue, Light version=Yes',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62249',
  },
  {
    familyId: '1093:8624',
    familyKey: 'f0cd425b892b6b9bd38ed9051edfd9bb47062b5c',
    variantId: '265:6005',
    key: '35e7caac4022e6952d11861f968fbff0cf7c69bb',
    name: 'Type=Ghost product, Style=Black, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62274',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16188',
    key: '3005c4d2125ae780d1052224394dadd73c9c9c53',
    name: 'Type=Bottom banner, Style=Yellow, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62302',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16204',
    key: '2494f58e56feda3cd50f62a52d3c053f13a866a6',
    name: 'Type=Bottom banner, Style=Pink, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62324',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16220',
    key: '871ff215a38a89ccb41fa4342a17e9a0662974bc',
    name: 'Type=Bottom banner, Style=Orange, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62346',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16235',
    key: '18d8358e13274d2c3d4561acecaf0c2207be097d',
    name: 'Type=Bottom banner, Style=Yellow, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62367',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16251',
    key: '64f32dc81ac1dfc6fbe25d724dfa3b3f1bdc2cd2',
    name: 'Type=Bottom banner, Style=Pink, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62389',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16267',
    key: '16b357acb1cd06bbc562219489a8710b893ce5b0',
    name: 'Type=Bottom banner, Style=Orange, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62411',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16282',
    key: '76fa3a7ac2778aa87649a17dc767ffd9efc1b43d',
    name: 'Type=Bottom banner, Style=Grey, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62432',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16298',
    key: '2bc7f10644b496165377db5e6343c24b7d1ec247',
    name: 'Type=Top banner, Style=Red, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62454',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16315',
    key: 'ac3f5d5ab180ae45614140363cff129980848e53',
    name: 'Type=Top banner, Style=Red, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62481',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16332',
    key: 'dc4946e39e5edda1b0c41947c8eae19c538ef283',
    name: 'Type=Top banner, Style=Green, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62508',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16348',
    key: '53d985cefe0822ac9a7d6a274c7c47ceca7b7440',
    name: 'Type=Top banner, Style=Green, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62534',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16363',
    key: 'dc80d1478ca5c5f634bdfc528aba7bc9a3fff498',
    name: 'Type=Top banner, Style=Blue, Light version=Yes',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62556',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16379',
    key: '54483012faccc960cb82a1cdf7ab6d236062bf46',
    name: 'Type=Top banner, Style=Blue, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62581',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16395',
    key: '0eb5d4d5de3266fd2c442591b7d8a7763191bec3',
    name: 'Type=Top banner, Style=Extra campaign, Light version=No',
    page: 'Commercial Banners',
    width: 327,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62606',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16412',
    key: '9bf0d900b3d62cff1718f069674028f574da5bbc',
    name: 'Type=Ghost product, Style=Red, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62632',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16432',
    key: '72bfa5b01ae25c8f650d1f0f2bb1e840638e4074',
    name: 'Type=Ghost product, Style=Red, Light version=Yes',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62658',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16454',
    key: '9d2416c2a4079d86f88e32c835491398b412eae0',
    name: 'Type=Ghost product, Style=Green, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62686',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16474',
    key: '0533924c70c938786b53e0deb8b5dfd8bed116f4',
    name: 'Type=Ghost product, Style=Green, Light version=Yes',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62712',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16494',
    key: '1394cb2aedb4a126201a67f4d8795ddc6cf264d3',
    name: 'Type=Ghost product, Style=Blue, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62738',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16514',
    key: 'e7a736bec7ad9da93c4b8517c1bc288ad91e863b',
    name: 'Type=Ghost product, Style=Blue, Light version=Yes',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62764',
  },
  {
    familyId: '9365:16187',
    familyKey: 'b7aac6ca6de70d5c38140c2595d1417d2b51e23a',
    variantId: '9365:16534',
    key: 'f5b4d100938dc3b8f6716654764f90c0ec11ebe1',
    name: 'Type=Ghost product, Style=Black, Light version=No',
    page: 'Commercial Banners',
    width: 311,
    height: 196,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62790',
  },
  {
    familyId: '1250:5955',
    familyKey: 'f0889f220ae504ca82f812c5462a3f43b7d34d9a',
    variantId: '1250:5954',
    key: 'd9d5366c340b9f0ed7fb7248b48ff81fa7d12291',
    name: 'Property=cz green overdraft',
    page: 'Commercial Banners',
    width: 96,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62819',
  },
  {
    familyId: '1250:5955',
    familyKey: 'f0889f220ae504ca82f812c5462a3f43b7d34d9a',
    variantId: '1250:5964',
    key: '7ef8f0e47efb339133fe98fda87187ad36b4a089',
    name: 'Property=green',
    page: 'Commercial Banners',
    width: 96,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62824',
  },
  {
    familyId: '1287:6540',
    familyKey: '8feca760d88a846b29623da9a24f9a2990e01c27',
    variantId: '1287:6541',
    key: '00aed7f76bd1250cfd3ff67e19606d80555954a9',
    name: 'Property=cz red hf',
    page: 'Commercial Banners',
    width: 96,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'excluded',
    reason: 'excluded-raster-banner-background',
    missingImageHashes: [],
    instanceId: '10277:62832',
  },
  {
    familyId: '1287:6540',
    familyKey: '8feca760d88a846b29623da9a24f9a2990e01c27',
    variantId: '1287:6543',
    key: 'b103fd01cc99ad3049bc713f2600342fe742d1f5',
    name: 'Property=red',
    page: 'Commercial Banners',
    width: 96,
    height: 157,
    componentId: 'marketing.source-campaign',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62837',
  },
  {
    familyId: '1923:1532',
    familyKey: 'abdf6fe0221e376e08452f003d62add90d23ea7b',
    variantId: '1923:1532',
    key: 'abdf6fe0221e376e08452f003d62add90d23ea7b',
    name: 'Commercial Engagement/Sticky banner/With icon',
    page: 'Commercial Banners',
    width: 343,
    height: 92,
    componentId: 'marketing.source-sticky',
    status: 'implemented',
    reason: null,
    missingImageHashes: [],
    instanceId: '10277:62845',
  },
]
export const CATALOG_COMPOSITION_PREVIEW_VARIANTS: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  [...new Set(CATALOG_COMPOSITION_SOURCES.map((s) => s.componentId))]
    .map(
      (id) =>
        [
          id,
          CATALOG_COMPOSITION_SOURCES.filter((s) => s.componentId === id && s.status === 'implemented').map(
            (s) => s.variantId,
          ),
        ] as const,
    )
    .filter(([, states]) => states.length > 0),
)
export function getCatalogCompositionSource(variantId: string) {
  return CATALOG_COMPOSITION_SOURCES.find((s) => s.variantId === variantId)
}
export interface SourcePaint {
  type: string
  color?: { r: number; g: number; b: number; a?: number }
  opacity?: number
  gradientStops?: readonly {
    position: number
    color: { r: number; g: number; b: number; a: number }
    boundVariables?: Readonly<Record<string, unknown>>
  }[]
  gradientTransform?: readonly (readonly number[])[]
}
export interface SourceGraphMark {
  id: string
  name: string
  kind: 'path' | 'rect' | 'ellipse' | 'line'
  w: number
  h: number
  transform: readonly number[]
  paths?: readonly {
    windingRule: string
    data: string
    sourceFill?: string
    sourceStroke?: string
    sourceStrokeWidth?: number
  }[]
  radii?: readonly number[]
  arc?: { startingAngle: number; endingAngle: number; innerRadius: number }
  fill: readonly SourcePaint[]
  stroke: readonly SourcePaint[]
  strokeWidth: number
  strokeAlign: string
  dashes?: readonly number[]
  strokeCap?: string
  opacity: number
  isMask: boolean
  originalArcNodeId?: string
  masks: readonly string[]
}
export interface SourceGraphText {
  id: string
  value: string
  w: number
  h: number
  transform: readonly number[]
  fontSize?: number
  segments?: readonly {
    value: string
    fontName: { family: string; style: string }
    fontSize: number
    lineHeight: { unit: string; value?: number }
    letterSpacing: { unit: string; value: number }
    fills: readonly SourcePaint[]
  }[]
  fontName?: { family: string; style: string }
  lineHeight?: { unit: string; value?: number }
  letterSpacing?: { unit: string; value: number }
  align: string
  fills: readonly SourcePaint[]
  opacity: number
  masks: readonly string[]
}
export interface SourceGraphScene {
  variantId: string
  width: number
  height: number
  marks: readonly SourceGraphMark[]
  texts: readonly SourceGraphText[]
}
export const CATALOG_PFM_SOURCE_SCENES: readonly SourceGraphScene[] = [
  {
    variantId: '715:8125',
    width: 375,
    height: 188,
    marks: [
      {
        id: '715:8125',
        name: 'Type=Breakdown',
        kind: 'rect',
        w: 375,
        h: 188,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8352',
        name: 'Path 3 Copy 7',
        kind: 'path',
        w: 327,
        h: 1,
        transform: [1, 0, 0, 1, 24, 74.146484375],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 6.94999613415348e-14 L 0 0 Z',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 0.5,
        strokeAlign: 'CENTER',
        dashes: [1, 4],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8353',
        name: 'Path 3 Copy 8',
        kind: 'path',
        w: 327,
        h: 1,
        transform: [1, 0, 0, 1, 24, 112.146484375],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 6.94999613415348e-14 L 0 0 Z',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 0.5,
        strokeAlign: 'CENTER',
        dashes: [1, 4],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8357',
        name: 'Path 3 Copy 7',
        kind: 'path',
        w: 327,
        h: 1,
        transform: [1, 0, 0, 1, 24, 35.8125],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 6.94999613415348e-14 L 0 0 Z',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 0.5,
        strokeAlign: 'CENTER',
        dashes: [1, 4],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8360',
        name: 'Path',
        kind: 'path',
        w: 327,
        h: 0.5,
        transform: [1, 0, 0, 1, 24, 150.4794921875],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 0 0 L 327 0 L 327 0.5 L 0 0.5 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.5647059082984924,
              g: 0.5647059082984924,
              b: 0.5647059082984924,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8361',
        name: 'Rectangle 3',
        kind: 'rect',
        w: 16,
        h: 120,
        transform: [1, 0, 0, 1, 87, 30.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8362',
        name: 'Rectangle 3 Copy',
        kind: 'rect',
        w: 16,
        h: 76,
        transform: [1, 0, 0, 1, 127, 74.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8363',
        name: 'Rectangle 3 Copy 2',
        kind: 'rect',
        w: 16,
        h: 48,
        transform: [1, 0, 0, 1, 167, 102.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8364',
        name: 'Rectangle 3 Copy 3',
        kind: 'rect',
        w: 16,
        h: 91,
        transform: [1, 0, 0, 1, 207, 59.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8365',
        name: 'Rectangle 3 Copy 4',
        kind: 'rect',
        w: 16,
        h: 71,
        transform: [1, 0, 0, 1, 247, 79.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8366',
        name: 'Rectangle 3 Copy 5',
        kind: 'rect',
        w: 16,
        h: 52,
        transform: [1, 0, 0, 1, 287, 98.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8367',
        name: 'Rectangle 3 Copy 6',
        kind: 'rect',
        w: 16,
        h: 91,
        transform: [1, 0, 0, 1, 327, 59.8125],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '715:8343',
        value: 'JAN',
        w: 25.1240234375,
        h: 15,
        transform: [1, 0, 0, 1, 77.323974609375, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8344',
        value: 'FEB',
        w: 25.1240234375,
        h: 15,
        transform: [1, 0, 0, 1, 119.197509765625, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8345',
        value: 'MAR',
        w: 35.59236526489258,
        h: 15,
        transform: [1, 0, 0, 1, 155.836669921875, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8346',
        value: 'APR',
        w: 25.1240234375,
        h: 15,
        transform: [1, 0, 0, 1, 202.944091796875, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8347',
        value: 'MAY',
        w: 25.1240234375,
        h: 15,
        transform: [1, 0, 0, 1, 244.817626953125, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8348',
        value: 'JUN',
        w: 25.1240234375,
        h: 15,
        transform: [1, 0, 0, 1, 286.690673828125, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8349',
        value: 'JUL',
        w: 25.1240234375,
        h: 15,
        transform: [1, 0, 0, 1, 328.564208984375, 168.69049072265625],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8354',
        value: '50,000',
        w: 41,
        h: 15,
        transform: [1, 0, 0, 1, 24, 60.146484375],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8355',
        value: '20,000',
        w: 41,
        h: 15,
        transform: [1, 0, 0, 1, 24, 98.146484375],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8358',
        value: '100,000',
        w: 49,
        h: 15,
        transform: [1, 0, 0, 1, 24, 21.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8359',
        value: '0',
        w: 8,
        h: 15,
        transform: [1, 0, 0, 1, 24, 136.4794921875],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
    ],
  },
  {
    variantId: '1518:4734',
    width: 375,
    height: 188,
    marks: [
      {
        id: '1518:4734',
        name: 'Type=Savings',
        kind: 'rect',
        w: 375,
        h: 188,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.20000000298023224,
              g: 0.20000000298023224,
              b: 0.20000000298023224,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4853',
        name: 'Rectangle 6',
        kind: 'path',
        w: 0.5,
        h: 131.90049743652344,
        transform: [1, 0, 0, 1, 24, 19.68359375],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 0 0 L 0.5 0 L 0.5 131.90049743652344 L 0 131.90049743652344 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 0.29999998211860657,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4854',
        name: 'Rectangle 5',
        kind: 'path',
        w: 0.5,
        h: 131.90049743652344,
        transform: [1, 0, 0, 1, 24, 19.68359375],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 0 0 L 0.5 0 L 0.5 131.90049743652344 L 0 131.90049743652344 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 0.29999998211860657,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4860',
        name: 'Path 3 Copy 7',
        kind: 'path',
        w: 327,
        h: 1.3636363744735718,
        transform: [1, 0, 0, 1, 24, 84.63671875],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 9.477267530982391e-14 L 0 0 Z',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 0.5,
        strokeAlign: 'CENTER',
        dashes: [1, 4],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4863',
        name: 'Path 3 Copy 7',
        kind: 'path',
        w: 327,
        h: 1,
        transform: [1, 0, 0, 1, 24, 143],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 0 0 L 327 6.94999613415348e-14 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4866',
        name: 'Path 3 Copy 7',
        kind: 'path',
        w: 327,
        h: 1.6387606859207153,
        transform: [1, 0, 0, 1, 24, 25.3612060546875],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 1.1389380431951677e-13 L 0 0 Z',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 0.5,
        strokeAlign: 'CENTER',
        dashes: [1, 4],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4871',
        name: 'Path',
        kind: 'path',
        w: 327,
        h: 0.5,
        transform: [1, 0, 0, 1, 24, 144],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 0 0 L 327 0 L 327 0.5 L 0 0.5 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4872',
        name: 'Path 5',
        kind: 'path',
        w: 327,
        h: 109.4117660522461,
        transform: [1, 0, 0, 1, 24, 35],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 7.274024183554287e-15 107.05882263183594 L 0 84.70587921142578 L 94.22897338867188 77.64705657958984 L 143.1261749267578 55.29411697387695 L 197.1168212890625 38.82352828979492 L 277.0841064453125 21.568628311157227 L 327 2.9714792468781264e-15 L 327 109.4117660522461 L 7.274024183554287e-15 107.05882263183594 Z',
          },
        ],
        fill: [
          {
            type: 'GRADIENT_LINEAR',
            opacity: 1,
            gradientStops: [
              {
                color: {
                  r: 0,
                  g: 0.47843137383461,
                  b: 0.5686274766921997,
                  a: 0.5,
                },
                position: 0,
                boundVariables: {},
              },
              {
                color: {
                  r: 0.8470588326454163,
                  g: 0.8470588326454163,
                  b: 0.8470588326454163,
                  a: 9.999999747378752e-5,
                },
                position: 1,
                boundVariables: {},
              },
            ],
            gradientTransform: [
              [0, 1, 0],
              [-1, 0, 0.5],
            ],
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4873',
        name: 'Path 4',
        kind: 'path',
        w: 327,
        h: 88.23529052734375,
        transform: [1, 0, 0, 1, 24, 34],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 0 88.23529052734375 L 95.96739196777344 79.35224151611328 L 141.15838623046875 56.849586486816406 L 187.3649139404297 42.63718795776367 L 276.2236022949219 22.897748947143555 L 327 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.686274528503418,
              b: 0.8156862854957581,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 3,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4874',
        name: 'Oval 2',
        kind: 'ellipse',
        w: 5,
        h: 5,
        transform: [1, 0, 0, 1, 24, 31],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8980392217636108,
              g: 0.8980392217636108,
              b: 0.8980392217636108,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1518:4855',
        value: 'JUN',
        w: 24,
        h: 15,
        transform: [1, 0, 0, 1, 24, 160],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4861',
        value: '200,000',
        w: 49,
        h: 15,
        transform: [1, 0, 0, 1, 24, 69.7373046875],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4867',
        value: '400,000',
        w: 49,
        h: 15,
        transform: [1, 0, 0, 1, 24, 11.9736328125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4870',
        value: '0',
        w: 5,
        h: 9,
        transform: [1, 0, 0, 1, 24, 134],
        fontSize: 8,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PIXELS',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: '0',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 8,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    variantId: '715:8151',
    width: 375,
    height: 188,
    marks: [
      {
        id: '715:8151',
        name: 'Type=Financial report',
        kind: 'rect',
        w: 375,
        h: 188,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1156:10162',
        name: 'Rectangle 3',
        kind: 'rect',
        w: 16,
        h: 128,
        transform: [1, 0, 0, 1, 163, 23],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1156:10163',
        name: 'Mask',
        kind: 'rect',
        w: 16,
        h: 92,
        transform: [1, 0, 0, 1, 195, 59],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1156:10164',
        name: 'Mask',
        kind: 'rect',
        w: 16,
        h: 92,
        transform: [1, 0, 0, 1, 195, 59],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1156:10165',
        name: 'Rectangle 2',
        kind: 'rect',
        w: 16,
        h: 21,
        transform: [1, 0, 0, 1, 195, 59],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1156:10164'],
      },
      {
        id: '1156:10166',
        name: 'Rectangle 2',
        kind: 'rect',
        w: 16,
        h: 21,
        transform: [1, 0, 0, 1, 195, 59],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8980392217636108,
              g: 0.8980392217636108,
              b: 0.8980392217636108,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1156:10164'],
      },
      {
        id: '715:8315',
        name: 'Path 3 Copy 7',
        kind: 'path',
        w: 327,
        h: 1,
        transform: [1, 0, 0, 1, 24, 150.8125],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 6.94999613415348e-14 L 0 0 Z',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5647059082984924,
              g: 0.5647059082984924,
              b: 0.5647059082984924,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 0.5,
        strokeAlign: 'CENTER',
        dashes: [1, 4],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '715:8302',
        value: 'SPENDINGS',
        w: 68,
        h: 15,
        transform: [1, 0, 0, 1, 214, 167.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8303',
        value: 'INCOMES',
        w: 54,
        h: 15,
        transform: [1, 0, 0, 1, 101, 167.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8305',
        value: 'CREDIT CARD PAYMENTS',
        w: 143.85400390625,
        h: 15,
        transform: [1, 0, 0, 1, 219, 58.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8306',
        value: '20,000.00 RSD',
        w: 126,
        h: 15,
        transform: [1, 0, 0, 1, 219, 73.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8309',
        value: 'BOOKED TRANSACTIONS',
        w: 142.712310791015625,
        h: 15,
        transform: [1, 0, 0, 1, 219, 101.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8310',
        value: '50,000.00 RSD',
        w: 125,
        h: 15,
        transform: [1, 0, 0, 1, 219, 116.8125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8313',
        value: 'INFLOW',
        w: 109.6030502319336,
        h: 15,
        transform: [1, 0, 0, 1, 45.396942138671875, 64.3125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8314',
        value: '100,000.00 RSD',
        w: 91,
        h: 30,
        transform: [1, 0, 0, 1, 64, 79.3125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
    ],
  },
  {
    variantId: '1518:4781',
    width: 375,
    height: 188,
    marks: [
      {
        id: '1518:4781',
        name: 'Type=Loan',
        kind: 'rect',
        w: 375,
        h: 188,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.20000000298023224,
              g: 0.20000000298023224,
              b: 0.20000000298023224,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4890',
        name: 'Rectangle',
        kind: 'path',
        w: 327,
        h: 16,
        transform: [1, 0, 0, 1, 23, 81],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 8.466019630432129 16 C 3.7903661727905273 16 0 12.418278217315674 0 8 C 0 3.581721782684326 3.7903661727905273 0 8.466019630432129 0 L 318.5339660644531 0 C 323.2096195220947 0 327 3.581721782684326 327 8 C 327 12.418278217315674 323.2096195220947 16 318.5339660644531 16 L 8.466019630432129 16 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8980392217636108,
              g: 0.8980392217636108,
              b: 0.8980392217636108,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 0.29999998211860657,
        isMask: false,
        masks: [],
      },
      {
        id: '1518:4891',
        name: 'Rectangle',
        kind: 'path',
        w: 106.71556854248047,
        h: 16,
        transform: [1, 0, 0, 1, 23, 81],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 8.452718734741211 16 C 3.7844114303588867 16 0 12.418278217315674 0 8 C 0 3.581721782684326 3.7844114303588867 0 8.452718734741211 0 L 98.26284790039062 0 C 102.93115520477295 0 106.71556854248047 3.581721782684326 106.71556854248047 8 C 106.71556854248047 12.418278217315674 102.93115520477295 16 98.26284790039062 16 L 8.452718734741211 16 Z',
          },
        ],
        fill: [
          {
            type: 'GRADIENT_LINEAR',
            opacity: 1,
            gradientStops: [
              {
                color: {
                  r: 0.28108054399490356,
                  g: 0.9160555005073547,
                  b: 0.3961481750011444,
                  a: 1,
                },
                position: 0,
                boundVariables: {},
              },
              {
                color: {
                  r: 0,
                  g: 0.686274528503418,
                  b: 0.8156862854957581,
                  a: 1,
                },
                position: 1,
                boundVariables: {},
              },
            ],
            gradientTransform: [
              [-0.5085350275039673, 0, 1],
              [0, -0.5085350275039673, 0.25426751375198364],
            ],
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1518:4887',
        value: '22 Dec 2018',
        w: 327,
        h: 22,
        transform: [1, 0, 0, 1, 23, 141],
        fontSize: 20,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4888',
        value: 'NEXT INSTALLMENT',
        w: 327,
        h: 15,
        transform: [1, 0, 0, 1, 23, 125],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4892',
        value: '12.000.00 RSD',
        w: 327,
        h: 31,
        transform: [1, 0, 0, 1, 23, 25],
        fontSize: 28,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PIXELS',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4893',
        value: 'REMAINING LOAN AMOUNT',
        w: 327,
        h: 15,
        transform: [1, 0, 0, 1, 23, 9],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
    ],
  },
  {
    variantId: '715:8184',
    width: 375,
    height: 182,
    marks: [
      {
        id: '715:8184',
        name: 'Type=Orizontal yearly overview',
        kind: 'rect',
        w: 375,
        h: 182,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8410',
        name: 'Rectangle 3',
        kind: 'rect',
        w: 16,
        h: 293.6126403808594,
        transform: [-1.8924829653562265e-16, 1, -1, -1.7830856161936794e-16, 315.762451171875, 70],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '715:8411',
        name: 'Rectangle 3 Copy 2',
        kind: 'rect',
        w: 16,
        h: 166.89559936523438,
        transform: [-1.8924829653562265e-16, 1, -1, -1.7830856161936794e-16, 188.5302734375, 103],
        radii: [8, 8, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '715:8412',
        value: 'GAS & FUEL',
        w: 68,
        h: 15,
        transform: [1, 0, 0, 1, 21.9998779296875, 22],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8415',
        value: '86,000',
        w: 59,
        h: 22,
        transform: [1, 0, 0, 1, 21.9998779296875, 38],
        fontSize: 20,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8414',
        value: '.00 RSD',
        w: 45,
        h: 15,
        transform: [1, 0, 0, 1, 81.9998779296875, 44],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8416',
        value: 'GAS & FUEL',
        w: 68,
        h: 15,
        transform: [1, 0, 0, 1, 21.9998779296875, 127],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8419',
        value: '46,000',
        w: 59,
        h: 22,
        transform: [1, 0, 0, 1, 21.9998779296875, 143],
        fontSize: 20,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '715:8418',
        value: '.00 RSD',
        w: 45,
        h: 15,
        transform: [1, 0, 0, 1, 81.9998779296875, 149],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
    ],
  },
  {
    variantId: '7047:1937',
    width: 375,
    height: 328,
    marks: [
      {
        id: '7047:1937',
        name: 'Type=CZ/SK Monthly overview_3 categories',
        kind: 'rect',
        w: 375,
        h: 328,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7047:1974',
        name: 'Ellipse 5',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 157.36865234375, 45.556640625],
        arc: {
          startingAngle: 4.71238899230957,
          endingAngle: 8.121017456054688,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M30.1313 13.4434C30.1313 6.81594 35.5179 1.37965 42.1105 2.05821C54.6624 3.35014 66.9498 6.667 78.4878 11.9039C93.6767 18.7979 107.216 28.8599 118.198 41.4151C129.179 53.9703 137.349 68.7285 142.16 84.7C146.97 100.671 148.311 117.487 146.09 134.019C143.87 150.55 138.14 166.416 129.285 180.552C120.431 194.688 108.656 206.767 94.7505 215.98C80.8451 225.192 65.1307 231.325 48.661 233.967C36.15 235.973 23.4229 235.93 10.9749 233.864C4.43696 232.779 0.675835 226.114 2.42463 219.722L3.80997 214.658C5.55877 208.265 12.1601 204.589 18.7314 205.45C27.1163 206.548 35.6373 206.432 44.0286 205.086C56.3808 203.105 68.1667 198.505 78.5957 191.596C89.0247 184.686 97.8559 175.627 104.497 165.025C111.138 154.423 115.435 142.524 117.1 130.125C118.766 117.726 117.761 105.114 114.153 93.1358C110.545 81.1572 104.417 70.0886 96.181 60.6722C87.9448 51.2558 77.7904 43.7093 66.3987 38.5388C58.6599 35.0263 50.4718 32.6655 42.0941 31.5126C35.5286 30.6091 30.1313 25.3208 30.1313 18.6934V13.4434Z',
            windingRule: 'NONZERO',
            sourceFill: '#007A6B',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7047:1974',
      },
      {
        id: '7047:1975',
        name: 'Ellipse 7',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 68.4998779296875, 45.556640625],
        arc: {
          startingAngle: 4.71238899230957,
          endingAngle: 2.0074777603149414,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M119 13.4434C119 6.81594 113.613 1.37958 107.021 2.05808C84.6962 4.35565 63.4102 13.0393 45.775 27.1905C25.0076 43.8552 10.5456 67.1051 4.77791 93.1C-0.989772 119.095 2.28188 146.28 14.0525 170.164C24.0477 190.445 39.6637 207.317 58.9215 218.841C64.6085 222.244 71.789 219.596 74.592 213.59L76.8124 208.833C79.6154 202.827 76.9609 195.753 71.3936 192.157C58.1197 183.584 47.34 171.54 40.2894 157.234C31.4614 139.32 29.0077 118.932 33.3335 99.4358C37.6592 79.9397 48.5057 62.5022 64.0813 50.0037C76.5211 40.0215 91.3831 33.6667 107.037 31.5125C113.603 30.609 119 25.3208 119 18.6934V13.4434Z',
            windingRule: 'NONZERO',
            sourceFill: '#005EC7',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7047:1975',
      },
      {
        id: '7047:1976',
        name: 'Ellipse 6',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 139.3704833984375, 243.8896484375],
        arc: {
          startingAngle: 1.8369941711425781,
          endingAngle: 2.0066401958465576,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M19.9616 23.4147C18.5198 28.7026 13.0451 31.8606 7.89829 29.976C2.75149 28.0913 0.610809 22.1446 2.92477 17.176L7.94127 6.40434C9.67674 2.67787 14.096 1.09604 17.9561 2.50955C21.8162 3.92307 24.1689 7.9847 23.0875 11.9507L19.9616 23.4147Z',
            windingRule: 'NONZERO',
            sourceFill: '#004C3D',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7047:1976',
      },
      {
        id: '7199:1822',
        name: 'Vector 1',
        kind: 'path',
        w: 71.4833984375,
        h: 12,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 261, 65],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.797956715115527 0 L 71.4833984375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7196:3614',
        name: 'Vector 1',
        kind: 'path',
        w: 69.5537109375,
        h: 12,
        transform: [-1, 0, 0, 1, 111.5537109375, 65],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.560456715538097 0 L 69.5537109375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.3686274588108063,
              b: 0.7803921699523926,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7182:3106',
        name: 'Vector 1',
        kind: 'path',
        w: 108,
        h: 20,
        transform: [-1, 0, 0, -1, 150, 288],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 20 L 10.197066970074557 0 L 108 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '7047:1978',
        value: 'Total savings',
        w: 169,
        h: 26,
        transform: [1, 0, 0, 1, 103, 134],
        fontSize: 18,
        fontName: {
          family: 'UniCredit',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '7047:1979',
        value: '1.500,00 CZK',
        w: 169,
        h: 26,
        transform: [1, 0, 0, 1, 103, 168],
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: '1.500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7199:1821',
        value: 'U-šetřete\n10%',
        w: 71.4833984375,
        h: 30,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 261, 34],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'U-šetřete\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3613',
        value: 'Account\n10%',
        w: 44,
        h: 30,
        transform: [1, 0, 0, 1, 42, 34],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Account\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7182:3105',
        value: 'Other\n10%',
        w: 108,
        h: 30,
        transform: [1, 0, 0, 1, 42, 257],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Other\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    variantId: '7160:1522',
    width: 375,
    height: 328,
    marks: [
      {
        id: '7160:1522',
        name: 'Type=CZ/SK  Monthly overview_5 categories',
        kind: 'rect',
        w: 375,
        h: 328,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7160:1531',
        name: 'Ellipse 5',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 133.098297119140625, 45],
        arc: {
          startingAngle: 5.777040004730225,
          endingAngle: 7.049385070800781,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M3.49671 27.1649C0.283672 21.3685 2.35942 14.0022 8.45438 11.3995C27.6401 3.20668 48.7423 0.263884 69.572 2.98768C90.4018 5.71149 110.038 13.9814 126.472 26.832C131.693 30.9144 131.804 38.5668 127.209 43.3422L123.569 47.1251C118.973 51.9004 111.417 51.9683 106.06 48.0668C94.2409 39.4595 80.4024 33.9029 65.7795 31.9908C51.1565 30.0786 36.3545 31.89 22.7198 37.1689C16.5394 39.5616 9.25499 37.5532 6.04196 31.7567L3.49671 27.1649Z',
            windingRule: 'NONZERO',
            sourceFill: '#007A6B',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1531',
      },
      {
        id: '7160:1532',
        name: 'Ellipse 7',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 68.5, 65.1875],
        arc: {
          startingAngle: 5.759586811065674,
          endingAngle: 2.6148526668548584,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M66.5 7.87983C63.1863 2.14032 55.8033 0.125608 50.4333 4.00955C41.2533 10.649 33.0688 18.5994 26.1497 27.6239C16.7917 39.8294 9.93194 53.7602 5.96294 68.6194C1.99394 83.4786 0.993551 98.9745 3.01902 114.221C5.04448 129.467 10.0561 144.164 17.767 157.472C25.478 170.779 35.737 182.436 47.9573 191.774C60.1775 201.113 74.1191 207.951 88.9845 211.897C103.85 215.843 119.347 216.819 134.59 214.769C145.861 213.254 156.828 210.107 167.154 205.444C173.194 202.716 175.117 195.309 171.785 189.58L169.146 185.041C165.814 179.312 158.49 177.454 152.36 179.974C145.431 182.822 138.15 184.777 130.693 185.78C119.261 187.317 107.637 186.585 96.4884 183.626C85.3393 180.667 74.8831 175.538 65.718 168.534C56.5528 161.53 48.8585 152.787 43.0753 142.807C37.292 132.826 33.5334 121.803 32.0143 110.369C30.4952 98.934 31.2454 87.3121 34.2222 76.1677C37.199 65.0233 42.3438 54.5752 49.3623 45.421C53.9407 39.4495 59.2578 34.105 65.1746 29.5096C70.4088 25.4444 72.4387 18.166 69.125 12.4265L66.5 7.87983Z',
            windingRule: 'NONZERO',
            sourceFill: '#005EC7',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1532',
      },
      {
        id: '7160:1533',
        name: 'Ellipse 9',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 233.7587890625, 139.5771484375],
        arc: {
          startingAngle: 2.6179938316345215,
          endingAngle: 1.3582152128219604,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M6.2412 115.356C9.55492 121.095 16.9382 123.11 22.3082 119.226C39.0116 107.145 52.2882 90.8178 60.7006 71.8431C69.113 52.8684 72.2974 32.0667 70.034 11.5772C69.3063 4.98982 62.8558 0.8713 56.3776 2.26959L51.2458 3.37725C44.7676 4.77552 40.7371 11.1671 41.2392 17.7755C42.3327 32.1699 39.8617 46.6782 33.9608 59.988C28.0599 73.2978 18.9679 84.8708 7.56678 93.7257C2.33262 97.7909 0.302496 105.069 3.6162 110.809L6.2412 115.356Z',
            windingRule: 'NONZERO',
            sourceFill: '#A33694',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1533',
      },
      {
        id: '7160:1534',
        name: 'Ellipse 6',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 261.607177734375, 98.9248046875],
        arc: {
          startingAngle: 1.348266839981079,
          endingAngle: 0.9524261951446533,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M28.3038 41.902C34.7677 40.4393 38.8812 33.9859 36.7644 27.7056C34.387 20.6522 31.3419 13.8416 27.6706 7.36668C24.4018 1.60151 16.8496 0.363918 11.4494 4.20588L7.17154 7.24934C1.77137 11.0913 0.591084 18.5547 3.66098 24.4283C5.319 27.6005 6.78139 30.8712 8.03992 34.2221C10.3701 40.4263 16.7192 44.5233 23.1832 43.0606L28.3038 41.902Z',
            windingRule: 'NONZERO',
            sourceFill: '#3D1FAB',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1534',
      },
      {
        id: '7160:1535',
        name: 'Ellipse 8',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 249.79574584960938, 82.330078125],
        arc: {
          startingAngle: 0.7723081707954407,
          endingAngle: 0.9419541954994202,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M12.4207 4.97139C16.2453 1.04532 22.5645 0.937207 26.1525 5.0807C29.7404 9.22418 28.7299 15.4631 24.2974 18.6871L14.6879 25.6764C11.3634 28.0944 6.73136 27.3356 4.04041 24.228C1.34946 21.1204 1.2607 16.4274 4.12915 13.4828L12.4207 4.97139Z',
            windingRule: 'NONZERO',
            sourceFill: '#004C3D',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1535',
      },
      {
        id: '7196:3401',
        name: 'Vector 1',
        kind: 'path',
        w: 71.4833984375,
        h: 12,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 223, 42],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.797956715115527 0 L 71.4833984375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7196:3397',
        name: 'Vector 1',
        kind: 'path',
        w: 69.5537109375,
        h: 12,
        transform: [-1, 0, 0, 1, 103.5537109375, 82],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.560456715538097 0 L 69.5537109375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.3686274588108063,
              b: 0.7803921699523926,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7196:3409',
        name: 'Vector 1',
        kind: 'path',
        w: 63,
        h: 12,
        transform: [1, 0, 0, 1, 274, 76],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 7.753846140050177 0 L 63 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7196:3419',
        name: 'Vector 1',
        kind: 'path',
        w: 63,
        h: 15,
        transform: [1, 0, 0, -1, 291, 138],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 15 L 7.753846140050177 0 L 63 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.239215686917305,
              g: 0.12156862765550613,
              b: 0.6705882549285889,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7258:1463',
        name: 'Vector 1',
        kind: 'path',
        w: 63,
        h: 12,
        transform: [1, 0, 0, -1, 296, 209],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 7.753846140050177 0 L 63 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6392157077789307,
              g: 0.21176470816135406,
              b: 0.5803921818733215,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '7196:3400',
        value: 'U-šetřete\n10%',
        w: 71.4833984375,
        h: 30,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 223, 11],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'U-šetřete\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7160:1537',
        value: 'Total savings',
        w: 169,
        h: 26,
        transform: [0.9999999403953552, 0, 0, 0.9999999403953552, 103, 134],
        fontSize: 18,
        fontName: {
          family: 'UniCredit',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '7160:1538',
        value: '1.500,00 CZK',
        w: 169,
        h: 26,
        transform: [0.9999999403953552, 0, 0, 0.9999999403953552, 103, 168],
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: '1.500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3396',
        value: 'Account\n10%',
        w: 44,
        h: 30,
        transform: [1, 0, 0, 1, 34, 51],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Account\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3408',
        value: 'Other\n10%',
        w: 64,
        h: 30,
        transform: [1, 0, 0, 1, 274, 45],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Other\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3418',
        value: 'Mortgage benefits\n10%',
        w: 64,
        h: 45,
        transform: [1, 0, 0, 1, 291, 92],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Mortgage benefits\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7258:1462',
        value: 'Bank \nat work\n10%',
        w: 84,
        h: 45,
        transform: [1, 0, 0, 1, 275, 163],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Bank \nat work\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    variantId: '7160:1551',
    width: 375,
    height: 328,
    marks: [
      {
        id: '7160:1551',
        name: 'Type=CZ/SK Monthly overview_7 categories max',
        kind: 'rect',
        w: 375,
        h: 328,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7160:1554',
        name: 'Ellipse 5',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 132.59832763671875, 45],
        arc: {
          startingAngle: 5.777040004730225,
          endingAngle: 7.049385070800781,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M3.49668 27.1649C0.283642 21.3685 2.35939 14.0022 8.45435 11.3995C27.6401 3.20668 48.7423 0.263884 69.572 2.98768C90.4017 5.71149 110.038 13.9814 126.472 26.832C131.692 30.9144 131.804 38.5668 127.209 43.3422L123.569 47.1251C118.973 51.9004 111.417 51.9683 106.06 48.0668C94.2409 39.4595 80.4024 33.9029 65.7794 31.9908C51.1565 30.0786 36.3545 31.89 22.7198 37.1689C16.5394 39.5616 9.25495 37.5532 6.04193 31.7567L3.49668 27.1649Z',
            windingRule: 'NONZERO',
            sourceFill: '#007A6B',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1554',
      },
      {
        id: '7160:1555',
        name: 'Ellipse 7',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 81.062255859375, 90.197265625],
        arc: {
          startingAngle: 5.427974224090576,
          endingAngle: 5.110673427581787,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M26.6933 4.91653C21.6915 0.568554 14.0548 1.06723 10.2418 6.4879C7.72423 10.0669 5.40939 13.7844 3.30825 17.6228C0.12596 23.4362 3.04766 30.5094 9.15633 33.0798L13.9954 35.1159C20.1041 37.6863 27.0717 34.7626 30.4508 29.0614C31.104 27.9593 31.7812 26.8717 32.482 25.7994C36.1076 20.2516 35.6573 12.7088 30.6555 8.36084L26.6933 4.91653Z',
            windingRule: 'NONZERO',
            sourceFill: '#DD1860',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1555',
      },
      {
        id: '7160:1570',
        name: 'Ellipse 14',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 67.99993896484375, 121.7958984375],
        arc: {
          startingAngle: 5.0963616371154785,
          endingAngle: 2.642777681350708,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M21.6458 2.8704C15.5009 0.38772 8.44252 3.3458 6.60201 9.71252C1.05767 28.8917 0.495274 49.241 5.06573 68.8118C10.5491 92.2917 23.1529 113.504 41.1528 129.547C59.1528 145.59 81.6698 155.68 105.623 158.437C125.589 160.735 145.74 157.844 164.157 150.139C170.271 147.581 172.401 140.23 169.231 134.41L166.719 129.8C163.549 123.98 156.279 121.918 150.081 124.265C137.035 129.207 122.941 130.987 108.968 129.379C91.0023 127.311 74.1146 119.744 60.6146 107.711C47.1147 95.6791 37.6619 79.7698 33.5493 62.1599C30.3506 48.4629 30.5041 34.2574 33.9178 20.731C35.5396 14.3051 32.6583 7.31976 26.5135 4.83708L21.6458 2.8704Z',
            windingRule: 'NONZERO',
            sourceFill: '#E67300',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1570',
      },
      {
        id: '7160:1568',
        name: 'Ellipse 13',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 102.8009033203125, 65.1875],
        arc: {
          startingAngle: 5.759586811065674,
          endingAngle: 5.442286014556885,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M31.6991 7.87983C28.3854 2.14032 21.0025 0.125577 15.6324 4.00952C12.0867 6.57393 8.68773 9.33525 5.45141 12.2804C0.549837 16.7411 1.00954 24.3801 5.94857 28.7993L9.8611 32.2999C14.8001 36.719 22.34 36.2231 27.3912 31.9326C28.3676 31.1033 29.362 30.2954 30.3737 29.5096C35.6079 25.4444 37.6378 18.166 34.3241 12.4265L31.6991 7.87983Z',
            windingRule: 'NONZERO',
            sourceFill: '#005EC7',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1568',
      },
      {
        id: '7160:1556',
        name: 'Ellipse 9',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 233.2587890625, 139.5771484375],
        arc: {
          startingAngle: 2.6179938316345215,
          endingAngle: 1.3582152128219604,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M6.2412 115.356C9.55492 121.095 16.9382 123.11 22.3082 119.226C39.0116 107.145 52.2882 90.8178 60.7006 71.8431C69.113 52.8684 72.2974 32.0667 70.034 11.5772C69.3063 4.98982 62.8558 0.8713 56.3776 2.26959L51.2458 3.37725C44.7676 4.77552 40.7371 11.1671 41.2392 17.7755C42.3327 32.1699 39.8617 46.6782 33.9608 59.988C28.0599 73.2978 18.9679 84.8708 7.56678 93.7257C2.33262 97.7909 0.302496 105.069 3.6162 110.809L6.2412 115.356Z',
            windingRule: 'NONZERO',
            sourceFill: '#A33694',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1556',
      },
      {
        id: '7160:1557',
        name: 'Ellipse 6',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 261.107177734375, 98.9248046875],
        arc: {
          startingAngle: 1.348266839981079,
          endingAngle: 0.9524261951446533,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M28.3038 41.902C34.7677 40.4393 38.8812 33.9859 36.7644 27.7056C34.387 20.6522 31.3419 13.8416 27.6706 7.36668C24.4018 1.60151 16.8496 0.363918 11.4494 4.20588L7.17154 7.24934C1.77137 11.0913 0.591084 18.5547 3.66098 24.4283C5.319 27.6005 6.78139 30.8712 8.03992 34.2221C10.3701 40.4263 16.7192 44.5233 23.1832 43.0606L28.3038 41.902Z',
            windingRule: 'NONZERO',
            sourceFill: '#3D1FAB',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1557',
      },
      {
        id: '7160:1558',
        name: 'Ellipse 8',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 249.29571533203125, 82.330078125],
        arc: {
          startingAngle: 0.7723081707954407,
          endingAngle: 0.9419541954994202,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M12.4207 4.97139C16.2453 1.04532 22.5646 0.937207 26.1525 5.0807C29.7404 9.22418 28.7299 15.4631 24.2974 18.6871L14.6879 25.6764C11.3635 28.0944 6.73139 27.3356 4.04044 24.228C1.34949 21.1204 1.26073 16.4274 4.12919 13.4828L12.4207 4.97139Z',
            windingRule: 'NONZERO',
            sourceFill: '#004C3D',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7160:1558',
      },
      {
        id: '7199:1804',
        name: 'Vector 1',
        kind: 'path',
        w: 69.5537109375,
        h: 12,
        transform: [-1, 0, 0, 1, 115.5537109375, 63],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.560456715538097 0 L 69.5537109375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.3686274588108063,
              b: 0.7803921699523926,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7199:1818',
        name: 'Vector 1',
        kind: 'path',
        w: 59.93701171875,
        h: 7,
        transform: [-1, 0, 0, -1, 89.93701171875, 104],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0.00010749438682977946 0 L 7.164747754906757 7 L 59.93701171875 7',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7195:1817',
        name: 'Vector 1',
        kind: 'path',
        w: 59.93701171875,
        h: 7,
        transform: [-1, 0, 0, 1, 75.93701171875, 160],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0.00010749438682977946 0 L 7.164747754906757 7 L 59.93701171875 7',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7200:3397',
        name: 'Vector 1',
        kind: 'path',
        w: 71.4833984375,
        h: 12,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 214, 41],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.797956715115527 0 L 71.4833984375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7196:3600',
        name: 'Vector 1',
        kind: 'path',
        w: 63,
        h: 12,
        transform: [1, 0, 0, -1, 296, 209],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 7.753846140050177 0 L 63 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6392157077789307,
              g: 0.21176470816135406,
              b: 0.5803921818733215,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7221:1917',
        name: 'Vector 2',
        kind: 'path',
        w: 86,
        h: 12,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 273, 77],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 10.58461536578278 0 L 86 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7196:3606',
        name: 'Vector 1',
        kind: 'path',
        w: 69,
        h: 15,
        transform: [1, 0, 0, -1, 289, 142],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 15 L 8.492307677197813 0 L 69 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.239215686917305,
              g: 0.12156862765550613,
              b: 0.6705882549285889,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '7160:1560',
        value: 'Total savings',
        w: 169,
        h: 26,
        transform: [0.9999999403953552, 0, 0, 0.9999999403953552, 102.5, 134],
        fontSize: 18,
        fontName: {
          family: 'UniCredit',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '7160:1561',
        value: '1.500,00 CZK',
        w: 169,
        h: 26,
        transform: [0.9999999403953552, 0, 0, 0.9999999403953552, 102.5, 168],
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: '1.500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7199:1803',
        value: 'Account\n10%',
        w: 44,
        h: 30,
        transform: [1, 0, 0, 1, 46, 32],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Account\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7199:1817',
        value: 'Lorem \n10%',
        w: 59.93701171875,
        h: 30,
        transform: [1, 0, 0, 1, 30, 66],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Lorem \n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7195:1816',
        value: 'Lorem ipsum\n10%',
        w: 59.93701171875,
        h: 45,
        transform: [1, 0, 0, 1, 16, 121],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Lorem ipsum\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7200:3396',
        value: 'U-šetřete\n10%',
        w: 71.4833984375,
        h: 30,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 214, 10],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'U-šetřete\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3599',
        value: 'Bank \nat work\n10%',
        w: 84,
        h: 45,
        transform: [1, 0, 0, 1, 275, 163],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Bank \nat work\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3602',
        value: 'Other\n10%',
        w: 86,
        h: 30,
        transform: [1, 0, 0, 1, 273, 46],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Other\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7196:3605',
        value: 'Mortgage benefits\n10%',
        w: 69,
        h: 45,
        transform: [1, 0, 0, 1, 289, 96],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Mortgage benefits\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    variantId: '7064:1461',
    width: 375,
    height: 328,
    marks: [
      {
        id: '7064:1461',
        name: 'Type=CZ/SK Monthly overview_1 category',
        kind: 'rect',
        w: 375,
        h: 328,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7064:1464',
        name: 'Ellipse 7',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 68.5, 45],
        arc: {
          startingAngle: 4.71238899230957,
          endingAngle: 10.995574951171875,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M236 119C236 183.617 183.617 236 119 236C54.3827 236 2 183.617 2 119C2 54.3827 54.3827 2 119 2C183.617 2 236 54.3827 236 119ZM31.25 119C31.25 167.463 70.537 206.75 119 206.75C167.463 206.75 206.75 167.463 206.75 119C206.75 70.537 167.463 31.25 119 31.25C70.537 31.25 31.25 70.537 31.25 119Z',
            windingRule: 'NONZERO',
            sourceFill: '#005EC7',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7064:1464',
      },
      {
        id: '7199:1826',
        name: 'Vector 1',
        kind: 'path',
        w: 69.5537109375,
        h: 12,
        transform: [-1, 0, 0, 1, 111.5537109375, 65],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.560456715538097 0 L 69.5537109375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.3686274588108063,
              b: 0.7803921699523926,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '7174:1984',
        value: 'Total savings',
        w: 169,
        h: 26,
        transform: [1, 0, 0, 1, 103, 134],
        fontSize: 18,
        fontName: {
          family: 'UniCredit',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '7174:1985',
        value: '1.500,00 CZK',
        w: 169,
        h: 26,
        transform: [1, 0, 0, 1, 103, 168],
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: '1.500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7199:1825',
        value: 'Account\n10%',
        w: 44,
        h: 30,
        transform: [1, 0, 0, 1, 42, 34],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Account\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    variantId: '7065:1754',
    width: 375,
    height: 328,
    marks: [
      {
        id: '7065:1754',
        name: 'Type=CZ/SK Monthly overview_2 categories',
        kind: 'rect',
        w: 375,
        h: 328,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7065:1761',
        name: 'Ellipse 5',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 125.89486694335938, 45.556640625],
        arc: {
          startingAngle: 4.71238899230957,
          endingAngle: 8.435176849365234,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M61.6051 13.4434C61.6051 6.81594 66.9916 1.37964 73.5842 2.0582C87.6641 3.50739 101.399 7.50326 114.107 13.8845C130.399 22.0654 144.555 33.9403 155.443 48.5622C166.332 63.184 173.654 80.1482 176.823 98.1014C179.993 116.055 178.923 134.5 173.7 151.967C168.476 169.433 159.243 185.437 146.737 198.703C134.231 211.968 118.798 222.127 101.669 228.37C84.5407 234.613 66.1901 236.766 48.0814 234.659C33.9561 233.015 20.2829 228.815 7.71917 222.296C1.83649 219.243 0.31908 211.742 3.95769 206.203L6.84006 201.815C10.4787 196.276 17.8931 194.819 23.8767 197.669C32.5495 201.799 41.8668 204.489 51.4623 205.605C65.0438 207.186 78.8068 205.57 91.6533 200.888C104.5 196.206 116.075 188.587 125.454 178.638C134.834 168.689 141.758 156.686 145.676 143.586C149.594 130.486 150.396 116.652 148.019 103.187C145.641 89.722 140.15 76.9989 131.984 66.0325C123.817 55.0661 113.201 46.1599 100.982 40.0242C92.3486 35.6894 83.0842 32.8222 73.5679 31.5126C67.0024 30.6091 61.6051 25.3208 61.6051 18.6934V13.4434Z',
            windingRule: 'NONZERO',
            sourceFill: '#007A6B',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7065:1761',
      },
      {
        id: '7065:1762',
        name: 'Ellipse 7',
        kind: 'path',
        w: 234,
        h: 234,
        transform: [1, 0, 0, 1, 68.5, 45.556640625],
        arc: {
          startingAngle: 4.71238899230957,
          endingAngle: 2.167698860168457,
          innerRadius: 0.75,
        },
        fill: [],
        stroke: [],
        strokeWidth: 4,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
        paths: [
          {
            data: 'M119 13.4434C119 6.81594 113.613 1.3796 107.021 2.05811C86.2685 4.19395 66.3854 11.8507 49.4878 24.3314C29.3607 39.1975 14.5297 60.1247 7.17222 84.0406C-0.185278 107.957 0.318321 133.601 8.60908 157.21C15.5695 177.03 27.7107 194.539 43.6739 207.97C48.7452 212.237 56.2561 210.768 59.9813 205.287L62.9322 200.945C66.6573 195.463 65.1657 188.056 60.2433 183.618C49.384 173.828 41.0932 161.433 36.2068 147.518C29.9887 129.812 29.611 110.578 35.1292 92.6413C40.6473 74.7044 51.7705 59.009 66.8659 47.8594C78.7284 39.0976 92.5527 33.5058 107.037 31.5125C113.603 30.609 119 25.3208 119 18.6934V13.4434Z',
            windingRule: 'NONZERO',
            sourceFill: '#005EC7',
            sourceStroke: 'white',
            sourceStrokeWidth: 4.0,
          },
        ],
        originalArcNodeId: '7065:1762',
      },
      {
        id: '7199:1834',
        name: 'Vector 1',
        kind: 'path',
        w: 69.5537109375,
        h: 12,
        transform: [-1, 0, 0, 1, 111.5537109375, 65],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.560456715538097 0 L 69.5537109375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.3686274588108063,
              b: 0.7803921699523926,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '7199:1842',
        name: 'Vector 1',
        kind: 'path',
        w: 71.4833984375,
        h: 12,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 261, 65],
        paths: [
          {
            windingRule: 'NONE',
            data: 'M 0 12 L 8.797956715115527 0 L 71.4833984375 0',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 2,
        strokeAlign: 'INSIDE',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '7065:1765',
        value: 'Total savings',
        w: 169,
        h: 26,
        transform: [1, 0, 0, 1, 103, 134],
        fontSize: 18,
        fontName: {
          family: 'UniCredit',
          style: 'Regular',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '7065:1766',
        value: '1.500,00 CZK',
        w: 169,
        h: 26,
        transform: [1, 0, 0, 1, 103, 168],
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: '1.500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7199:1833',
        value: 'Account\n10%',
        w: 44,
        h: 30,
        transform: [1, 0, 0, 1, 42, 34],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'LEFT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'Account\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7199:1841',
        value: 'U-šetřete\n10%',
        w: 71.4833984375,
        h: 30,
        transform: [1, 4.331750404260738e-24, -4.331750404260738e-24, 1, 261, 34],
        fontSize: 14,
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'RIGHT',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
        segments: [
          {
            value: 'U-šetřete\n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '10%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    variantId: '1518:4794',
    width: 364,
    height: 182,
    marks: [
      {
        id: '1518:4794',
        name: 'Type=Term deposit',
        kind: 'rect',
        w: 364,
        h: 182,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.20000000298023224,
              g: 0.20000000298023224,
              b: 0.20000000298023224,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: 'I1518:4876;0:9277',
        name: 'Oval 9',
        kind: 'path',
        w: 222,
        h: 111.48387145996094,
        transform: [1, 0, 0, 1, 77, 17],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 222 111.48387145996094 C 222 49.913028717041016 172.30360794067383 0 111 0 C 49.69639205932617 0 0 49.913028717041016 0 111.48387145996094',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.8980392217636108,
              g: 0.8980392217636108,
              b: 0.8980392217636108,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 16,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 0.29999998211860657,
        isMask: false,
        masks: [],
      },
      {
        id: 'I1518:4876;0:9278',
        name: 'Oval 9',
        kind: 'path',
        w: 16.604463577270508,
        h: 58.6419563293457,
        transform: [1, 0, 0, 1, 77, 69.6451416015625],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 16.604463577270508 0 C 6.077363967895508 17.03571319580078 0 37.12710762023926 0 58.6419563293457',
          },
        ],
        fill: [],
        stroke: [
          {
            type: 'GRADIENT_LINEAR',
            opacity: 1,
            gradientStops: [
              {
                color: {
                  r: 0.28108054399490356,
                  g: 0.9160555005073547,
                  b: 0.3961481750011444,
                  a: 1,
                },
                position: 0,
                boundVariables: {},
              },
              {
                color: {
                  r: 0,
                  g: 0.686274528503418,
                  b: 0.8156862854957581,
                  a: 1,
                },
                position: 1,
                boundVariables: {},
              },
            ],
            gradientTransform: [
              [-0.3209628462791443, 0.36832180619239807, 0.6397678256034851],
              [-0.36832180619239807, -0.3209628462791443, 0.3938935399055481],
            ],
          },
        ],
        strokeWidth: 16,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'ROUND',
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1518:4877',
        value: '5,200',
        w: 120,
        h: 22,
        transform: [1, 0, 0, 1, 240, 157],
        fontSize: 20,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4878',
        value: '21 DEC 2019',
        w: 120,
        h: 15,
        transform: [1, 0, 0, 1, 240, 145],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4879',
        value: '5,000',
        w: 120,
        h: 22,
        transform: [1, 0, 0, 1, 17, 157],
        fontSize: 20,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4880',
        value: '20 SEP 2018',
        w: 120,
        h: 15,
        transform: [1, 0, 0, 1, 17, 145],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4881',
        value: '29',
        w: 71,
        h: 31,
        transform: [1, 0, 0, 1, 153, 89],
        fontSize: 28,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PIXELS',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
      {
        id: '1518:4882',
        value: 'DAYS TO GO',
        w: 152,
        h: 15,
        transform: [1, 0, 0, 1, 111, 73],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 0.6000000238418579,
              g: 0.6000000238418579,
              b: 0.6000000238418579,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: [],
      },
    ],
  },
  {
    variantId: '1057:21700',
    width: 368,
    height: 188,
    marks: [
      {
        id: '1057:21700',
        name: 'Type=Type7',
        kind: 'rect',
        w: 368,
        h: 188,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.20000000298023224,
              g: 0.20000000298023224,
              b: 0.20000000298023224,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21702',
        name: 'Mask',
        kind: 'ellipse',
        w: 56,
        h: 56,
        transform: [1, 0, 0, 1, 148, 114],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21703',
        name: 'Mask',
        kind: 'ellipse',
        w: 56,
        h: 56,
        transform: [1, 0, 0, 1, 148, 114],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I1057:21704;0:149',
        name: 'Rectangle4',
        kind: 'path',
        w: 56,
        h: 56,
        transform: [1, 0, 0, 1, 148, 114],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 56 0 L 56 56 L 0 56 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1057:21703'],
      },
      {
        id: '1057:21707',
        name: 'Mask',
        kind: 'ellipse',
        w: 100,
        h: 100,
        transform: [1, 0, 0, 1, 231, 75],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21708',
        name: 'Mask',
        kind: 'ellipse',
        w: 100,
        h: 100,
        transform: [1, 0, 0, 1, 231, 75],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I1057:21709;0:149',
        name: 'Rectangle4',
        kind: 'path',
        w: 100,
        h: 100,
        transform: [1, 0, 0, 1, 231, 75],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 100 0 L 100 100 L 0 100 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1057:21708'],
      },
      {
        id: '1057:21712',
        name: 'Mask Copy',
        kind: 'ellipse',
        w: 86,
        h: 86,
        transform: [1, 0, 0, 1, 159, 15],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21713',
        name: 'Mask Copy',
        kind: 'ellipse',
        w: 86,
        h: 86,
        transform: [1, 0, 0, 1, 159, 15],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I1057:21714;0:149',
        name: 'Rectangle4',
        kind: 'path',
        w: 86,
        h: 86,
        transform: [1, 0, 0, 1, 159, 15],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 86 0 L 86 86 L 0 86 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1057:21713'],
      },
      {
        id: '1057:21717',
        name: 'Mask',
        kind: 'ellipse',
        w: 120,
        h: 120,
        transform: [1, 0, 0, 1, 34, 34],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 0.8999999761581421,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21718',
        name: 'Mask',
        kind: 'ellipse',
        w: 120,
        h: 120,
        transform: [1, 0, 0, 1, 34, 34],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I1057:21719;0:149',
        name: 'Rectangle4',
        kind: 'path',
        w: 120,
        h: 120,
        transform: [1, 0, 0, 1, 34, 34],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 120 0 L 120 120 L 0 120 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1057:21718'],
      },
    ],
    texts: [
      {
        id: '1057:21705',
        value: 'OTHER',
        w: 42,
        h: 15,
        transform: [1, 0, 0, 1, 155, 136],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: ['1057:21703'],
      },
      {
        id: '1057:21710',
        value: 'DOCTORS &\nHEALTHCARE',
        w: 81.39534759521484,
        h: 30,
        transform: [1, 0, 0, 1, 239.99996948242188, 113],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: ['1057:21708'],
      },
      {
        id: '1057:21715',
        value: 'BEAUTY\nPRODUCTS',
        w: 77,
        h: 30,
        transform: [1, 0, 0, 1, 164, 46],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: ['1057:21713'],
      },
      {
        id: '1057:21720',
        value: 'PHARMACY &\nDRUGS',
        w: 106.47887420654297,
        h: 30,
        transform: [1, 0, 0, 1, 40.99993896484375, 80],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: ['1057:21718'],
      },
    ],
  },
  {
    variantId: '1057:21734',
    width: 368,
    height: 188,
    marks: [
      {
        id: '1057:21734',
        name: 'Type=Type5',
        kind: 'rect',
        w: 368,
        h: 188,
        transform: [1, 0, 0, 1, 0, 0],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.20000000298023224,
              g: 0.20000000298023224,
              b: 0.20000000298023224,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21737',
        name: 'Mask',
        kind: 'ellipse',
        w: 120,
        h: 120,
        transform: [1, 0, 0, 1, 124, 34],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 0.8999999761581421,
        isMask: false,
        masks: [],
      },
      {
        id: '1057:21738',
        name: 'Mask',
        kind: 'ellipse',
        w: 120,
        h: 120,
        transform: [1, 0, 0, 1, 124, 34],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8666666746139526,
              g: 0.0941176488995552,
              b: 0.3764705955982208,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I1057:21739;0:177',
        name: 'Rectangle3',
        kind: 'rect',
        w: 120,
        h: 120,
        transform: [1, 0, 0, 1, 124, 34],
        radii: [0, 0, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        strokeCap: 'NONE',
        opacity: 1,
        isMask: false,
        masks: ['1057:21738'],
      },
    ],
    texts: [
      {
        id: '1057:21740',
        value: 'UNCATEGORIZE',
        w: 106.47887420654297,
        h: 15,
        transform: [1, 0, 0, 1, 131, 87],
        fontSize: 14,
        fontName: {
          family: 'UniCredit',
          style: 'Bold',
        },
        lineHeight: {
          unit: 'AUTO',
        },
        letterSpacing: {
          unit: 'PERCENT',
          value: 0,
        },
        align: 'CENTER',
        fills: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        opacity: 1,
        masks: ['1057:21738'],
      },
    ],
  },
]
export const CATALOG_PFM_DATA_LIMITATION =
  'Original Figma drawing geometry and labels are preserved. Source does not provide numerical series or bind every mark to a financial value. Consumers own data-to-geometry mapping; visual fidelity is not data validation.'

export interface InvestmentSourceText {
  id: string
  name: string
  value: string
  x: number
  y: number
  width: number
  height: number
  align: string
  segments: readonly {
    value: string
    fontName: { family: string; style: string }
    fontSize: number
    lineHeight: { unit: string; value?: number }
    letterSpacing: { unit: string; value: number }
    fills: readonly SourcePaint[]
  }[]
}
export interface InvestmentSourceRow {
  variantId: string
  width: number
  height: number
  texts: readonly InvestmentSourceText[]
  shapes: readonly {
    id: string
    x: number
    y: number
    width: number
    height: number
    radius: number
    fill: readonly SourcePaint[]
  }[]
  glyphs: readonly { sourceNodeId: string; file: string; width: number; height: number; x: number; y: number }[]
}
export const CATALOG_INVESTMENT_SOURCE_ROWS: readonly InvestmentSourceRow[] = [
  {
    variantId: '303:24751',
    width: 375,
    height: 105,
    texts: [
      {
        id: '303:21600',
        name: 'Trx Description',
        value: 'Diszruptìv Vegyes Alap 2004/F ',
        x: 56,
        y: 16,
        width: 303,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'Diszruptìv Vegyes Alap 2004/F ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21595',
        name: 'Message',
        value: 'RS123434343134',
        x: 56,
        y: 33,
        width: 303,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'RS123434343134',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.4000000059604645,
                  g: 0.4000000059604645,
                  b: 0.4000000059604645,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21596',
        name: 'Amount',
        value: '1 250',
        x: 268,
        y: 50,
        width: 49,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '1 250',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21599',
        name: 'Amount',
        value: ',44 CZK',
        x: 317,
        y: 57,
        width: 42,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: ',44 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8348:15744',
        name: 'percentage',
        value: '+ 4,55%',
        x: 282,
        y: 74,
        width: 49,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: '+ 4,55%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.239215686917305,
                  g: 0.4901960790157318,
                  b: 0.26274511218070984,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8348:15745',
        name: 'Decimal',
        value: '(1Y)',
        x: 335,
        y: 74,
        width: 24,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: '(1Y)',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24751',
        x: 0,
        y: 0,
        width: 375,
        height: 105,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '8828:967',
        file: 'source-303-24751-0.svg',
        width: 32.0,
        height: 32.0,
        x: 16,
        y: 36.5,
      },
    ],
  },
  {
    variantId: '310:8985',
    width: 138,
    height: 32,
    texts: [
      {
        id: '310:8932',
        name: 'MAKE PAYMENT',
        value: 'MAKE PAYMENT ',
        x: 48,
        y: 8.5,
        width: 86,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'MAKE PAYMENT ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '310:8985',
        x: 0,
        y: 0,
        width: 138,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8980392217636108,
              g: 0.8980392217636108,
              b: 0.8980392217636108,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '310:8933',
        file: 'row-310-8985-0.svg',
        width: 32.0,
        height: 32.0,
        x: 0,
        y: 0,
      },
    ],
  },
  {
    variantId: '310:8609',
    width: 375,
    height: 95,
    texts: [
      {
        id: '303:21935',
        name: 'Title',
        value: 'LOREM IPSUM',
        x: 16,
        y: 16,
        width: 343,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'LOREM IPSUM',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21937',
        name: 'Title',
        value: '123 453,00 CZK',
        x: 16,
        y: 38.5,
        width: 167.5,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: '123 453,00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21939',
        name: '-1 500',
        value: '-1 500',
        x: 191.5,
        y: 35,
        width: 125.5,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '-1 500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21940',
        name: 'Decimal',
        value: ',00 CZK',
        x: 317,
        y: 41,
        width: 42,
        height: 16,
        align: 'RIGHT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '310:8710',
        name: 'Title',
        value: 'RECURRENT',
        x: 16,
        y: 62.5,
        width: 66,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'RECURRENT',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21945',
        name: 'Message',
        value: '-1,8%',
        x: 113,
        y: 62.5,
        width: 246,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: '-1,8%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '310:8609',
        x: 0,
        y: 0,
        width: 375,
        height: 95,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '310:8711',
        file: 'family-310-9061-2.svg',
        width: 18.0,
        height: 18.0,
        x: 87,
        y: 61,
      },
    ],
  },
  {
    variantId: '303:24340',
    width: 375,
    height: 95,
    texts: [
      {
        id: '303:21954',
        name: 'Title',
        value: 'LOREM IPSUM',
        x: 16,
        y: 16,
        width: 343,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'LOREM IPSUM',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21956',
        name: 'Title',
        value: '123 453,00 CZK',
        x: 16,
        y: 38.5,
        width: 167.5,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: '123 453,00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21958',
        name: '-1 500',
        value: '+1 500',
        x: 191.5,
        y: 35,
        width: 125.5,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '+1 500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.239215686917305,
                  g: 0.4901960790157318,
                  b: 0.26274511218070984,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21959',
        name: 'Decimal',
        value: ',00 CZK',
        x: 317,
        y: 41,
        width: 42,
        height: 16,
        align: 'RIGHT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.239215686917305,
                  g: 0.4901960790157318,
                  b: 0.26274511218070984,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21962',
        name: 'Title',
        value: 'RECURRENT',
        x: 16,
        y: 62.5,
        width: 66,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'RECURRENT',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21964',
        name: 'Message',
        value: '+1,8%',
        x: 113,
        y: 62.5,
        width: 246,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: '+1,8%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.239215686917305,
                  g: 0.4901960790157318,
                  b: 0.26274511218070984,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24340',
        x: 0,
        y: 0,
        width: 375,
        height: 95,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '303:21963',
        file: 'family-310-9061-2.svg',
        width: 18.0,
        height: 18.0,
        x: 87,
        y: 61,
      },
    ],
  },
  {
    variantId: '303:24339',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:21713',
        name: 'Title',
        value: '2021/K PMAP 20210826',
        x: 16,
        y: 18,
        width: 272,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: '2021/K PMAP 20210826',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21716',
        name: 'Amount',
        value: '206',
        x: 16,
        y: 40,
        width: 33,
        height: 22,
        align: 'LEFT',
        segments: [
          {
            value: '206',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21715',
        name: ',00 CZK',
        value: ',00 CZK',
        x: 49,
        y: 44.5,
        width: 239,
        height: 13,
        align: 'LEFT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24339',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '303:21717',
        file: 'family-310-9061-3.svg',
        width: 32.0,
        height: 32.0,
        x: 327,
        y: 24,
      },
    ],
  },
  {
    variantId: '303:24338',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:23964',
        name: 'Title',
        value: '2021/K PMAP 20210826',
        x: 16,
        y: 18,
        width: 272,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: '2021/K PMAP 20210826',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23967',
        name: 'Amount',
        value: '206',
        x: 16,
        y: 40,
        width: 33,
        height: 22,
        align: 'LEFT',
        segments: [
          {
            value: '206',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23968',
        name: ',00 CZK',
        value: ',00 CZK',
        x: 49,
        y: 44.5,
        width: 42,
        height: 13,
        align: 'LEFT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23974',
        name: '(100,00 CURRENCY)',
        value: '(100,00 CURRENCY) ',
        x: 95,
        y: 43,
        width: 116,
        height: 16,
        align: 'LEFT',
        segments: [
          {
            value: '(100,00 CURRENCY) ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'PIXELS',
              value: 16,
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.20000000298023224,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24338',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '314:12126',
        file: 'family-310-9061-3.svg',
        width: 32.0,
        height: 32.0,
        x: 327,
        y: 24,
      },
    ],
  },
  {
    variantId: '310:8929',
    width: 375,
    height: 80,
    texts: [
      {
        id: '310:8921',
        name: 'Title',
        value: 'Equity',
        x: 28,
        y: 14.5,
        width: 44,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'Equity',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.20000000298023224,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '310:8918',
        name: 'Title',
        value: '30%',
        x: 295,
        y: 11,
        width: 40,
        height: 22,
        align: 'LEFT',
        segments: [
          {
            value: '30%',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.2222222238779068,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '310:8922',
        name: 'Title',
        value: '350 000,00 CZK \n',
        x: 28,
        y: 37,
        width: 319,
        height: 14,
        align: 'LEFT',
        segments: [
          {
            value: '350 000,00 CZK \n',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '310:8929',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '310:8920',
        file: 'family-310-9061-4.svg',
        width: 8.0,
        height: 8.0,
        x: 8,
        y: 18,
      },
    ],
  },
  {
    variantId: '303:24754',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:21699',
        name: 'Incipit',
        value: 'Total value',
        x: 16,
        y: 11.5,
        width: 343,
        height: 16,
        align: 'LEFT',
        segments: [
          {
            value: 'Total value',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 15,
            lineHeight: {
              unit: 'PIXELS',
              value: 16,
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.20000000298023224,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8778:545',
        name: 'Title',
        value: '350 000',
        x: 16,
        y: 35.5,
        width: 104,
        height: 33,
        align: 'LEFT',
        segments: [
          {
            value: '350 000',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 30,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:21696',
        name: ',00 CZK',
        value: ',00 CZK',
        x: 122,
        y: 43.5,
        width: 69,
        height: 25,
        align: 'LEFT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24754',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [],
  },
  {
    variantId: '303:24341',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:23985',
        name: 'Trx Description',
        value: 'Diszruptìv Vegyes Alap ',
        x: 16,
        y: 13,
        width: 343,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'Diszruptìv Vegyes Alap ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23989',
        name: '-1 500',
        value: '-1 500',
        x: 195.5,
        y: 29,
        width: 121.5,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '-1 500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23990',
        name: 'Decimal',
        value: ',00 CZK',
        x: 317,
        y: 35,
        width: 42,
        height: 16,
        align: 'RIGHT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23981',
        name: 'SELL',
        value: 'SELL',
        x: 16,
        y: 52,
        width: 343,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'SELL',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24341',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [],
  },
  {
    variantId: '303:24342',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:23992',
        name: 'Trx Description',
        value: 'Diszruptìv Vegyes Alap ',
        x: 49,
        y: 13,
        width: 310,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'Diszruptìv Vegyes Alap ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23994',
        name: '-1 500',
        value: '+1 500',
        x: 195.5,
        y: 29,
        width: 121.5,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '+1 500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23995',
        name: 'Decimal',
        value: ',00 CZK',
        x: 317,
        y: 35,
        width: 42,
        height: 16,
        align: 'RIGHT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:23996',
        name: 'SELL',
        value: 'EXECUTED',
        x: 66,
        y: 52,
        width: 293,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'EXECUTED',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24342',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: '303:23997',
        x: 16,
        y: 24,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '303:23997',
        file: 'family-310-9061-5.svg',
        width: 32.0,
        height: 32.0,
        x: 16,
        y: 24,
      },
    ],
  },
  {
    variantId: '7927:14795',
    width: 375,
    height: 80,
    texts: [
      {
        id: '7927:14816',
        name: 'Trx Description',
        value: 'Diszruptìv Vegyes Alap ',
        x: 49,
        y: 13,
        width: 310,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'Diszruptìv Vegyes Alap ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7927:14818',
        name: '-1 500',
        value: '-1 500',
        x: 195.5,
        y: 29,
        width: 121.5,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '-1 500',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7927:14819',
        name: 'Decimal',
        value: ',00 CZK',
        x: 317,
        y: 35,
        width: 42,
        height: 16,
        align: 'RIGHT',
        segments: [
          {
            value: ',00 CZK',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7927:14821',
        name: 'SELL',
        value: 'EXECUTED',
        x: 66,
        y: 52,
        width: 293,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'EXECUTED',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '7927:14795',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '7927:14801',
        file: 'family-310-9061-6.svg',
        width: 32.0,
        height: 32.0,
        x: 16,
        y: 24,
      },
    ],
  },
  {
    variantId: '303:24358',
    width: 375,
    height: 96,
    texts: [
      {
        id: '303:24348',
        name: 'Title',
        value: 'DEBIT CURRENT ACCOUNT',
        x: 24,
        y: 8,
        width: 295,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'DEBIT CURRENT ACCOUNT',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.4000000059604645,
                  g: 0.4000000059604645,
                  b: 0.4000000059604645,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24349',
        name: 'Text',
        value: 'TBSZ 2020 EP - 00000000000',
        x: 24,
        y: 27,
        width: 295,
        height: 22,
        align: 'LEFT',
        segments: [
          {
            value: 'TBSZ 2020 EP - 00000000000',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24353',
        name: 'Messages',
        value: 'Available balance 500 000.00 czk',
        x: 24,
        y: 59.5,
        width: 295,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'Available balance 500 000.00 czk',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.4000000059604645,
                  g: 0.4000000059604645,
                  b: 0.4000000059604645,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24358',
        x: 0,
        y: 0,
        width: 375,
        height: 96,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: 'I303:24355;0:58046',
        x: 331,
        y: 20,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9607843160629272,
              g: 0.9607843160629272,
              b: 0.9607843160629272,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '303:24351',
        file: 'row-303-24358-0.svg',
        width: 295.0,
        height: 0.5,
        x: 24,
        y: 53,
      },
    ],
  },
  {
    variantId: '303:24408',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:24394',
        name: 'ATM Name',
        value: 'TITLE',
        x: 64,
        y: 24,
        width: 255,
        height: 32,
        align: 'LEFT',
        segments: [
          {
            value: 'TITLE',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 1,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24408',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: 'I303:24393;0:58046',
        x: 16,
        y: 24,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9607843160629272,
              g: 0.9607843160629272,
              b: 0.9607843160629272,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: 'I303:24401;0:58046',
        x: 327,
        y: 24,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9607843160629272,
              g: 0.9607843160629272,
              b: 0.9607843160629272,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '303:24402',
        file: 'row-303-24408-1.svg',
        width: 343.0,
        height: 1.0,
        x: 16,
        y: 79,
      },
    ],
  },
  {
    variantId: '303:24409',
    width: 375,
    height: 87,
    texts: [
      {
        id: '303:24382',
        name: 'Title',
        value: 'LABLE LOREM',
        x: 16,
        y: 24,
        width: 295,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'LABLE LOREM',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24383',
        name: 'Desc',
        value: 'Value Lorem',
        x: 16,
        y: 43,
        width: 295,
        height: 20,
        align: 'LEFT',
        segments: [
          {
            value: 'Value Lorem',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24409',
        x: 0,
        y: 0,
        width: 375,
        height: 87,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: 'I303:24384;0:58046',
        x: 327,
        y: 27.5,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9607843160629272,
              g: 0.9607843160629272,
              b: 0.9607843160629272,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [],
  },
  {
    variantId: '303:24453',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:24449',
        name: 'Desc',
        value: 'Label Lorem',
        x: 16,
        y: 20.5,
        width: 295,
        height: 20,
        align: 'LEFT',
        segments: [
          {
            value: 'Label Lorem',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24448',
        name: 'Title',
        value: 'Value lorem',
        x: 16,
        y: 44.5,
        width: 295,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'Value lorem',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24453',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: 'I303:24450;0:58046',
        x: 327,
        y: 24,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9607843160629272,
              g: 0.9607843160629272,
              b: 0.9607843160629272,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [],
  },
  {
    variantId: '303:24612',
    width: 375,
    height: 80,
    texts: [
      {
        id: '303:24605',
        name: 'Desc',
        value: 'EX-ANTE COSTS',
        x: 72,
        y: 23,
        width: 287,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'EX-ANTE COSTS',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24606',
        name: 'Title',
        value: 'Ex-Ante costs not retrievable!',
        x: 72,
        y: 42,
        width: 287,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'Ex-Ante costs not retrievable!',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.8117647171020508,
                  g: 0.2078431397676468,
                  b: 0.1411764770746231,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24612',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
      {
        id: 'I303:24607;0:58046',
        x: 24,
        y: 24,
        width: 32,
        height: 32,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9607843160629272,
              g: 0.9607843160629272,
              b: 0.9607843160629272,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [],
  },
  {
    variantId: '303:24378',
    width: 375,
    height: 80,
    texts: [
      {
        id: 'I7927:14231;0:9216',
        name: 'DD',
        value: '1',
        x: 23,
        y: 21.5,
        width: 10,
        height: 20,
        align: 'CENTER',
        segments: [
          {
            value: '1',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: 'I7927:14231;0:9215',
        name: 'MMM',
        value: 'OCT',
        x: 16,
        y: 43.5,
        width: 24,
        height: 15,
        align: 'CENTER',
        segments: [
          {
            value: 'OCT',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.4000000059604645,
                  g: 0.4000000059604645,
                  b: 0.4000000059604645,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24377',
        name: 'ACTIVE',
        value: 'ACTIVE',
        x: 56,
        y: 32.5,
        width: 42,
        height: 15,
        align: 'LEFT',
        segments: [
          {
            value: 'ACTIVE',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24367',
        name: 'Amount',
        value: '2021/K PMAP 20210826',
        x: 112,
        y: 11,
        width: 247,
        height: 17,
        align: 'RIGHT',
        segments: [
          {
            value: '2021/K PMAP 20210826',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 15,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24368',
        name: 'Amount',
        value: '- 405,000.00 RSD',
        x: 112,
        y: 30,
        width: 247,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '- 405,000.',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '00',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 13,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 1,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ' ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: 'RSD',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 13,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:24369',
        name: 'Amount',
        value: 'MONTHLY',
        x: 112,
        y: 54,
        width: 247,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'MONTHLY',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '303:24378',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '303:24370',
        file: 'row-303-24378-0.svg',
        width: 315.0,
        height: 1.0,
        x: 60,
        y: 79,
      },
    ],
  },
  {
    variantId: '7927:14235',
    width: 375,
    height: 80,
    texts: [
      {
        id: 'I7927:14237;0:9216',
        name: 'DD',
        value: '1',
        x: 23,
        y: 21.5,
        width: 10,
        height: 20,
        align: 'CENTER',
        segments: [
          {
            value: '1',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: 'I7927:14237;0:9215',
        name: 'MMM',
        value: 'OCT',
        x: 16,
        y: 43.5,
        width: 24,
        height: 15,
        align: 'CENTER',
        segments: [
          {
            value: 'OCT',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.4000000059604645,
                  g: 0.4000000059604645,
                  b: 0.4000000059604645,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7927:14240',
        name: 'Amount',
        value: '2021/K PMAP 20210826',
        x: 112,
        y: 11,
        width: 247,
        height: 17,
        align: 'RIGHT',
        segments: [
          {
            value: '2021/K PMAP 20210826',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 15,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7927:14241',
        name: 'Amount',
        value: '- 405,000.00 RSD',
        x: 112,
        y: 30,
        width: 247,
        height: 22,
        align: 'RIGHT',
        segments: [
          {
            value: '- 405,000.',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: '00',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 13,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 1,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: ' ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
          {
            value: 'RSD',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 13,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PIXELS',
              value: 0.30000001192092896,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '7927:14242',
        name: 'Amount',
        value: 'MONTHLY',
        x: 112,
        y: 54,
        width: 247,
        height: 15,
        align: 'RIGHT',
        segments: [
          {
            value: 'MONTHLY',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    shapes: [
      {
        id: '7927:14235',
        x: 0,
        y: 0,
        width: 375,
        height: 80,
        radius: 0,
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
      },
    ],
    glyphs: [
      {
        sourceNodeId: '7927:14247',
        file: 'family-310-9061-12.svg',
        width: 32.0,
        height: 32.0,
        x: 56,
        y: 24,
      },
      {
        sourceNodeId: '7927:14243',
        file: 'row-303-24378-0.svg',
        width: 315.0,
        height: 1.0,
        x: 60,
        y: 79,
      },
    ],
  },
]

export const CATALOG_PFM_PLOT_MARK_IDS: Readonly<Record<string, readonly string[]>> = {
  '715:8125': ['715:8361', '715:8362', '715:8363', '715:8364', '715:8365', '715:8366', '715:8367'],
  '1518:4734': ['1518:4873'],
  '715:8151': ['1156:10162', '1156:10163'],
  '1518:4781': ['1518:4890', '1518:4891'],
  '715:8184': ['715:8410', '715:8411'],
  '1518:4794': ['I1518:4876;0:9277', 'I1518:4876;0:9278'],
  '1057:21700': ['1057:21702', '1057:21707', '1057:21712', '1057:21717'],
  '1057:21734': ['1057:21737'],
  '7047:1937': ['7047:1974', '7047:1975', '7047:1976'],
  '7160:1522': ['7160:1531', '7160:1532', '7160:1533', '7160:1534', '7160:1535'],
  '7160:1551': ['7160:1554', '7160:1555', '7160:1570', '7160:1568', '7160:1556', '7160:1557', '7160:1558'],
  '7064:1461': ['7064:1464'],
  '7065:1754': ['7065:1761', '7065:1762'],
}

export interface OriginalContentPhotoPaint {
  type: string
  imageHash: string
  scaleMode: string
  scalingFactor?: number
  rotation?: number
  opacity?: number
  imageTransform?: readonly (readonly number[])[]
}
export interface OriginalContentPhotoLayer {
  id: string
  w: number
  h: number
  transform: readonly number[]
  radius?: number
  images: readonly OriginalContentPhotoPaint[]
  masks: readonly string[]
  opacity: number
}
export interface CatalogCampaignCopy {
  id: string
  value: string
  w: number
  h: number
  transform: readonly number[]
  align: string
  segments: readonly {
    value: string
    fontName: { family: string; style: string }
    fontSize: number
    lineHeight: { unit: string; value?: number }
    letterSpacing: { unit: string; value: number }
    fills: readonly SourcePaint[]
  }[]
}
export interface CatalogCampaignScene {
  variantId: string
  familyId: string
  pageId: string
  width: number
  height: number
  marks: readonly SourceGraphMark[]
  texts: readonly CatalogCampaignCopy[]
  photos: readonly OriginalContentPhotoLayer[]
  order: readonly { kind: 'mark' | 'photo'; id: string }[]
}
export const CATALOG_CAMPAIGN_SOURCE_SCENES: readonly CatalogCampaignScene[] = [
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:4924',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:4927',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:4928',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:4931',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:4928'],
      },
      {
        id: '804:4938',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5207',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:4936',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5481',
        w: 150,
        h: 230,
        transform: [1, 0, 0, 1, 205, -13],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '1522f33794c134d83d662fd2fbb4c9f195e5f44e',
          },
        ],
        masks: ['804:4938'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:4927',
      },
      {
        kind: 'mark',
        id: '804:4928',
      },
      {
        kind: 'mark',
        id: '804:4931',
      },
      {
        kind: 'mark',
        id: '804:4938',
      },
      {
        kind: 'photo',
        id: '823:5481',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:4940',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:4943',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:4944',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:4946',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:4944'],
      },
      {
        id: '804:4954',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5218',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5219',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5488',
        w: 249,
        h: 166,
        transform: [1, 0, 0, 1, 122, -9],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: 'b7cf1d8f79545e151d558b270b41e7ce9bfb932b',
          },
        ],
        masks: ['804:4954'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:4943',
      },
      {
        kind: 'mark',
        id: '804:4944',
      },
      {
        kind: 'mark',
        id: '804:4946',
      },
      {
        kind: 'mark',
        id: '804:4954',
      },
      {
        kind: 'photo',
        id: '823:5488',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:4956',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:4959',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:4960',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:4962',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:4960'],
      },
      {
        id: '804:4969',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5212',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5213',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5472',
        w: 320,
        h: 213,
        transform: [1, 0, 0, 1, 226, -17],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '062388f55867b58a1549c579e0f837b94ffc925c',
          },
        ],
        masks: ['804:4969'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:4959',
      },
      {
        kind: 'mark',
        id: '804:4960',
      },
      {
        kind: 'mark',
        id: '804:4962',
      },
      {
        kind: 'mark',
        id: '804:4969',
      },
      {
        kind: 'photo',
        id: '823:5472',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:4971',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:4974',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:4975',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.0235294122248888,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:4978',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.929411768913269,
              g: 0.729411780834198,
              b: 0,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:4975'],
      },
      {
        id: '804:4985',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '823:5485',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: ['804:4985'],
      },
    ],
    texts: [
      {
        id: '804:5209',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5210',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5486',
        w: 150,
        h: 230,
        transform: [1, 0, 0, 1, 205, -13],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '1522f33794c134d83d662fd2fbb4c9f195e5f44e',
          },
        ],
        masks: ['804:4985', '823:5485'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:4974',
      },
      {
        kind: 'mark',
        id: '804:4975',
      },
      {
        kind: 'mark',
        id: '804:4978',
      },
      {
        kind: 'mark',
        id: '804:4985',
      },
      {
        kind: 'mark',
        id: '823:5485',
      },
      {
        kind: 'photo',
        id: '823:5486',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:4987',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:4990',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:4991',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:4993',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.8549019694328308,
              b: 0.7529411911964417,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:4991'],
      },
      {
        id: '823:5491',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5221',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5222',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5492',
        w: 249,
        h: 166,
        transform: [1, 0, 0, 1, 122, -9],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: 'b7cf1d8f79545e151d558b270b41e7ce9bfb932b',
          },
        ],
        masks: ['823:5491'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:4990',
      },
      {
        kind: 'mark',
        id: '804:4991',
      },
      {
        kind: 'mark',
        id: '804:4993',
      },
      {
        kind: 'mark',
        id: '823:5491',
      },
      {
        kind: 'photo',
        id: '823:5492',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5003',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:5006',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:5007',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:5009',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:5007'],
      },
      {
        id: '804:5016',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '823:5478',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: ['804:5016'],
      },
    ],
    texts: [
      {
        id: '804:5215',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5216',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5479',
        w: 320,
        h: 213,
        transform: [1, 0, 0, 1, 226, -17],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '062388f55867b58a1549c579e0f837b94ffc925c',
          },
        ],
        masks: ['804:5016', '823:5478'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:5006',
      },
      {
        kind: 'mark',
        id: '804:5007',
      },
      {
        kind: 'mark',
        id: '804:5009',
      },
      {
        kind: 'mark',
        id: '804:5016',
      },
      {
        kind: 'mark',
        id: '823:5478',
      },
      {
        kind: 'photo',
        id: '823:5479',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5018',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:5021',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:5022',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:5024',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.7254902124404907,
              b: 0.7254902124404907,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:5022'],
      },
      {
        id: '804:5032',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5224',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5225',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5460',
        w: 159,
        h: 240,
        transform: [1, 0, 0, 1, 229, -6],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '52f0b74fc5514876138a58023ca6c8710d0db3a8',
          },
        ],
        masks: ['804:5032'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:5021',
      },
      {
        kind: 'mark',
        id: '804:5022',
      },
      {
        kind: 'mark',
        id: '804:5024',
      },
      {
        kind: 'mark',
        id: '804:5032',
      },
      {
        kind: 'photo',
        id: '823:5460',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5226',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:5229',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:5230',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:5233',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:5230'],
      },
      {
        id: '804:5240',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5237',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5238',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5457',
        w: 297,
        h: 197,
        transform: [1, 0, 0, 1, 142, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: 'a1100374f41efc6eebb88a42a630ae11d11d46b7',
          },
        ],
        masks: ['804:5240'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:5229',
      },
      {
        kind: 'mark',
        id: '804:5230',
      },
      {
        kind: 'mark',
        id: '804:5233',
      },
      {
        kind: 'mark',
        id: '804:5240',
      },
      {
        kind: 'photo',
        id: '823:5457',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5244',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:5247',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:5248',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:5251',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:5248'],
      },
      {
        id: '804:5258',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5374',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5375',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5453',
        w: 364,
        h: 485,
        transform: [1, 0, 0, 1, 0, -114],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '8bf47e8592cbf7929143b9a8033355e0430fc1c8',
          },
        ],
        masks: ['804:5258'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:5247',
      },
      {
        kind: 'mark',
        id: '804:5248',
      },
      {
        kind: 'mark',
        id: '804:5251',
      },
      {
        kind: 'mark',
        id: '804:5258',
      },
      {
        kind: 'photo',
        id: '823:5453',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5262',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:5265',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:5266',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:5269',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.5215686559677124,
              b: 0.45490196347236633,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:5266'],
      },
      {
        id: '804:5276',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5377',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5378',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5454',
        w: 364,
        h: 485,
        transform: [1, 0, 0, 1, 0, -114],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '8bf47e8592cbf7929143b9a8033355e0430fc1c8',
          },
        ],
        masks: ['804:5276'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:5265',
      },
      {
        kind: 'mark',
        id: '804:5266',
      },
      {
        kind: 'mark',
        id: '804:5269',
      },
      {
        kind: 'mark',
        id: '804:5276',
      },
      {
        kind: 'photo',
        id: '823:5454',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5280',
    width: 343,
    height: 157,
    marks: [
      {
        id: '804:5283',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '804:5284',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '804:5287',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.886274516582489,
              g: 0,
              b: 0.10196078568696976,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['804:5284'],
      },
      {
        id: '804:5294',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5371',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5372',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5458',
        w: 297,
        h: 197,
        transform: [1, 0, 0, 1, 142, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: 'a1100374f41efc6eebb88a42a630ae11d11d46b7',
          },
        ],
        masks: ['804:5294'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '804:5283',
      },
      {
        kind: 'mark',
        id: '804:5284',
      },
      {
        kind: 'mark',
        id: '804:5287',
      },
      {
        kind: 'mark',
        id: '804:5294',
      },
      {
        kind: 'photo',
        id: '823:5458',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5298',
    width: 343,
    height: 157,
    marks: [
      {
        id: '805:2884',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '805:2885',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '805:2887',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.8279 -36L160.486 78L41.8279 192C24.919 176.767 24.919 152.064 41.8279 136.824L103.055 78L41.8279 19.176C24.919 3.9356 24.919 -20.7596 41.8279 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['805:2885'],
      },
      {
        id: '804:5312',
        name: 'Rectangle',
        kind: 'rect',
        w: 101,
        h: 157,
        transform: [1, 0, 0, 1, 242, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5380',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5381',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5450',
        w: 236,
        h: 157,
        transform: [1, 0, 0, 1, 120, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '2e8283e3e1e8b7a215fd9ea174cb77d570ede24a',
          },
        ],
        masks: ['804:5312'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '805:2884',
      },
      {
        kind: 'mark',
        id: '805:2885',
      },
      {
        kind: 'mark',
        id: '805:2887',
      },
      {
        kind: 'mark',
        id: '804:5312',
      },
      {
        kind: 'photo',
        id: '823:5450',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5352',
    width: 343,
    height: 157,
    marks: [
      {
        id: '805:2872',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '805:2873',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '805:2876',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.8279 -36L160.486 78L41.8279 192C24.919 176.767 24.919 152.064 41.8279 136.824L103.055 78L41.8279 19.176C24.919 3.9356 24.919 -20.7596 41.8279 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.2705882489681244,
              g: 0.2705882489681244,
              b: 0.2705882489681244,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['805:2873'],
      },
      {
        id: '804:5366',
        name: 'Rectangle',
        kind: 'rect',
        w: 101,
        h: 157,
        transform: [1, 0, 0, 1, 242, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5386',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5387',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '817:5446',
        w: 279,
        h: 186,
        transform: [1, 0, 0, 1, 195, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: 'edcba91c37adb05deb0a05f3a303fabf60cfa09f',
          },
        ],
        masks: ['804:5366'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '805:2872',
      },
      {
        kind: 'mark',
        id: '805:2873',
      },
      {
        kind: 'mark',
        id: '805:2876',
      },
      {
        kind: 'mark',
        id: '804:5366',
      },
      {
        kind: 'photo',
        id: '817:5446',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '815:5402',
    width: 343,
    height: 157,
    marks: [
      {
        id: '815:5405',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.4000000059604645,
              g: 0.4000000059604645,
              b: 0.4000000059604645,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '815:5413',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '815:5414',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [],
    order: [
      {
        kind: 'mark',
        id: '815:5405',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '825:5493',
    width: 343,
    height: 157,
    marks: [
      {
        id: '825:5496',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.5647059082984924,
              g: 0.5647059082984924,
              b: 0.5647059082984924,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
    ],
    texts: [
      {
        id: '825:5499',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '825:5500',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [],
    order: [
      {
        kind: 'mark',
        id: '825:5496',
      },
    ],
  },
  {
    pageId: '0:9708',
    familyId: '804:4923',
    variantId: '804:5316',
    width: 343,
    height: 157,
    marks: [
      {
        id: '805:2895',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '805:2896',
        name: 'Mask',
        kind: 'path',
        w: 343,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 343 0 L 343 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '805:2898',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M41.8279 -36L160.486 78L41.8279 192C24.919 176.767 24.919 152.064 41.8279 136.824L103.055 78L41.8279 19.176C24.919 3.9356 24.919 -20.7596 41.8279 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z',
          },
        ],
        w: 239.1559600830078,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.019607843831181526,
              g: 0.5098039507865906,
              b: 0.6039215922355652,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['805:2896'],
      },
      {
        id: '804:5330',
        name: 'Rectangle',
        kind: 'rect',
        w: 100.69725036621094,
        h: 157,
        transform: [1, 0, 0, 1, 242.302734375, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '804:5383',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 210,
        h: 48,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 22,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '804:5384',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 210,
        h: 60,
        transform: [1, 0, 0, 1, 16, 72],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '823:5451',
        w: 236,
        h: 157,
        transform: [1, 0, 0, 1, 120, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'FILL',
            scalingFactor: 0.5,
            rotation: 0,
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
            imageHash: '2e8283e3e1e8b7a215fd9ea174cb77d570ede24a',
          },
        ],
        masks: ['804:5330'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '805:2895',
      },
      {
        kind: 'mark',
        id: '805:2896',
      },
      {
        kind: 'mark',
        id: '805:2898',
      },
      {
        kind: 'mark',
        id: '804:5330',
      },
      {
        kind: 'photo',
        id: '823:5451',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:204',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:207',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:208',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:211',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:208'],
      },
      {
        id: '8889:218',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:215',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:216',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:219',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9162665605545044, 0, 0.03817777335643768],
              [0, 1, 0],
            ],
            imageHash: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
          },
        ],
        masks: ['8889:218'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:207',
      },
      {
        kind: 'mark',
        id: '8889:208',
      },
      {
        kind: 'mark',
        id: '8889:211',
      },
      {
        kind: 'mark',
        id: '8889:218',
      },
      {
        kind: 'photo',
        id: '8889:219',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:220',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:223',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:224',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:226',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:224'],
      },
      {
        id: '8889:234',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:230',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:231',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:235',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.537155032157898],
              [0, 1, 0],
            ],
            imageHash: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
          },
        ],
        masks: ['8889:234'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:223',
      },
      {
        kind: 'mark',
        id: '8889:224',
      },
      {
        kind: 'mark',
        id: '8889:226',
      },
      {
        kind: 'mark',
        id: '8889:234',
      },
      {
        kind: 'photo',
        id: '8889:235',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:236',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:239',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:240',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:242',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:240'],
      },
      {
        id: '8889:249',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:246',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:247',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:250',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4032291769981384, 0, 0.2565477192401886],
              [0, 1, 0],
            ],
            imageHash: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
          },
        ],
        masks: ['8889:249'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:239',
      },
      {
        kind: 'mark',
        id: '8889:240',
      },
      {
        kind: 'mark',
        id: '8889:242',
      },
      {
        kind: 'mark',
        id: '8889:249',
      },
      {
        kind: 'photo',
        id: '8889:250',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:251',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:254',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:255',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.0235294122248888,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:258',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.929411768913269,
              g: 0.729411780834198,
              b: 0,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:255'],
      },
      {
        id: '8889:265',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:262',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:263',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:267',
        value: 'Bottom banners',
        w: 266,
        h: 44,
        transform: [1, 0, 0, 1, -13, 372],
        align: 'LEFT',
        segments: [
          {
            value: 'Bottom banners',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 40,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0,
                  g: 0,
                  b: 0,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:266',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9162665605545044, 0, 0.03817777335643768],
              [0, 1, 0],
            ],
            imageHash: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
          },
        ],
        masks: ['8889:265'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:254',
      },
      {
        kind: 'mark',
        id: '8889:255',
      },
      {
        kind: 'mark',
        id: '8889:258',
      },
      {
        kind: 'mark',
        id: '8889:265',
      },
      {
        kind: 'photo',
        id: '8889:266',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:268',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:271',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:272',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:274',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.8549019694328308,
              b: 0.7529411911964417,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:272'],
      },
      {
        id: '8889:282',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:278',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:279',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:283',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.537155032157898],
              [0, 1, 0],
            ],
            imageHash: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
          },
        ],
        masks: ['8889:282'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:271',
      },
      {
        kind: 'mark',
        id: '8889:272',
      },
      {
        kind: 'mark',
        id: '8889:274',
      },
      {
        kind: 'mark',
        id: '8889:282',
      },
      {
        kind: 'photo',
        id: '8889:283',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:284',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:287',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:288',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:290',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M40.377 -35.5L153.5 78.5L40.377 192.5C24.2569 177.267 24.2569 152.564 40.377 137.324L98.748 78.5L40.377 19.676C24.2569 4.4356 24.2569 -20.2596 40.377 -35.5ZM-62.41 -35.5L50.713 78.5L-62.41 192.5C-78.53 177.267 -78.53 152.564 -62.41 137.324L-4.03849 78.5L-62.41 19.676C-78.53 4.4356 -78.53 -20.2596 -62.41 -35.5Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:288'],
      },
      {
        id: '8889:297',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:294',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:295',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:298',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4032291769981384, 0, 0.2565477192401886],
              [0, 1, 0],
            ],
            imageHash: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
          },
        ],
        masks: ['8889:297'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:287',
      },
      {
        kind: 'mark',
        id: '8889:288',
      },
      {
        kind: 'mark',
        id: '8889:290',
      },
      {
        kind: 'mark',
        id: '8889:297',
      },
      {
        kind: 'photo',
        id: '8889:298',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:299',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:302',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5647059082984924,
              g: 0.5647059082984924,
              b: 0.5647059082984924,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:303',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:305',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.7254902124404907,
              b: 0.7254902124404907,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:303'],
      },
      {
        id: '8889:313',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '8889:309',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 207,
        h: 40,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:310',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 207,
        h: 54,
        transform: [1, 0, 0, 1, 16, 64],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:314',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.3659999668598175, 0, 0.3164375126361847],
              [0, 0.8971428275108337, 0.0911429226398468],
            ],
            imageHash: '97420d93298e277c42046cfc4a87bcf25be5d8ea',
          },
        ],
        masks: ['8889:313'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:302',
      },
      {
        kind: 'mark',
        id: '8889:303',
      },
      {
        kind: 'mark',
        id: '8889:305',
      },
      {
        kind: 'mark',
        id: '8889:313',
      },
      {
        kind: 'photo',
        id: '8889:314',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:315',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:318',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:319',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:322',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.886274516582489,
              g: 0,
              b: 0.10196078568696976,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:319'],
      },
      {
        id: '8889:329',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:332',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:329'],
      },
      {
        id: 'I8889:333;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:329'],
      },
    ],
    texts: [
      {
        id: '8889:326',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:327',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I8889:330;1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['8889:329'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:318',
      },
      {
        kind: 'mark',
        id: '8889:319',
      },
      {
        kind: 'mark',
        id: '8889:322',
      },
      {
        kind: 'mark',
        id: '8889:329',
      },
      {
        kind: 'photo',
        id: 'I8889:330;1287:6546',
      },
      {
        kind: 'mark',
        id: '8889:332',
      },
      {
        kind: 'mark',
        id: 'I8889:333;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:334',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:337',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:338',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:341',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:338'],
      },
      {
        id: '8889:348',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:351',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:348'],
      },
      {
        id: 'I8889:352;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:348'],
      },
    ],
    texts: [
      {
        id: '8889:345',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:346',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I8889:349;1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['8889:348'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:337',
      },
      {
        kind: 'mark',
        id: '8889:338',
      },
      {
        kind: 'mark',
        id: '8889:341',
      },
      {
        kind: 'mark',
        id: '8889:348',
      },
      {
        kind: 'photo',
        id: 'I8889:349;1287:6546',
      },
      {
        kind: 'mark',
        id: '8889:351',
      },
      {
        kind: 'mark',
        id: 'I8889:352;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:353',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:356',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:357',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:359',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.5215686559677124,
              b: 0.45490196347236633,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:357'],
      },
      {
        id: '8889:366',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:369',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:366'],
      },
      {
        id: 'I8889:370;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:366'],
      },
    ],
    texts: [
      {
        id: '8889:363',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:364',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I8889:367;1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['8889:366'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:356',
      },
      {
        kind: 'mark',
        id: '8889:357',
      },
      {
        kind: 'mark',
        id: '8889:359',
      },
      {
        kind: 'mark',
        id: '8889:366',
      },
      {
        kind: 'photo',
        id: 'I8889:367;1250:5978',
      },
      {
        kind: 'mark',
        id: '8889:369',
      },
      {
        kind: 'mark',
        id: 'I8889:370;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:371',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:374',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:375',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:377',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:375'],
      },
      {
        id: '8889:384',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:387',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:384'],
      },
      {
        id: 'I8889:388;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:384'],
      },
    ],
    texts: [
      {
        id: '8889:381',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:382',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I8889:385;1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['8889:384'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:374',
      },
      {
        kind: 'mark',
        id: '8889:375',
      },
      {
        kind: 'mark',
        id: '8889:377',
      },
      {
        kind: 'mark',
        id: '8889:384',
      },
      {
        kind: 'photo',
        id: 'I8889:385;1250:5978',
      },
      {
        kind: 'mark',
        id: '8889:387',
      },
      {
        kind: 'mark',
        id: 'I8889:388;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:389',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:392',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:393',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:395',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.019607843831181526,
              g: 0.5098039507865906,
              b: 0.6039215922355652,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:393'],
      },
      {
        id: '8889:402',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:405',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:402'],
      },
      {
        id: 'I8889:406;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:402'],
      },
    ],
    texts: [
      {
        id: '8889:399',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:400',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:403',
        w: 100,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9571759700775146, 0, 0.03828703984618187],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['8889:402'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:392',
      },
      {
        kind: 'mark',
        id: '8889:393',
      },
      {
        kind: 'mark',
        id: '8889:395',
      },
      {
        kind: 'mark',
        id: '8889:402',
      },
      {
        kind: 'photo',
        id: '8889:403',
      },
      {
        kind: 'mark',
        id: '8889:405',
      },
      {
        kind: 'mark',
        id: 'I8889:406;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:407',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:410',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:411',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:413',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:411'],
      },
      {
        id: '8889:420',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:423',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:420'],
      },
      {
        id: 'I8889:424;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:420'],
      },
    ],
    texts: [
      {
        id: '8889:417',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:418',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:421',
        w: 100,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9571759700775146, 0, 0.03828703984618187],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['8889:420'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:410',
      },
      {
        kind: 'mark',
        id: '8889:411',
      },
      {
        kind: 'mark',
        id: '8889:413',
      },
      {
        kind: 'mark',
        id: '8889:420',
      },
      {
        kind: 'photo',
        id: '8889:421',
      },
      {
        kind: 'mark',
        id: '8889:423',
      },
      {
        kind: 'mark',
        id: 'I8889:424;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '8889:203',
    variantId: '8889:425',
    width: 327,
    height: 157,
    marks: [
      {
        id: '8889:428',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '8889:429',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:432',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.2705882489681244,
              g: 0.2705882489681244,
              b: 0.2705882489681244,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:429'],
      },
      {
        id: '8889:439',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '8889:442',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 285, 10],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:439'],
      },
      {
        id: 'I8889:443;0:5717',
        name: 'Icon',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 295, 20],
        paths: [
          {
            windingRule: 'NONZERO',
            data: 'M 11.73378849029541 0.2753128409385681 L 11.73378849029541 0.2753128409385681 C 11.378839671611786 -0.07963597774505615 10.805460751056671 -0.07963597774505615 10.450511932373047 0.2753128409385681 L 6 4.716723442077637 L 1.5494880676269531 0.266211599111557 C 1.1945392489433289 -0.08873721957206726 0.6211604177951813 -0.08873721957206726 0.266211599111557 0.266211599111557 L 0.266211599111557 0.266211599111557 C -0.08873721957206726 0.6211604177951813 -0.08873721957206726 1.1945392489433289 0.266211599111557 1.5494880676269531 L 4.716723442077637 6 L 0.266211599111557 10.450511932373047 C -0.08873721957206726 10.805460751056671 -0.08873721957206726 11.378839671611786 0.266211599111557 11.73378849029541 L 0.266211599111557 11.73378849029541 C 0.6211604177951813 12.088737308979034 1.1945392489433289 12.088737308979034 1.5494880676269531 11.73378849029541 L 6 7.283276557922363 L 10.450511932373047 11.73378849029541 C 10.805460751056671 12.088737308979034 11.378839671611786 12.088737308979034 11.73378849029541 11.73378849029541 L 11.73378849029541 11.73378849029541 C 12.088737308979034 11.378839671611786 12.088737308979034 10.805460751056671 11.73378849029541 10.450511932373047 L 7.283276557922363 6 L 11.73378849029541 1.5494880676269531 C 12.079636037349701 1.2036405205726624 12.079636037349701 0.6211603879928589 11.73378849029541 0.2753128409385681 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['8889:439'],
      },
    ],
    texts: [
      {
        id: '8889:436',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 206,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '8889:437',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 206,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '8889:440',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4079620838165283, 0, 0.3625600039958954],
              [0, 1, 0],
            ],
            imageHash: '075bb08e86f2145ad6e9192c37d9c4d24de7f168',
          },
        ],
        masks: ['8889:439'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '8889:428',
      },
      {
        kind: 'mark',
        id: '8889:429',
      },
      {
        kind: 'mark',
        id: '8889:432',
      },
      {
        kind: 'mark',
        id: '8889:439',
      },
      {
        kind: 'photo',
        id: '8889:440',
      },
      {
        kind: 'mark',
        id: '8889:442',
      },
      {
        kind: 'mark',
        id: 'I8889:443;0:5717',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8625',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8628',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8629',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8632',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8629'],
      },
      {
        id: '1093:8639',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8636',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8637',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8640',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9162665605545044, 0, 0.03817777335643768],
              [0, 1, 0],
            ],
            imageHash: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
          },
        ],
        masks: ['1093:8639'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8628',
      },
      {
        kind: 'mark',
        id: '1093:8629',
      },
      {
        kind: 'mark',
        id: '1093:8632',
      },
      {
        kind: 'mark',
        id: '1093:8639',
      },
      {
        kind: 'photo',
        id: '1093:8640',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8641',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8644',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8645',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8647',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8645'],
      },
      {
        id: '1093:8655',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8651',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8652',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8656',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.537155032157898],
              [0, 1, 0],
            ],
            imageHash: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
          },
        ],
        masks: ['1093:8655'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8644',
      },
      {
        kind: 'mark',
        id: '1093:8645',
      },
      {
        kind: 'mark',
        id: '1093:8647',
      },
      {
        kind: 'mark',
        id: '1093:8655',
      },
      {
        kind: 'photo',
        id: '1093:8656',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8657',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8660',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8661',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8663',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8661'],
      },
      {
        id: '1093:8670',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8667',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8668',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8671',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4032291769981384, 0, 0.2565477192401886],
              [0, 1, 0],
            ],
            imageHash: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
          },
        ],
        masks: ['1093:8670'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8660',
      },
      {
        kind: 'mark',
        id: '1093:8661',
      },
      {
        kind: 'mark',
        id: '1093:8663',
      },
      {
        kind: 'mark',
        id: '1093:8670',
      },
      {
        kind: 'photo',
        id: '1093:8671',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8672',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8675',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8676',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.0235294122248888,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8679',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.929411768913269,
              g: 0.729411780834198,
              b: 0,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8676'],
      },
      {
        id: '1093:8686',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8683',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8684',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8687',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9162665605545044, 0, 0.03817777335643768],
              [0, 1, 0],
            ],
            imageHash: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
          },
        ],
        masks: ['1093:8686'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8675',
      },
      {
        kind: 'mark',
        id: '1093:8676',
      },
      {
        kind: 'mark',
        id: '1093:8679',
      },
      {
        kind: 'mark',
        id: '1093:8686',
      },
      {
        kind: 'photo',
        id: '1093:8687',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8688',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8691',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8692',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8694',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.8549019694328308,
              b: 0.7529411911964417,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8692'],
      },
      {
        id: '1093:8702',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8698',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8699',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8703',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.537155032157898],
              [0, 1, 0],
            ],
            imageHash: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
          },
        ],
        masks: ['1093:8702'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8691',
      },
      {
        kind: 'mark',
        id: '1093:8692',
      },
      {
        kind: 'mark',
        id: '1093:8694',
      },
      {
        kind: 'mark',
        id: '1093:8702',
      },
      {
        kind: 'photo',
        id: '1093:8703',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8704',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8707',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8708',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8710',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M40.377 -35.5L153.5 78.5L40.377 192.5C24.2569 177.267 24.2569 152.564 40.377 137.324L98.748 78.5L40.377 19.676C24.2569 4.4356 24.2569 -20.2596 40.377 -35.5ZM-62.41 -35.5L50.713 78.5L-62.41 192.5C-78.53 177.267 -78.53 152.564 -62.41 137.324L-4.03849 78.5L-62.41 19.676C-78.53 4.4356 -78.53 -20.2596 -62.41 -35.5Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8708'],
      },
      {
        id: '1093:8717',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8714',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8715',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8718',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4032291769981384, 0, 0.2565477192401886],
              [0, 1, 0],
            ],
            imageHash: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
          },
        ],
        masks: ['1093:8717'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8707',
      },
      {
        kind: 'mark',
        id: '1093:8708',
      },
      {
        kind: 'mark',
        id: '1093:8710',
      },
      {
        kind: 'mark',
        id: '1093:8717',
      },
      {
        kind: 'photo',
        id: '1093:8718',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '1093:8719',
    width: 327,
    height: 157,
    marks: [
      {
        id: '1093:8722',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5647059082984924,
              g: 0.5647059082984924,
              b: 0.5647059082984924,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '1093:8723',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '1093:8725',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.7254902124404907,
              b: 0.7254902124404907,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['1093:8723'],
      },
      {
        id: '1093:8733',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '1093:8729',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 52,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '1093:8730',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 60,
        transform: [1, 0, 0, 1, 16, 76],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 18,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '1093:8734',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.3659999668598175, 0, 0.3164375126361847],
              [0, 0.8971428275108337, 0.0911429226398468],
            ],
            imageHash: '97420d93298e277c42046cfc4a87bcf25be5d8ea',
          },
        ],
        masks: ['1093:8733'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '1093:8722',
      },
      {
        kind: 'mark',
        id: '1093:8723',
      },
      {
        kind: 'mark',
        id: '1093:8725',
      },
      {
        kind: 'mark',
        id: '1093:8733',
      },
      {
        kind: 'photo',
        id: '1093:8734',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5922',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5925',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5926',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5929',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.886274516582489,
              g: 0,
              b: 0.10196078568696976,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5926'],
      },
      {
        id: '265:5935',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I7469:1716;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5935'],
      },
      {
        id: 'I7469:1716;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5935'],
      },
    ],
    texts: [
      {
        id: '265:5933',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5932',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I1287:6554;1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['265:5935'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5925',
      },
      {
        kind: 'mark',
        id: '265:5926',
      },
      {
        kind: 'mark',
        id: '265:5929',
      },
      {
        kind: 'mark',
        id: '265:5935',
      },
      {
        kind: 'photo',
        id: 'I1287:6554;1287:6546',
      },
      {
        kind: 'mark',
        id: 'I7469:1716;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I7469:1716;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5870',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5873',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5874',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5877',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5874'],
      },
      {
        id: '265:5883',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I7058:2143;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5883'],
      },
      {
        id: 'I7058:2143;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5883'],
      },
    ],
    texts: [
      {
        id: '265:5881',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5880',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I1287:6551;1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['265:5883'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5873',
      },
      {
        kind: 'mark',
        id: '265:5874',
      },
      {
        kind: 'mark',
        id: '265:5877',
      },
      {
        kind: 'mark',
        id: '265:5883',
      },
      {
        kind: 'photo',
        id: 'I1287:6551;1287:6546',
      },
      {
        kind: 'mark',
        id: 'I7058:2143;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I7058:2143;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5957',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5960',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5961',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5963',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.5215686559677124,
              b: 0.45490196347236633,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5961'],
      },
      {
        id: '265:5969',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I7470:1731;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5969'],
      },
      {
        id: 'I7470:1731;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5969'],
      },
    ],
    texts: [
      {
        id: '265:5967',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5966',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I1250:6068;1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['265:5969'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5960',
      },
      {
        kind: 'mark',
        id: '265:5961',
      },
      {
        kind: 'mark',
        id: '265:5963',
      },
      {
        kind: 'mark',
        id: '265:5969',
      },
      {
        kind: 'photo',
        id: 'I1250:6068;1250:5978',
      },
      {
        kind: 'mark',
        id: 'I7470:1731;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I7470:1731;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5905',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5908',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5909',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5911',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5909'],
      },
      {
        id: '265:5917',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '265:5915',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5914',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I1250:6065;1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['265:5917'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5908',
      },
      {
        kind: 'mark',
        id: '265:5909',
      },
      {
        kind: 'mark',
        id: '265:5911',
      },
      {
        kind: 'mark',
        id: '265:5917',
      },
      {
        kind: 'photo',
        id: 'I1250:6065;1250:5978',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5940',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5943',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5944',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5946',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.019607843831181526,
              g: 0.5098039507865906,
              b: 0.6039215922355652,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5944'],
      },
      {
        id: '265:5952',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I7470:1741;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 291, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5952'],
      },
      {
        id: 'I7470:1741;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 301, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5952'],
      },
    ],
    texts: [
      {
        id: '265:5950',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5949',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '265:5953',
        w: 100,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9571759700775146, 0, 0.03828703984618187],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['265:5952'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5943',
      },
      {
        kind: 'mark',
        id: '265:5944',
      },
      {
        kind: 'mark',
        id: '265:5946',
      },
      {
        kind: 'mark',
        id: '265:5952',
      },
      {
        kind: 'photo',
        id: '265:5953',
      },
      {
        kind: 'mark',
        id: 'I7470:1741;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I7470:1741;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5888',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5891',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5892',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5894',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5892'],
      },
      {
        id: '265:5900',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I7470:1736;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 291, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5900'],
      },
      {
        id: 'I7470:1736;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 301, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5900'],
      },
    ],
    texts: [
      {
        id: '265:5898',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5897',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '265:5901',
        w: 100,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9571759700775146, 0, 0.03828703984618187],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['265:5900'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5891',
      },
      {
        kind: 'mark',
        id: '265:5892',
      },
      {
        kind: 'mark',
        id: '265:5894',
      },
      {
        kind: 'mark',
        id: '265:5900',
      },
      {
        kind: 'photo',
        id: '265:5901',
      },
      {
        kind: 'mark',
        id: 'I7470:1736;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I7470:1736;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5974',
    width: 327,
    height: 157,
    marks: [
      {
        id: '265:5977',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '265:5978',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '265:5981',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.2705882489681244,
              g: 0.2705882489681244,
              b: 0.2705882489681244,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5978'],
      },
      {
        id: '265:5987',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I7470:1746;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5987'],
      },
      {
        id: 'I7470:1746;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['265:5987'],
      },
    ],
    texts: [
      {
        id: '265:5985',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 203,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '265:5984',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 203,
        h: 54,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '265:5988',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4079620838165283, 0, 0.3625600039958954],
              [0, 1, 0],
            ],
            imageHash: '075bb08e86f2145ad6e9192c37d9c4d24de7f168',
          },
        ],
        masks: ['265:5987'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '265:5977',
      },
      {
        kind: 'mark',
        id: '265:5978',
      },
      {
        kind: 'mark',
        id: '265:5981',
      },
      {
        kind: 'mark',
        id: '265:5987',
      },
      {
        kind: 'photo',
        id: '265:5988',
      },
      {
        kind: 'mark',
        id: 'I7470:1746;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I7470:1746;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:6001',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59712',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59713',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59715',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59716',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59718',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59716'],
      },
      {
        id: '303:59724',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59722',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59721',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '303:60205',
        w: 91,
        h: 198,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.30639731884002686, 0, 0.21885521709918976],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['303:59724'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59712',
      },
      {
        kind: 'mark',
        id: '303:59713',
      },
      {
        kind: 'mark',
        id: '303:59715',
      },
      {
        kind: 'mark',
        id: '303:59716',
      },
      {
        kind: 'mark',
        id: '303:59718',
      },
      {
        kind: 'mark',
        id: '303:59724',
      },
      {
        kind: 'photo',
        id: '303:60205',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:6003',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59795',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59796',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59798',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59799',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59801',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.886274516582489,
              g: 0,
              b: 0.10196078568696976,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59799'],
      },
      {
        id: '303:59807',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59805',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59804',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '308:60331',
        w: 91,
        h: 198,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.30639731884002686, 0, 0.21885521709918976],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['303:59807'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59795',
      },
      {
        kind: 'mark',
        id: '303:59796',
      },
      {
        kind: 'mark',
        id: '303:59798',
      },
      {
        kind: 'mark',
        id: '303:59799',
      },
      {
        kind: 'mark',
        id: '303:59801',
      },
      {
        kind: 'mark',
        id: '303:59807',
      },
      {
        kind: 'photo',
        id: '308:60331',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5993',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59878',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59879',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59881',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59882',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59884',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59882'],
      },
      {
        id: '303:59890',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59888',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59887',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '303:59891',
        w: 91,
        h: 196,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.606664776802063, 0, 0.0273794736713171],
              [0, 0.8711111545562744, 0.06666667014360428],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['303:59890'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59878',
      },
      {
        kind: 'mark',
        id: '303:59879',
      },
      {
        kind: 'mark',
        id: '303:59881',
      },
      {
        kind: 'mark',
        id: '303:59882',
      },
      {
        kind: 'mark',
        id: '303:59884',
      },
      {
        kind: 'mark',
        id: '303:59890',
      },
      {
        kind: 'photo',
        id: '303:59891',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5995',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59898',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59899',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59901',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59902',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59904',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.5215686559677124,
              b: 0.45490196347236633,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59902'],
      },
      {
        id: '303:59910',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59908',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59907',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '308:60783',
        w: 91,
        h: 196,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.606664776802063, 0, 0.0273794736713171],
              [0, 0.8711111545562744, 0.06666667014360428],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: [],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59898',
      },
      {
        kind: 'mark',
        id: '303:59899',
      },
      {
        kind: 'mark',
        id: '303:59901',
      },
      {
        kind: 'mark',
        id: '303:59902',
      },
      {
        kind: 'mark',
        id: '303:59904',
      },
      {
        kind: 'mark',
        id: '303:59910',
      },
      {
        kind: 'photo',
        id: '308:60783',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5997',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59919',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59920',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59922',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59923',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59925',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59923'],
      },
      {
        id: '303:59931',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59929',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59928',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '303:59983',
        w: 91,
        h: 197,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.6941711902618408, 0, 0.1553698182106018],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['303:59931'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59919',
      },
      {
        kind: 'mark',
        id: '303:59920',
      },
      {
        kind: 'mark',
        id: '303:59922',
      },
      {
        kind: 'mark',
        id: '303:59923',
      },
      {
        kind: 'mark',
        id: '303:59925',
      },
      {
        kind: 'mark',
        id: '303:59931',
      },
      {
        kind: 'photo',
        id: '303:59983',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:5999',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59941',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59942',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59944',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59945',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59947',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.019607843831181526,
              g: 0.5098039507865906,
              b: 0.6039215922355652,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59945'],
      },
      {
        id: '303:59953',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59951',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59950',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '303:60047',
        w: 91,
        h: 197,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.6941711902618408, 0, 0.1553698182106018],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['303:59953'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59941',
      },
      {
        kind: 'mark',
        id: '303:59942',
      },
      {
        kind: 'mark',
        id: '303:59944',
      },
      {
        kind: 'mark',
        id: '303:59945',
      },
      {
        kind: 'mark',
        id: '303:59947',
      },
      {
        kind: 'mark',
        id: '303:59953',
      },
      {
        kind: 'photo',
        id: '303:60047',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1093:8624',
    variantId: '265:6005',
    width: 311,
    height: 196,
    marks: [
      {
        id: '303:59963',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59964',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59966',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '303:59967',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '303:59969',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.2705882489681244,
              g: 0.2705882489681244,
              b: 0.2705882489681244,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['303:59967'],
      },
      {
        id: '303:59975',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '303:59973',
        value: 'Get your preapproved loan ',
        w: 192,
        h: 52,
        transform: [1, 0, 0, 1, 24, 24],
        align: 'LEFT',
        segments: [
          {
            value: 'Get your preapproved loan ',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 24,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '303:59972',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 192,
        h: 90,
        transform: [1, 0, 0, 1, 24, 84],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '303:60048',
        w: 91,
        h: 197,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.3081934154033661, 0, 0.3726522922515869],
              [0, 1, 0],
            ],
            imageHash: '075bb08e86f2145ad6e9192c37d9c4d24de7f168',
          },
        ],
        masks: ['303:59975'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '303:59963',
      },
      {
        kind: 'mark',
        id: '303:59964',
      },
      {
        kind: 'mark',
        id: '303:59966',
      },
      {
        kind: 'mark',
        id: '303:59967',
      },
      {
        kind: 'mark',
        id: '303:59969',
      },
      {
        kind: 'mark',
        id: '303:59975',
      },
      {
        kind: 'photo',
        id: '303:60048',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16188',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16191',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16192',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8196078538894653,
              g: 0.5882353186607361,
              b: 0.03921568766236305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16195',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16192'],
      },
      {
        id: '9365:16202',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16811',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16812',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16813',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16203',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9162665605545044, 0, 0.03817777335643768],
              [0, 1, 0],
            ],
            imageHash: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
          },
        ],
        masks: ['9365:16202'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16191',
      },
      {
        kind: 'mark',
        id: '9365:16192',
      },
      {
        kind: 'mark',
        id: '9365:16195',
      },
      {
        kind: 'mark',
        id: '9365:16202',
      },
      {
        kind: 'photo',
        id: '9365:16203',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16204',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16207',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16208',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7411764860153198,
              b: 0.6470588445663452,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16210',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16208'],
      },
      {
        id: '9365:16218',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16843',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16844',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16845',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16219',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.537155032157898],
              [0, 1, 0],
            ],
            imageHash: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
          },
        ],
        masks: ['9365:16218'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16207',
      },
      {
        kind: 'mark',
        id: '9365:16208',
      },
      {
        kind: 'mark',
        id: '9365:16210',
      },
      {
        kind: 'mark',
        id: '9365:16218',
      },
      {
        kind: 'photo',
        id: '9365:16219',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16220',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16223',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16224',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8901960849761963,
              g: 0.4117647111415863,
              b: 0.054901961237192154,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16226',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16224'],
      },
      {
        id: '9365:16233',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16858',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16859',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16860',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16234',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4032291769981384, 0, 0.2565477192401886],
              [0, 1, 0],
            ],
            imageHash: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
          },
        ],
        masks: ['9365:16233'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16223',
      },
      {
        kind: 'mark',
        id: '9365:16224',
      },
      {
        kind: 'mark',
        id: '9365:16226',
      },
      {
        kind: 'mark',
        id: '9365:16233',
      },
      {
        kind: 'photo',
        id: '9365:16234',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16235',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16238',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.019607843831181526,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5686274766921997,
              g: 0.4431372582912445,
              b: 0.07058823853731155,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16239',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.8745098114013672,
              g: 0.658823549747467,
              b: 0.0235294122248888,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16242',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.929411768913269,
              g: 0.729411780834198,
              b: 0,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16239'],
      },
      {
        id: '9365:16249',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16863',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16864',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16865',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16250',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9162665605545044, 0, 0.03817777335643768],
              [0, 1, 0],
            ],
            imageHash: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
          },
        ],
        masks: ['9365:16249'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16238',
      },
      {
        kind: 'mark',
        id: '9365:16239',
      },
      {
        kind: 'mark',
        id: '9365:16242',
      },
      {
        kind: 'mark',
        id: '9365:16249',
      },
      {
        kind: 'photo',
        id: '9365:16250',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16251',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16254',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6666666865348816,
              g: 0.4431372582912445,
              b: 0.364705890417099,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16255',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.7960784435272217,
              b: 0.6941176652908325,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16257',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 0.8549019694328308,
              b: 0.7529411911964417,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16255'],
      },
      {
        id: '9365:16265',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16853',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16854',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16855',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16266',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.537155032157898],
              [0, 1, 0],
            ],
            imageHash: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
          },
        ],
        masks: ['9365:16265'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16254',
      },
      {
        kind: 'mark',
        id: '9365:16255',
      },
      {
        kind: 'mark',
        id: '9365:16257',
      },
      {
        kind: 'mark',
        id: '9365:16265',
      },
      {
        kind: 'photo',
        id: '9365:16266',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16267',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16270',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16271',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9019607901573181,
              g: 0.45098039507865906,
              b: 0.003921568859368563,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.6235294342041016,
              g: 0.30980393290519714,
              b: 0,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16273',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M40.377 -35.5L153.5 78.5L40.377 192.5C24.2569 177.267 24.2569 152.564 40.377 137.324L98.748 78.5L40.377 19.676C24.2569 4.4356 24.2569 -20.2596 40.377 -35.5ZM-62.41 -35.5L50.713 78.5L-62.41 192.5C-78.53 177.267 -78.53 152.564 -62.41 137.324L-4.03849 78.5L-62.41 19.676C-78.53 4.4356 -78.53 -20.2596 -62.41 -35.5Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.9411764740943909,
              g: 0.529411792755127,
              b: 0.11372549086809158,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16271'],
      },
      {
        id: '9365:16280',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16838',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16839',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16840',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16281',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4032291769981384, 0, 0.2565477192401886],
              [0, 1, 0],
            ],
            imageHash: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
          },
        ],
        masks: ['9365:16280'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16270',
      },
      {
        kind: 'mark',
        id: '9365:16271',
      },
      {
        kind: 'mark',
        id: '9365:16273',
      },
      {
        kind: 'mark',
        id: '9365:16280',
      },
      {
        kind: 'photo',
        id: '9365:16281',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16282',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16285',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5647059082984924,
              g: 0.5647059082984924,
              b: 0.5647059082984924,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'OUTSIDE',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16286',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.800000011920929,
              g: 0.800000011920929,
              b: 0.800000011920929,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16288',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.7254902124404907,
              b: 0.7254902124404907,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16286'],
      },
      {
        id: '9365:16296',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16848',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16849',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16850',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 0.14901961386203766,
                  g: 0.14901961386203766,
                  b: 0.14901961386203766,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16297',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.3659999668598175, 0, 0.3164375126361847],
              [0, 0.8971428275108337, 0.0911429226398468],
            ],
            imageHash: '97420d93298e277c42046cfc4a87bcf25be5d8ea',
          },
        ],
        masks: ['9365:16296'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16285',
      },
      {
        kind: 'mark',
        id: '9365:16286',
      },
      {
        kind: 'mark',
        id: '9365:16288',
      },
      {
        kind: 'mark',
        id: '9365:16296',
      },
      {
        kind: 'photo',
        id: '9365:16297',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16298',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16301',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16302',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16305',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.886274516582489,
              g: 0,
              b: 0.10196078568696976,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16302'],
      },
      {
        id: '9365:16312',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I9365:16314;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16312'],
      },
      {
        id: 'I9365:16314;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16312'],
      },
    ],
    texts: [
      {
        id: '9365:16899',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16900',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16901',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I9365:16313;1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['9365:16312'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16301',
      },
      {
        kind: 'mark',
        id: '9365:16302',
      },
      {
        kind: 'mark',
        id: '9365:16305',
      },
      {
        kind: 'mark',
        id: '9365:16312',
      },
      {
        kind: 'photo',
        id: 'I9365:16313;1287:6546',
      },
      {
        kind: 'mark',
        id: 'I9365:16314;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I9365:16314;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16315',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16318',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16319',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16322',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16319'],
      },
      {
        id: '9365:16329',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I9365:16331;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16329'],
      },
      {
        id: 'I9365:16331;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16329'],
      },
    ],
    texts: [
      {
        id: '9365:16781',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16782',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16783',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I9365:16330;1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['9365:16329'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16318',
      },
      {
        kind: 'mark',
        id: '9365:16319',
      },
      {
        kind: 'mark',
        id: '9365:16322',
      },
      {
        kind: 'mark',
        id: '9365:16329',
      },
      {
        kind: 'photo',
        id: 'I9365:16330;1287:6546',
      },
      {
        kind: 'mark',
        id: 'I9365:16331;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I9365:16331;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16332',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16335',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16336',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16338',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.5215686559677124,
              b: 0.45490196347236633,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16336'],
      },
      {
        id: '9365:16345',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I9365:16347;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16345'],
      },
      {
        id: 'I9365:16347;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16345'],
      },
    ],
    texts: [
      {
        id: '9365:16894',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16895',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16896',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I9365:16346;1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['9365:16345'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16335',
      },
      {
        kind: 'mark',
        id: '9365:16336',
      },
      {
        kind: 'mark',
        id: '9365:16338',
      },
      {
        kind: 'mark',
        id: '9365:16345',
      },
      {
        kind: 'photo',
        id: 'I9365:16346;1250:5978',
      },
      {
        kind: 'mark',
        id: 'I9365:16347;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I9365:16347;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16348',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16351',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16352',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16354',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16352'],
      },
      {
        id: '9365:16361',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16874',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16875',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16876',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: 'I9365:16362;1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['9365:16361'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16351',
      },
      {
        kind: 'mark',
        id: '9365:16352',
      },
      {
        kind: 'mark',
        id: '9365:16354',
      },
      {
        kind: 'mark',
        id: '9365:16361',
      },
      {
        kind: 'photo',
        id: 'I9365:16362;1250:5978',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16363',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16366',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16367',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16369',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.019607843831181526,
              g: 0.5098039507865906,
              b: 0.6039215922355652,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16367'],
      },
      {
        id: '9365:16376',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I9365:16378;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 291, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16376'],
      },
      {
        id: 'I9365:16378;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 301, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16376'],
      },
    ],
    texts: [
      {
        id: '9365:16889',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16890',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16891',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16377',
        w: 100,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9571759700775146, 0, 0.03828703984618187],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['9365:16376'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16366',
      },
      {
        kind: 'mark',
        id: '9365:16367',
      },
      {
        kind: 'mark',
        id: '9365:16369',
      },
      {
        kind: 'mark',
        id: '9365:16376',
      },
      {
        kind: 'photo',
        id: '9365:16377',
      },
      {
        kind: 'mark',
        id: 'I9365:16378;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I9365:16378;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16379',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16382',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16383',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16385',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16383'],
      },
      {
        id: '9365:16392',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I9365:16394;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 291, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16392'],
      },
      {
        id: 'I9365:16394;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 301, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16392'],
      },
    ],
    texts: [
      {
        id: '9365:16879',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16880',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16881',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16393',
        w: 100,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9571759700775146, 0, 0.03828703984618187],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['9365:16392'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16382',
      },
      {
        kind: 'mark',
        id: '9365:16383',
      },
      {
        kind: 'mark',
        id: '9365:16385',
      },
      {
        kind: 'mark',
        id: '9365:16392',
      },
      {
        kind: 'photo',
        id: '9365:16393',
      },
      {
        kind: 'mark',
        id: 'I9365:16394;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I9365:16394;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16395',
    width: 327,
    height: 157,
    marks: [
      {
        id: '9365:16398',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16399',
        name: 'Mask',
        kind: 'path',
        w: 327,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 327 0 L 327 157 L 0 157 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16402',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M39.877 -36L153 78L39.877 192C23.7569 176.767 23.7569 152.064 39.877 136.824L98.248 78L39.877 19.176C23.7569 3.9356 23.7569 -20.7596 39.877 -36ZM-62.91 -36L50.213 78L-62.91 192C-79.03 176.767 -79.03 152.064 -62.91 136.824L-4.53849 78L-62.91 19.176C-79.03 3.9356 -79.03 -20.7596 -62.91 -36Z',
          },
        ],
        w: 228,
        h: 228,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.2705882489681244,
              g: 0.2705882489681244,
              b: 0.2705882489681244,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16399'],
      },
      {
        id: '9365:16409',
        name: 'Rectangle',
        kind: 'rect',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: 'I9365:16411;3066:35076',
        name: 'Oval',
        kind: 'ellipse',
        w: 32,
        h: 32,
        transform: [1, 0, 0, 1, 287, 8],
        arc: {
          startingAngle: 0,
          endingAngle: 6.2831854820251465,
          innerRadius: 0,
        },
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 0.800000011920929,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16409'],
      },
      {
        id: 'I9365:16411;3066:35083',
        name: '258',
        kind: 'path',
        w: 12,
        h: 12,
        transform: [1, 0, 0, 1, 297, 18],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 10.88587474822998 0 L 6 4.885875105857849 L 1.113750010728836 0 L 0 1.114124983549118 L 4.885875105857849 6 L 0 10.88587474822998 L 1.113750010728836 12 L 6 7.1141252517700195 L 10.88587474822998 12 L 12 10.88587474822998 L 7.1141252517700195 6 L 12 1.114124983549118 L 10.88587474822998 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16409'],
      },
    ],
    texts: [
      {
        id: '9365:16884',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 211,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16885',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
        w: 211,
        h: 54,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16886',
        value: 'Lorem ipsum dolor sit amet',
        w: 211,
        h: 15,
        transform: [1, 0, 0, 1, 16, 130],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16410',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 231, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.4079620838165283, 0, 0.3625600039958954],
              [0, 1, 0],
            ],
            imageHash: '075bb08e86f2145ad6e9192c37d9c4d24de7f168',
          },
        ],
        masks: ['9365:16409'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16398',
      },
      {
        kind: 'mark',
        id: '9365:16399',
      },
      {
        kind: 'mark',
        id: '9365:16402',
      },
      {
        kind: 'mark',
        id: '9365:16409',
      },
      {
        kind: 'photo',
        id: '9365:16410',
      },
      {
        kind: 'mark',
        id: 'I9365:16411;3066:35076',
      },
      {
        kind: 'mark',
        id: 'I9365:16411;3066:35083',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16412',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16417',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16418',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16420',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16421',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.6039215922355652,
              g: 0,
              b: 0.04313725605607033,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16423',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16421'],
      },
      {
        id: '9365:16430',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16691',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16692',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16693',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16431',
        w: 91,
        h: 198,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.30639731884002686, 0, 0.21885521709918976],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['9365:16430'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16417',
      },
      {
        kind: 'mark',
        id: '9365:16418',
      },
      {
        kind: 'mark',
        id: '9365:16420',
      },
      {
        kind: 'mark',
        id: '9365:16421',
      },
      {
        kind: 'mark',
        id: '9365:16423',
      },
      {
        kind: 'mark',
        id: '9365:16430',
      },
      {
        kind: 'photo',
        id: '9365:16431',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16432',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16437',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16438',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16440',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16441',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.7254902124404907,
              g: 0.0941176488995552,
              b: 0.13725490868091583,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16443',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.886274516582489,
              g: 0,
              b: 0.10196078568696976,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16441'],
      },
      {
        id: '9365:16450',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16943',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16944',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16945',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16453',
        w: 91,
        h: 198,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.30639731884002686, 0, 0.21885521709918976],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: ['9365:16450'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16437',
      },
      {
        kind: 'mark',
        id: '9365:16438',
      },
      {
        kind: 'mark',
        id: '9365:16440',
      },
      {
        kind: 'mark',
        id: '9365:16441',
      },
      {
        kind: 'mark',
        id: '9365:16443',
      },
      {
        kind: 'mark',
        id: '9365:16450',
      },
      {
        kind: 'photo',
        id: '9365:16453',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16454',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16459',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16460',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16462',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16463',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.2980392277240753,
              b: 0.239215686917305,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16465',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16463'],
      },
      {
        id: '9365:16472',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16904',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16905',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16906',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16473',
        w: 91,
        h: 196,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.606664776802063, 0, 0.0273794736713171],
              [0, 0.8711111545562744, 0.06666667014360428],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: ['9365:16472'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16459',
      },
      {
        kind: 'mark',
        id: '9365:16460',
      },
      {
        kind: 'mark',
        id: '9365:16462',
      },
      {
        kind: 'mark',
        id: '9365:16463',
      },
      {
        kind: 'mark',
        id: '9365:16465',
      },
      {
        kind: 'mark',
        id: '9365:16472',
      },
      {
        kind: 'photo',
        id: '9365:16473',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16474',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16479',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16480',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16482',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16483',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.41960784792900085,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16485',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.5215686559677124,
              b: 0.45490196347236633,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16483'],
      },
      {
        id: '9365:16492',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16938',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16939',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16940',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16493',
        w: 91,
        h: 196,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.606664776802063, 0, 0.0273794736713171],
              [0, 0.8711111545562744, 0.06666667014360428],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: [],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16479',
      },
      {
        kind: 'mark',
        id: '9365:16480',
      },
      {
        kind: 'mark',
        id: '9365:16482',
      },
      {
        kind: 'mark',
        id: '9365:16483',
      },
      {
        kind: 'mark',
        id: '9365:16485',
      },
      {
        kind: 'mark',
        id: '9365:16492',
      },
      {
        kind: 'photo',
        id: '9365:16493',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16494',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16499',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16500',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16502',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16503',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.38823530077934265,
              b: 0.4588235318660736,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16505',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16503'],
      },
      {
        id: '9365:16512',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16909',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16910',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16911',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16513',
        w: 91,
        h: 197,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.6941711902618408, 0, 0.1553698182106018],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['9365:16512'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16499',
      },
      {
        kind: 'mark',
        id: '9365:16500',
      },
      {
        kind: 'mark',
        id: '9365:16502',
      },
      {
        kind: 'mark',
        id: '9365:16503',
      },
      {
        kind: 'mark',
        id: '9365:16505',
      },
      {
        kind: 'mark',
        id: '9365:16512',
      },
      {
        kind: 'photo',
        id: '9365:16513',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16514',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16519',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16520',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16522',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16523',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0,
              g: 0.47843137383461,
              b: 0.5686274766921997,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16525',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.019607843831181526,
              g: 0.5098039507865906,
              b: 0.6039215922355652,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16523'],
      },
      {
        id: '9365:16532',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16919',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16920',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16921',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16533',
        w: 91,
        h: 197,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.6941711902618408, 0, 0.1553698182106018],
              [0, 1, 0],
            ],
            imageHash: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
          },
        ],
        masks: ['9365:16532'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16519',
      },
      {
        kind: 'mark',
        id: '9365:16520',
      },
      {
        kind: 'mark',
        id: '9365:16522',
      },
      {
        kind: 'mark',
        id: '9365:16523',
      },
      {
        kind: 'mark',
        id: '9365:16525',
      },
      {
        kind: 'mark',
        id: '9365:16532',
      },
      {
        kind: 'photo',
        id: '9365:16533',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '9365:16187',
    variantId: '9365:16534',
    width: 311,
    height: 196,
    marks: [
      {
        id: '9365:16539',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16540',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16542',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: [],
      },
      {
        id: '9365:16543',
        name: 'Mask',
        kind: 'path',
        w: 311,
        h: 196,
        transform: [1, 0, 0, 1, 0, 0],
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 311 0 L 311 196 L 0 196 L 0 0 Z',
          },
        ],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.14901961386203766,
              g: 0.14901961386203766,
              b: 0.14901961386203766,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
      {
        id: '9365:16545',
        name: 'Shape',
        kind: 'path',
        paths: [
          {
            windingRule: 'EVENODD',
            data: 'M48.0924 -44L189 98L48.0924 240C28.013 221.026 28.013 190.255 48.0924 171.272L120.8 98L48.0924 24.728C28.013 5.74434 28.013 -25.0163 48.0924 -44ZM-79.9405 -44L60.9671 98L-79.9405 240C-100.02 221.026 -100.02 190.255 -79.9405 171.272L-7.23215 98L-79.9405 24.728C-100.02 5.74434 -100.02 -25.0163 -79.9405 -44Z',
          },
        ],
        w: 284,
        h: 284,
        transform: [1, 0, 0, 1, 0, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.2705882489681244,
              g: 0.2705882489681244,
              b: 0.2705882489681244,
            },
            opacity: 1,
          },
        ],
        stroke: [],
        strokeWidth: 0,
        strokeAlign: 'CENTER',
        dashes: [],
        opacity: 1,
        isMask: false,
        masks: ['9365:16543'],
      },
      {
        id: '9365:16552',
        name: 'Rectangle',
        kind: 'rect',
        w: 91.30274963378906,
        h: 196,
        transform: [1, 0, 0, 1, 219.697265625, 0],
        radii: [0, 8, 8, 0],
        fill: [
          {
            type: 'SOLID',
            color: {
              r: 0.847000002861023,
              g: 0.847000002861023,
              b: 0.847000002861023,
            },
            opacity: 1,
          },
        ],
        stroke: [
          {
            type: 'SOLID',
            color: {
              r: 0.5921568870544434,
              g: 0.5921568870544434,
              b: 0.5921568870544434,
            },
            opacity: 1,
          },
        ],
        strokeWidth: 1,
        strokeAlign: 'INSIDE',
        dashes: [],
        opacity: 1,
        isMask: true,
        masks: [],
      },
    ],
    texts: [
      {
        id: '9365:16914',
        value: 'Lorem ipsum lorem ipsum title!',
        w: 200,
        h: 44,
        transform: [1, 0, 0, 1, 16, 16],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum lorem ipsum title!',
            fontName: {
              family: 'UniCredit',
              style: 'Bold',
            },
            fontSize: 20,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16915',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
        w: 200,
        h: 72,
        transform: [1, 0, 0, 1, 16, 68],
        align: 'LEFT',
        segments: [
          {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. consectetur adipiscing elit, sed do eiusmod ',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 16,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
      {
        id: '9365:16916',
        value: 'Lorem ipsum dolor sit amet',
        w: 200,
        h: 15,
        transform: [1, 0, 0, 1, 16, 148],
        align: 'LEFT',
        segments: [
          {
            value: 'Lorem ipsum dolor sit amet',
            fontName: {
              family: 'UniCredit',
              style: 'Regular',
            },
            fontSize: 14,
            lineHeight: {
              unit: 'AUTO',
            },
            letterSpacing: {
              unit: 'PERCENT',
              value: 0,
            },
            fills: [
              {
                type: 'SOLID',
                color: {
                  r: 1,
                  g: 1,
                  b: 1,
                },
                opacity: 1,
              },
            ],
          },
        ],
      },
    ],
    photos: [
      {
        id: '9365:16553',
        w: 91,
        h: 197,
        transform: [1, 0, 0, 1, 220, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.3081934154033661, 0, 0.3726522922515869],
              [0, 1, 0],
            ],
            imageHash: '075bb08e86f2145ad6e9192c37d9c4d24de7f168',
          },
        ],
        masks: ['9365:16552'],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'mark',
        id: '9365:16539',
      },
      {
        kind: 'mark',
        id: '9365:16540',
      },
      {
        kind: 'mark',
        id: '9365:16542',
      },
      {
        kind: 'mark',
        id: '9365:16543',
      },
      {
        kind: 'mark',
        id: '9365:16545',
      },
      {
        kind: 'mark',
        id: '9365:16552',
      },
      {
        kind: 'photo',
        id: '9365:16553',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1250:5955',
    variantId: '1250:5954',
    width: 96,
    height: 157,
    marks: [],
    texts: [],
    photos: [
      {
        id: '1250:5952',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: '0f85ac34904b2dd13edbaf72e1c056c0185899a5',
          },
        ],
        masks: [],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'photo',
        id: '1250:5952',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1250:5955',
    variantId: '1250:5964',
    width: 96,
    height: 157,
    marks: [],
    texts: [],
    photos: [
      {
        id: '1250:5978',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.9171944856643677, 0, 0.03821643814444542],
              [0, 1, 0],
            ],
            imageHash: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
          },
        ],
        masks: [],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'photo',
        id: '1250:5978',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1287:6540',
    variantId: '1287:6541',
    width: 96,
    height: 157,
    marks: [],
    texts: [],
    photos: [
      {
        id: '1287:6542',
        w: 96,
        h: 157,
        transform: [-1, 0, 0, -1, 96, 157],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'TILE',
            scalingFactor: 0.25,
            rotation: 180,
            imageTransform: [
              [1, 0, 0],
              [0, 3.40625, -1.203125],
            ],
            imageHash: '40fb59f65a942705fb262845b23cb57ffbc396a3',
          },
        ],
        masks: [],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'photo',
        id: '1287:6542',
      },
    ],
  },
  {
    pageId: '8889:145',
    familyId: '1287:6540',
    variantId: '1287:6543',
    width: 96,
    height: 157,
    marks: [],
    texts: [],
    photos: [
      {
        id: '1287:6546',
        w: 96,
        h: 157,
        transform: [1, 0, 0, 1, 0, 0],
        radius: 0,
        images: [
          {
            type: 'IMAGE',
            opacity: 1,
            scaleMode: 'CROP',
            scalingFactor: 0.5,
            imageTransform: [
              [0.40764331817626953, 0, 0.14225053787231445],
              [0, 1, 0],
            ],
            imageHash: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
          },
        ],
        masks: [],
        opacity: 1,
      },
    ],
    order: [
      {
        kind: 'photo',
        id: '1287:6546',
      },
    ],
  },
]
export const CATALOG_ORIGINAL_CONTENT_PHOTOS: Readonly<
  Record<string, { path: string; width: number; height: number; sha1: string; reused: boolean }>
> = {
  '1522f33794c134d83d662fd2fbb4c9f195e5f44e': {
    path: 'src/assets/design-system/compositions/photos/1522f33794c134d83d662fd2fbb4c9f195e5f44e.png',
    width: 800,
    height: 1224,
    sha1: '1522f33794c134d83d662fd2fbb4c9f195e5f44e',
    reused: false,
  },
  edcba91c37adb05deb0a05f3a303fabf60cfa09f: {
    path: 'src/assets/design-system/compositions/photos/edcba91c37adb05deb0a05f3a303fabf60cfa09f.png',
    width: 3272,
    height: 2177,
    sha1: 'edcba91c37adb05deb0a05f3a303fabf60cfa09f',
    reused: false,
  },
  '52f0b74fc5514876138a58023ca6c8710d0db3a8': {
    path: 'src/assets/design-system/compositions/photos/52f0b74fc5514876138a58023ca6c8710d0db3a8.png',
    width: 800,
    height: 1200,
    sha1: '52f0b74fc5514876138a58023ca6c8710d0db3a8',
    reused: false,
  },
  b7cf1d8f79545e151d558b270b41e7ce9bfb932b: {
    path: 'src/assets/design-system/compositions/photos/b7cf1d8f79545e151d558b270b41e7ce9bfb932b.png',
    width: 800,
    height: 533,
    sha1: 'b7cf1d8f79545e151d558b270b41e7ce9bfb932b',
    reused: false,
  },
  a1100374f41efc6eebb88a42a630ae11d11d46b7: {
    path: 'src/assets/design-system/compositions/photos/a1100374f41efc6eebb88a42a630ae11d11d46b7.png',
    width: 800,
    height: 533,
    sha1: 'a1100374f41efc6eebb88a42a630ae11d11d46b7',
    reused: false,
  },
  '8bf47e8592cbf7929143b9a8033355e0430fc1c8': {
    path: 'src/assets/design-system/compositions/photos/8bf47e8592cbf7929143b9a8033355e0430fc1c8.png',
    width: 800,
    height: 1067,
    sha1: '8bf47e8592cbf7929143b9a8033355e0430fc1c8',
    reused: false,
  },
  '062388f55867b58a1549c579e0f837b94ffc925c': {
    path: 'src/assets/design-system/compositions/photos/062388f55867b58a1549c579e0f837b94ffc925c.png',
    width: 800,
    height: 533,
    sha1: '062388f55867b58a1549c579e0f837b94ffc925c',
    reused: false,
  },
  '7c9ccbb5be7f4058f6af8d50ced765919f64c000': {
    path: 'src/assets/design-system/compositions/photos/7c9ccbb5be7f4058f6af8d50ced765919f64c000.png',
    width: 2713,
    height: 4077,
    sha1: '7c9ccbb5be7f4058f6af8d50ced765919f64c000',
    reused: false,
  },
  '0f85ac34904b2dd13edbaf72e1c056c0185899a5': {
    path: 'src/assets/design-system/compositions/photos/0f85ac34904b2dd13edbaf72e1c056c0185899a5.jpg',
    width: 4096,
    height: 2731,
    sha1: '0f85ac34904b2dd13edbaf72e1c056c0185899a5',
    reused: false,
  },
  e94cd17b3ad327cd430fe6319a1d583b7ed93ed8: {
    path: 'src/assets/design-system/compositions/photos/e94cd17b3ad327cd430fe6319a1d583b7ed93ed8.png',
    width: 3456,
    height: 5184,
    sha1: 'e94cd17b3ad327cd430fe6319a1d583b7ed93ed8',
    reused: false,
  },
  '075bb08e86f2145ad6e9192c37d9c4d24de7f168': {
    path: 'src/assets/design-system/compositions/photos/075bb08e86f2145ad6e9192c37d9c4d24de7f168.png',
    width: 640,
    height: 427,
    sha1: '075bb08e86f2145ad6e9192c37d9c4d24de7f168',
    reused: false,
  },
  d052c13c7d88ebd85c61f0cff801a6b025924292: {
    path: 'src/assets/design-system/compositions/photos/d052c13c7d88ebd85c61f0cff801a6b025924292.png',
    width: 5685,
    height: 3790,
    sha1: 'd052c13c7d88ebd85c61f0cff801a6b025924292',
    reused: false,
  },
  '888c0b8f6db8e2ed47fb230a3e319945852d803c': {
    path: 'src/assets/design-system/compositions/photos/888c0b8f6db8e2ed47fb230a3e319945852d803c.png',
    width: 5494,
    height: 3623,
    sha1: '888c0b8f6db8e2ed47fb230a3e319945852d803c',
    reused: false,
  },
  e400269e12a467c40d1e214740e78c2d5efa9a73: {
    path: 'src/assets/design-system/compositions/photos/e400269e12a467c40d1e214740e78c2d5efa9a73.png',
    width: 6480,
    height: 4320,
    sha1: 'e400269e12a467c40d1e214740e78c2d5efa9a73',
    reused: false,
  },
  '97420d93298e277c42046cfc4a87bcf25be5d8ea': {
    path: 'src/assets/design-system/compositions/photos/97420d93298e277c42046cfc4a87bcf25be5d8ea.png',
    width: 640,
    height: 427,
    sha1: '97420d93298e277c42046cfc4a87bcf25be5d8ea',
    reused: false,
  },
  ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6: {
    path: 'src/assets/ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6.png',
    width: 4598,
    height: 6890,
    sha1: 'ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6',
    reused: true,
  },
}
