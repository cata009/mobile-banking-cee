import accounts from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
import savings from '@/assets/app2027/home-summary-savings-cactus.png';
import credits from '@/assets/app2027/home-summary-loans-house.png';
import insurance from '@/assets/app2027/home-summary-insurance-umbrella.png';
import phone from '@/assets/app2027/uc-prime/digitalni-reseni-wide-v2.png';
import office from '@/assets/app2027/uc-prime/Prime-Office-banner-wide-v2.png';
import golf from '@/assets/app2027/uc-prime/premiovy-ucet-wide-v2.png';
import climber from '@/assets/app2027/uc-prime/pojisteni-karty-wide-v2.png';
import sailing from '@/assets/app2027/uc-prime/Prime-Sailing-banner-wide-v2.png';
import jet from '@/assets/app2027/uc-prime/exkluzivni-vyhody-prime-wide-v2.png';
import { EVO_ENGLISH } from '@/translations/evo';
import type { HomeTab } from './model';

export const summaryArt = { accounts, savings, credits, insurance };
type CampaignKey = keyof typeof EVO_ENGLISH.interest.cards;
const campaign = (key: CampaignKey, itemId: string, image: string) => ({
  ...EVO_ENGLISH.interest.cards[key],
  key,
  itemId,
  image,
});
export const homeCampaigns: Record<HomeTab, ReturnType<typeof campaign>[]> = {
  accounts: [
    campaign('roundups', 'saving-account', phone),
    campaign('nextStep', 'current-account', office),
    campaign('safetyNetAccounts', 'term-deposit', golf),
  ],
  savings: [
    campaign('safetyNet', 'saving-account', climber),
    campaign('growSavings', 'term-deposit', sailing),
    campaign('nextPlan', 'mutual-funds', jet),
  ],
  credits: [
    campaign('financing', 'personal-loan', office),
    campaign('mortgage', 'mortgage-loan', golf),
    campaign('consumerLoan', 'credit-card', phone),
  ],
  insurance: [
    campaign('homeCover', 'home-insurance', climber),
    campaign('travelCover', 'travel-insurance', jet),
    campaign('lifeCover', 'life-insurance', sailing),
  ],
};
