export interface PrimeBenefitCopy {
  readonly title: string
  readonly description: string
}

export interface PrimeBenefitsCopy {
  readonly heading: string
  readonly introduction: string
  readonly benefits: readonly [PrimeBenefitCopy, PrimeBenefitCopy, PrimeBenefitCopy, PrimeBenefitCopy]
  readonly termsLabel: string
}

/** Presentation copy for the Private reference; detail and terms destinations remain source boundaries. */
export const PRIVATE_WEALTH_BENEFITS_COPY: PrimeBenefitsCopy = {
  heading: 'Private & Wealth benefits',
  introduction:
    'A personal approach to banking and wealth, shaped around your priorities, long-term ambitions and the way you prefer to work with us.',
  benefits: [
    {
      title: 'YOUR DEDICATED PRIVATE BANKER',
      description:
        'A personal relationship with a banker who understands your priorities and coordinates the expertise you need.',
    },
    {
      title: 'A BROADER VIEW OF YOUR WEALTH',
      description: 'Bring your banking, investments and long-term ambitions into one informed conversation.',
    },
    {
      title: 'SPECIALIST INSIGHT, PERSONAL CONTEXT',
      description:
        'Explore investment and financing options with specialists, guided by your objectives and risk preferences.',
    },
    {
      title: 'DISCRETION AT EVERY STEP',
      description: 'Confidential advice, considered communication and personal attention throughout your relationship.',
    },
  ],
  termsLabel: 'Private & Wealth terms and conditions',
}
