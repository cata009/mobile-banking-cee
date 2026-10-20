const sources = import.meta.glob<string>(
  '/native-spike/src/universal/{PrimaryButton,ToggleButton,BaselineTextField,BaselineAmountField,BaselineCodeField,BaselineTransactionRow,BaselinePill,BaselineUniCreditLogo,BaselineSectionDivider,BaselineNavigationRow,BaselineInvestmentPeriodChips,BaselineMailboxTabs,BaselineToast,BaselineBanner,BaselineProductOfferCard,BaselineCardComponent,BaselineMoreCard,BaselinePageHeader,BaselineL1Header,BaselineTag,BaselineDropdownField,BaselineNavigationLink,BaselinePanelMenuSheet,BaselineCardArt,BaselinePaymentImage,BaselineMobileCode,BaselineFeedbackProgress,BaselineCheckbox,BaselineCanonicalIcon,BaselineCatalogCompositions,BaselineInvestmentProductRow,Select}.tsx',
  { query: '?raw', import: 'default' },
)

const webSources = import.meta.glob<string>('/src/app/components/**/*.tsx', { query: '?raw', import: 'default' })

export function loadNativeComponentSource(path: string): Promise<string> {
  const load = sources[`/${path}`] ?? webSources[`/${path}`]
  return load ? load() : Promise.reject(new Error('Native source is not mapped'))
}
