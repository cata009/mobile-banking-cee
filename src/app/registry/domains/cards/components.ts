import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const CARDS_COMPONENTS = {
  'cards.card': {
    id: 'cards.card',
    label: 'Card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/Card.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-mapped 64x40 Mastercard card artwork family sourced from Meniga Harmonization Icons nodes `3039:30713`, `3039:7485`, `3039:8064`, `4161:9198`, `3039:12315`, and `3039:12380`. The React component exposes a variant registry for MC Debit Gold, MC Credit Premium Gold, MC Credit Partner Standard, MC Debit Standard, MC Virtual Standard Electric Violet, and MC Virtual Standard Vibrant Orange, preserving the shared card structure while applying the Figma-sampled color palettes and debit/credit labels. Supports controlled figma, medium, and large sizing without changing runtime screen behavior.',
  },
  'cards.ghost-banner': {
    id: 'cards.ghost-banner',
    label: 'Ghost Banner',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/GhostBanner.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-extracted 327x92 dashed-border CTA banner generated from `codex-figma-component-spec/v1` node `9103:14301`. Leading 32x32 system add icon (`add-circle`, teal `--uc-action`) beside an 18px bold title and a 16px regular multiline description, both `--uc-text`. 16px padding, 8px radius, dashed `--uc-text` border, 10px vertical gap, 8px icon-to-text gap, 4px title-to-description gap. Renders as a button when `onClick` is supplied.',
  },
  'cards.info-banner': {
    id: 'cards.info-banner',
    label: 'Info Banner',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/InfoBanner.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-extracted 327x153 solid-border informational banner generated from `codex-figma-component-spec/v1` node `9104:14329`. Leading 32x32 `info-circle` icon (`--uc-text`) beside an 18px bold title and a 16px regular multiline description, both `--uc-text`, plus an optional 14px bold teal text action (`--uc-action`, e.g. EDIT). 16px padding, 8px radius, solid `--uc-text` border, 8px icon-to-text gap, 8px text-block-to-action gap, 4px title-to-description gap. Static region; the inline action is the only interactive element.',
  },
  'cards.user-event-card': {
    id: 'cards.user-event-card',
    label: 'User Event Card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/UserEventCard.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-extracted 343-wide white shadowed card generated from `codex-figma-component-spec/v1` `User events` (full node `9104:14482`, compact node `9104:14438`). Leading 48x48 teal (`--uc-action`) avatar circle with a white 24x24 glyph, a 14px bold title and a 14px regular multiline description (both `--uc-text`). One component covers both Figma variants via props: `actionLabel` renders a 14px bold teal text link and `showOptions` renders the trailing 32x32 `more-horizontal` overflow control. 16px padding, 8px radius, `0 4px 16px rgba(0,0,0,0.08)` shadow, 8px gaps; aligns items center without an action and start with one.',
  },
  'cards.helper-card': {
    id: 'cards.helper-card',
    label: 'Helper Card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/HelperCard.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-extracted 343-wide solid teal helper generated from `codex-figma-component-spec/v1` `Helpers` (plain node `9104:14526`, with-link node `9104:14570`). Leading 32x32 white `info-circle`, an 18px bold white title and an 18px regular white multiline body. One component covers both variants via props: `actionLabel` renders a 14px bold white text link and `dismissible` renders a white `close-x` control top-right. Teal `--uc-action` background, 4px radius, 16px padding, white text via `--uc-static-white`.',
  },
  'cards.pending-action-card': {
    id: 'cards.pending-action-card',
    label: 'Pending Action Card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/PendingActionCard.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-extracted 327x157 teal-gradient promo card generated from `codex-figma-component-spec/v1` node `9104:14611`. Left-to-right `linear-gradient(90deg, #007A91, #44909E)` background, 8px radius, 24px padding. 24px bold white title, 18px regular white body, and an optional white pill (`--uc-static-white`) with a teal `warning-small` glyph and a 12px bold uppercase teal label (e.g. EXPIRING ON 12.04.25). Renders as a button when `onClick` is supplied.',
  },
  'cards.card-component': {
    id: 'cards.card-component',
    label: 'Card Component',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/cards/CardComponent.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-extracted 375-wide card management section generated from `codex-figma-component-spec/v1` node `9133:3831` (Card component). Primary/K7 (#F5F5F5) background, vertical layout with 12px gap, clips content. Frame 46 has 24px left padding, 8px gap: a 169-wide text column with 14px bold N5 card-holder name and 18px bold L2 masked card number (both K1, UniCredit Bold). Cards carousel is 351x140 horizontal with 24px gap and 1px left padding; each 219x138 card slot renders the shared `cards.card` component variant with 5.67px corner radius and a 0 11.265px 11.265px rgba(0,0,0,0.2) drop-shadow. No card artwork image asset or outside border is used.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
