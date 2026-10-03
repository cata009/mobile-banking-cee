import { getProductsForCountry, hasProductAccordion } from '@/app/config/productConfig'
import type { AppLanguage } from '@/app/registry/languageByCountry'
import type { CountryId } from '@/app/state/demoTypes'
import { getTranslationValue } from './translationCorpus'

export interface PreloginTextField {
  key: string
  label: string
  group: 'active' | 'inactive'
  multiline: boolean
  value: string
}

export function getPreloginTextFields(country: CountryId, language: AppLanguage): PreloginTextField[] {
  const fields: PreloginTextField[] = []
  const add = (key: string, label: string, group: PreloginTextField['group'], multiline = false, fallback = '') => {
    fields.push({ key, label, group, multiline, value: getTranslationValue(country, language, key) ?? fallback })
  }
  add('preLoginActive.title', 'Active title', 'active', true)
  add('preLoginActive.subtitle', 'Active subtitle', 'active', true)
  add('preLoginActive.loginButton', 'Login button', 'active')
  add('preLogin.welcome', 'Welcome heading', 'inactive', true)
  if (hasProductAccordion(country)) {
    for (const product of getProductsForCountry(country)) {
      add(`products.${product.id}.title`, `${product.title} title`, 'inactive', false, product.title)
      add(`products.${product.id}.description`, `${product.title} description`, 'inactive', true, product.description)
    }
    add('products.findOutMore', 'Product action', 'inactive')
  } else {
    add('preLogin.accounts', 'Account heading', 'inactive', true)
    add('preLogin.openAccountDescription', 'Account description', 'inactive', true)
    add('preLogin.selectYourAccount', 'Account action', 'inactive')
  }
  add('preLogin.activateApplication', 'Activation button', 'inactive')
  for (const [suffix, label] of [
    ['contacts', 'Contacts link'],
    ['mtoken', 'MToken link'],
    ['other', 'Other link'],
  ] as const) {
    add(`preLoginActive.${suffix}`, `Active ${label.toLowerCase()}`, 'active')
    add(`preLogin.${suffix}`, `Inactive ${label.toLowerCase()}`, 'inactive')
  }
  return fields
}
