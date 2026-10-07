import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const SERVICES_COMPONENTS = {
  'messages.mailbox-tabs': {
    id: 'messages.mailbox-tabs',
    label: 'Messages mailbox tabs',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/messages/MessagesMailboxTabs.tsx',
    usedByScreens: ['pi.messages.overview', 'pi.investments.portfolio', 'platform.design-system'],
    notes:
      'Reusable Design System tab switcher for Messages-family screens, templates, and Investments portfolio tabs, with 48px height, active leading 12px dot when configured, muted inactive label, 2px bottom active indicator, and equal-width or horizontally scrollable layouts.',
  },
  'messages.inbox-list': {
    id: 'messages.inbox-list',
    label: 'Messages inbox and outbox list',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/screens/messages/MessagesScreen.tsx',
    usedByScreens: ['pi.messages.overview'],
    notes:
      'Runtime screen reconstructed from template 52, using the shared PageHeader, country-addressable extended mock Inbox/Outbox data, reusable MessagesMailboxTabs, AccountSearchBar, date rows, NEW badges, row action dots, and page-level scrolling.',
  },
  'more.card-grid': {
    id: 'more.card-grid',
    label: 'More service card grid',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/screens/more/MoreScreen.tsx',
    usedByScreens: ['pi.more.overview'],
    notes:
      'Country-scoped More card matrix. BA and BA_BL include Tutorials plus My applications after Settings and use Contact phone + Messages header actions.',
  },
  'contacts.navigation-card': {
    id: 'contacts.navigation-card',
    label: 'Contacts navigation card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/contacts/ContactsNavigationCard.tsx',
    usedByScreens: ['pi.contacts.overview'],
    notes:
      'Country contact rows now delegate to the shared NavigationRow component while keeping the contact-specific icon registry and chevron/value variants.',
  },
  'prime.advisor-tab': {
    id: 'prime.advisor-tab',
    label: 'Prime advisor tab',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/screens/prime/YourAdvisorTab.tsx',
    usedByScreens: ['pi.prime.overview'],
  },
  'prime.benefits-tab': {
    id: 'prime.benefits-tab',
    label: 'Prime benefits tab',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/screens/prime/YourBenefitsTab.tsx',
    usedByScreens: ['pi.prime.overview'],
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
