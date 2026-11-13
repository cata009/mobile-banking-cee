import { ONBOARDING_STEPS } from './model'
/** Alternate source states share the same executable journey and do not replace it. */
export const ONBOARDING_VARIANTS = [
  ['details-expanded', 'More details · expanded answers', '9852:83627', 'introduction'],
  ['rating-ro', 'Părerea ta contează', '9852:66231', 'rating'],
  ['contact-summary', 'Your contact info', '9869:99361', 'email-verified'],
  ['offer-star', 'STAR+ offer', '15048:101151', 'products'],
  ['offer-premium', 'Premium offer', '15048:101593', 'products'],
  ['offer-prime', 'Prime offer', '27310:16122', 'products'],
  ['address-different', 'Adresă de reședință diferită', '9852:63756', 'address'],
  ['address-summary', 'Confirmă adresele modificate', '9852:65054', 'address'],
  ['scan-error', 'Scanare nereușită', '9852:65494', 'scan'],
  ['selfie-smile', 'Smile in the camera', '9852:65513', 'selfie-capture'],
  ['selfie-waiting', 'Identification in progress', '9852:65515', 'selfie-capture'],
  ['selfie-error', 'Recognition failed', '9852:65517', 'selfie-capture'],
  ['transaction-details', 'Detalii despre tranzacții', '15048:107822', 'transactions'],
  ['marketing-channels', 'Canale de comunicare', '9852:67368', 'marketing'],
  ['card-physical', 'Mastercard Standard', '15048:112677', 'cards'],
  ['card-virtual', 'Virtual Mastercard Standard', '15048:113320', 'cards'],
  ['card-gold', 'Mastercard Gold', '15048:121567', 'cards'],
  ['card-gold-conflict', 'Virtual Gold requires a different physical card', '15048:120312', 'cards'],
  ['card-platinum', 'Mastercard Platinum', '27313:20896', 'cards'],
  ['card-recap', 'Your card selections', '15048:114040', 'cards'],
  ['card-prime-recap', 'Your Prime card selections', '27313:17324', 'cards'],
  ['contract-accepted', 'Documentație citită', '9930:91610', 'contract'],
  ['received', 'Data successfully received', '9852:63549', 'branch'],
  ['pending', 'Additional checks pending', '9930:82904', 'branch'],
  ['ceased', 'Process should be ceased', '9930:82957', 'branch'],
  ['document-expired', 'Cartea de identitate este expirată', '9852:65217', 'branch'],
  ['document-retry', 'Reîncearcă să scanezi', '9852:65230', 'branch'],
  ['identification-failed', 'Nu mai poți continua identificarea', '9852:63573', 'branch'],
  ['existing-customer', 'Poți reinitia cererea din Mobile Banking', '9852:65259', 'branch'],
  ['system-error', 'Something went wrong!', '9869:98028', 'branch'],
  ['recommendation', 'I received a recommendation', '9852:70931', 'introduction'],
  ['recommendation-invalid', 'Invalid recommendation code', '9852:71071', 'introduction'],
  ['delivery-uncovered', 'Address outside courier coverage', '9930:89335', 'delivery'],
  ['delivery-new', 'New card delivery address', '9930:87742', 'delivery'],
  ['phone-verified', 'Număr mobil verificat', '9852:66710', 'phone-code'],
  ['phone-invalid', 'Cod SMS incorect', '9852:66993', 'phone-code'],
  ['phone-expired', 'Cod SMS expirat', '9852:67155', 'phone-code'],
  ['phone-locked', 'SMS verification blocked', '9852:63286', 'phone-code'],
  ['phone-resend-locked', 'SMS resend blocked', '9852:66574', 'phone-code'],
  ['email-invalid', 'Cod e-mail incorect', '9852:67025', 'email-code'],
  ['email-expired', 'Cod e-mail expirat', '9852:67183', 'email-code'],
  ['email-locked', 'E-mail verification blocked', '9852:63300', 'email-code'],
  ['email-resend-locked', 'E-mail resend blocked', '9852:66604', 'email-code'],
  ['signature-invalid', 'Cod de semnare incorect', '9852:65345', 'signature'],
  ['pause-before-email', 'Oprire înainte de verificarea e-mailului', '9852:67980', 'phone'],
  ['pause-after-email', 'Salvează parola și revino mai târziu', '9852:67606', 'identity'],
  ['exit-survey', 'Motivul închiderii fluxului', '9852:67993', 'introduction'],
  ['exit-other', 'Alt motiv pentru închiderea fluxului', '9852:68065', 'introduction'],
  ['pending-save', 'Salvează și continuă după verificări', '10164:114434', 'branch'],
  ['evaluation-waiting', 'Analizăm datele tale', '9852:69307', 'branch'],
  ['evaluation-ceased', 'Procesul nu mai poate fi continuat online', '9852:69318', 'branch'],
  ['card-types-star', 'STAR+ · Select card types', '15048:131785', 'cards'],
  ['card-types-premium', 'Premium · Select card types', '15048:141493', 'cards'],
  ['card-types-prime', 'Prime · Select card types', '27313:16562', 'cards'],
  ['contract-warning', 'Open the contractual documentation first', '9930:91723', 'contract'],
  ['branch-map', 'Harta sucursalelor', '9930:56775', 'branch'],
  ['branch-list', 'Lista sucursalelor', '16094:74408', 'branch'],
  ['branch-detail', 'Detalii sucursală', '16094:74742', 'branch'],
  ['camera-permission', 'Access your camera', '9869:101219', 'scan-guidelines'],
  ['precontract-email', 'Pre-contractual email and resume link', '9869:99592', 'email-verified'],
  ['phone-code-locked', 'Solicită un nou cod SMS', '9852:67121', 'phone-code'],
  ['email-code-locked', 'Solicită un nou cod e-mail', '9852:67211', 'email-code'],
  ['phone-loading', 'SMS code loading', '9852:66829', 'phone-code'],
  ['email-loading', 'Email code loading', '9852:66853', 'email-code'],
  ['personal-notice', 'Corectarea datelor din document', '9852:63718', 'personal'],
  ['phone-input-invalid', 'Număr de telefon invalid', '9852:67532', 'phone'],
  ['email-input-invalid', 'Adresă de e-mail invalidă', '9852:67311', 'email'],
  ['card-gold-switch', 'Confirm the card switch?', '15048:123920', 'cards'],
  ['card-costs', 'Virtual card · Costs', '15048:152199', 'cards'],
  ['card-cost-details', 'Virtual card · More details', '15048:153231', 'cards'],
] as const
export type OnboardingVariant = (typeof ONBOARDING_VARIANTS)[number][0]
export function onboardingFixture(id: string): {
  base: string
  values: Record<string, string>
  checks: Record<string, boolean>
  emailVerified: boolean
} {
  const variant = ONBOARDING_VARIANTS.find((row) => row[0] === id)
  const result = {
    base: variant?.[3] || id,
    values: {} as Record<string, string>,
    checks: {} as Record<string, boolean>,
    emailVerified: false,
  }
  const position = ONBOARDING_STEPS.findIndex((row) => row[0] === result.base)
  if (position >= ONBOARDING_STEPS.findIndex((row) => row[0] === 'email')) result.values.phone = '720020020'
  if (position >= ONBOARDING_STEPS.findIndex((row) => row[0] === 'email-code')) result.values.email = 'abc@gmail.com'
  result.emailVerified = position > ONBOARDING_STEPS.findIndex((row) => row[0] === 'email-code')
  if (id === 'delivery' || id.startsWith('delivery-')) {
    Object.assign(result.checks, { physical: true, virtual: true })
    if (id === 'delivery-uncovered') result.values.deliveryAddress = 'correspondence'
    if (id === 'delivery-new') result.values.deliveryAddress = 'new'
    if (id.startsWith('delivery-')) result.values.deliverySheet = 'open'
  }
  if (id === 'contact-summary') Object.assign(result.values, { phone: '721201201', email: 'jan.novak@gmail.com' })
  if (id === 'recommendation-invalid') result.values.recommendation = '7200200233333'
  if (id === 'phone-input-invalid') result.values.phone = '7200200233333'
  if (id === 'email-input-invalid') result.values.email = 'abc@gmai'
  if (id.startsWith('offer-')) {
    result.values.offer = id.slice(6)
    result.values.employer = 'Carrefour Romania'
  }
  if (id === 'address-different' || id === 'address-summary') {
    result.checks.sameAddress = false
    result.checks.addressReviewed = id === 'address-summary'
    Object.assign(result.values, {
      postal: '021918',
      residenceCounty: 'Sector 2',
      residenceCity: 'Bucharest',
      residenceStreet: 'Sos Iancului',
      residenceNumber: '41',
      residenceBlock: '102',
      residenceStair: '4',
      residenceFloor: '5',
      residenceApartment: '55',
      residencePostal: '021918',
      correspondence: 'home',
    })
  }
  if (id === 'transaction-details')
    result.values.transactions = 'ORDINE DE PLATA/CU CARDUL|NUMERAR|ÎN/DIN CONTURI INTERNAȚIONALE'
  if (id === 'marketing-channels')
    Object.assign(result.checks, {
      unicredit: true,
      partners: true,
      sms: true,
      mail: true,
      call: true,
      mobile: true,
      post: true,
    })
  if (id.startsWith('card-')) {
    Object.assign(result.values, {
      physicalTier: 'standard',
      virtualTier: 'standard',
      physicalAccount: 'lei',
      virtualAccount: 'lei',
      platinumAccount: 'lei',
    })
    Object.assign(result.checks, { physical: true, virtual: true })
    result.values.cardPage =
      id === 'card-physical'
        ? 'physical'
        : id === 'card-virtual' || id === 'card-gold-conflict' || id === 'card-gold-switch'
          ? 'virtual'
          : id === 'card-recap' || id === 'card-prime-recap'
            ? 'recap'
            : id === 'card-platinum'
              ? 'platinum'
              : 'physical'
    if (id === 'card-gold' || id === 'card-gold-conflict' || id === 'card-gold-switch') {
      result.values.offer = 'star'
      result.values.physicalTier = 'gold'
    }
    if (id === 'card-gold-conflict' || id === 'card-gold-switch') result.values.virtualTier = 'gold'
    if (id === 'card-gold-switch') result.values.cardSwitchConfirm = 'true'
    if (id === 'card-platinum' || id === 'card-prime-recap') {
      result.values.offer = 'prime'
      result.checks.platinum = true
      result.checks.virtual = false
    }
  }
  if (id === 'contract-accepted') Object.assign(result.checks, { documentRead: true, contract: true, transsped: true })
  if (id === 'card-costs' || id === 'card-cost-details') {
    result.values.cardPage = 'virtual'
    result.values.cardCostPreview = 'true'
    result.values.cardCostDetails = id === 'card-cost-details' ? 'true' : ''
  }
  if (id.startsWith('card-types-')) {
    result.values.offer = id.slice('card-types-'.length)
    result.values.cardPage = 'types'
    result.checks.physical = id !== 'card-types-prime'
    result.checks.virtual = id !== 'card-types-prime'
    result.checks.platinum = false
  }
  return result
}
