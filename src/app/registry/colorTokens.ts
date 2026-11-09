/**
 * The single definition of every color in the app.
 *
 * Both the web (CSS custom properties) and the React Native demo (the palette read by sourceColor)
 * are generated from this list by `npm run generate:colors`; `npm run audit:colors` fails when a
 * generated file is out of date. Edit a color here, regenerate, and it changes everywhere.
 *
 * - `light` / `dark` are a hex, an rgb()/color-mix() expression, or a `var(--other-token)` alias.
 * - A token without `dark` keeps its light value in dark mode (it is not redeclared).
 * - `group`: palette = raw colors, role = what the UI means by a color (action, surface, text),
 *   web-alias = names the web UI library expects (background, primary, border...),
 *   scope = values owned by one screen family (the App 2027 Home glass theme) that it maps onto the roles.
 * Metadata only: no UI runtime imports.
 */
export type ColorTokenGroup = 'palette' | 'role' | 'web-alias' | 'scope'

export interface ColorToken {
  name: string
  light?: string
  dark?: string
  group: ColorTokenGroup
}

export const COLOR_TOKENS: readonly ColorToken[] = [
  { name: '--uc-neutral-white', light: '#FFFFFF', dark: '#262626', group: 'palette' },
  { name: '--uc-static-white', light: '#FFFFFF', dark: '#FFFFFF', group: 'role' },
  { name: '--uc-static-black', light: '#262626', dark: '#262626', group: 'role' },
  { name: '--uc-static-white-rgb', light: '255 255 255', dark: '255 255 255', group: 'role' },
  { name: '--uc-static-black-rgb', light: '38 38 38', dark: '38 38 38', group: 'role' },
  { name: '--uc-neutral-100', light: '#F5F5F5', dark: '#121212', group: 'palette' },
  { name: '--uc-neutral-200', light: '#E5E5E5', dark: '#333333', group: 'palette' },
  { name: '--uc-neutral-300', light: '#D8D8D8', dark: '#555555', group: 'palette' },
  { name: '--uc-neutral-400', light: '#CCCCCC', dark: '#666666', group: 'palette' },
  { name: '--uc-neutral-500', light: '#B9B9B9', dark: '#7A7A7A', group: 'palette' },
  { name: '--uc-neutral-600', light: '#999999', dark: '#909090', group: 'palette' },
  { name: '--uc-neutral-650', light: '#909090', dark: '#CCCCCC', group: 'palette' },
  { name: '--uc-neutral-700', light: '#666666', dark: '#CCCCCC', group: 'palette' },
  { name: '--uc-neutral-750', light: '#535453', dark: '#D6D1D8', group: 'palette' },
  { name: '--uc-neutral-800', light: '#454545', dark: '#D0D0D0', group: 'palette' },
  { name: '--uc-primary-k1', light: '#262626', dark: '#FFFFFF', group: 'palette' },
  { name: '--uc-primary-main', light: '#262626', dark: '#FFFFFF', group: 'palette' },
  { name: '--uc-teal-900', light: '#006375', dark: '#CCCCCC', group: 'palette' },
  { name: '--uc-teal-main', light: '#007A91', dark: '#FFFFFF', group: 'palette' },
  { name: '--uc-teal-blue', light: '#05829A', dark: '#4FC6DD', group: 'palette' },
  { name: '--uc-teal-bright', light: '#00A197', dark: '#3ED6C8', group: 'palette' },
  { name: '--uc-teal-soft', light: '#94B1BA', dark: '#2E7C88', group: 'palette' },
  { name: '--uc-teal-pale', light: '#CCECEA', dark: '#315B66', group: 'palette' },
  { name: '--uc-red-main', light: '#E2001A', dark: '#E2001A', group: 'palette' },
  { name: '--uc-red-bright', light: '#E01E25', dark: '#FF5A68', group: 'palette' },
  { name: '--uc-red-card', light: '#B91823', dark: '#F04A58', group: 'palette' },
  { name: '--uc-red-deep', light: '#9A000B', dark: '#D94A5A', group: 'palette' },
  { name: '--uc-red-brown', light: '#961414', dark: '#D65C68', group: 'palette' },
  { name: '--uc-brand-tesla', light: '#E82127', group: 'palette' },
  { name: '--uc-brand-microsoft-red', light: '#F25022', group: 'palette' },
  { name: '--uc-brand-microsoft-green', light: '#7FBA00', group: 'palette' },
  { name: '--uc-brand-microsoft-blue', light: '#00A4EF', group: 'palette' },
  { name: '--uc-brand-microsoft-yellow', light: '#FFB900', group: 'palette' },
  { name: '--uc-product-blue-deep', light: '#244858', dark: '#91D1DD', group: 'palette' },
  { name: '--uc-product-slate', light: '#5E6F73', dark: '#AAB8BC', group: 'palette' },
  { name: '--uc-product-blue', light: '#3F6A8B', dark: '#78B6E8', group: 'palette' },
  { name: '--uc-product-mauve', light: '#A26077', dark: '#D38AA3', group: 'palette' },
  { name: '--uc-product-pink', light: '#DD1860', dark: '#FF5F9A', group: 'palette' },
  { name: '--uc-product-brown', light: '#5E3D32', dark: '#9A6246', group: 'palette' },
  { name: '--uc-future-goal-home', light: '#008574', group: 'palette' },
  { name: '--uc-future-goal-buy-a-car', light: '#E67300', group: 'palette' },
  { name: '--uc-future-goal-personal', light: '#5E3D32', group: 'palette' },
  { name: '--uc-future-goal-saving', light: '#363338', group: 'palette' },
  { name: '--uc-product-hedging', light: '#717863', dark: '#717863', group: 'palette' },
  { name: '--uc-green-deep', light: '#004C3D', dark: '#004C3D', group: 'palette' },
  { name: '--uc-green-main', light: '#007A6B', dark: '#26C3A8', group: 'palette' },
  { name: '--uc-green-bright', light: '#008574', dark: '#008574', group: 'palette' },
  { name: '--uc-green-success', light: '#2FA358', dark: '#59D37F', group: 'palette' },
  { name: '--uc-green-status', light: '#359F42', dark: '#359F42', group: 'palette' },
  { name: '--uc-green-olive', light: '#3D7D43', dark: '#26EDA9', group: 'palette' },
  { name: '--uc-orange-main', light: '#E67300', dark: '#FF9D3B', group: 'palette' },
  { name: '--uc-orange-card', light: '#E67301', dark: '#FF9D3C', group: 'palette' },
  { name: '--uc-orange-bright', light: '#F0871D', dark: '#FFB15C', group: 'palette' },
  { name: '--uc-orange-status', light: '#F26B08', dark: '#FDA98B', group: 'palette' },
  { name: '--uc-yellow-gold', light: '#FBB800', dark: '#FFD24D', group: 'palette' },
  { name: '--uc-yellow-muted', light: '#DFA805', dark: '#F2C84B', group: 'palette' },
  { name: '--uc-yellow-brown', light: '#D1960A', dark: '#E8BF52', group: 'palette' },
  { name: '--uc-yellow-main', light: '#EDBA00', dark: '#FFD24D', group: 'palette' },
  { name: '--uc-orange-deep', light: '#E3690E', dark: '#FF9A47', group: 'palette' },
  { name: '--uc-peach-100', light: '#FFDAC0', dark: '#8F5E42', group: 'palette' },
  { name: '--uc-peach-200', light: '#FFCBB1', dark: '#9A6246', group: 'palette' },
  { name: '--uc-peach-300', light: '#FFBDA5', dark: '#A86B4F', group: 'palette' },
  { name: '--uc-status-red', light: '#CF3524', dark: '#FF7A8E', group: 'palette' },
  { name: '--uc-gold-brown', light: '#7E5B01', dark: '#D4B04D', group: 'palette' },
  { name: '--uc-banner-green-1', light: '#004C3D', dark: '#004C3D', group: 'palette' },
  { name: '--uc-banner-green-2', light: '#007A6B', dark: '#26C3A8', group: 'palette' },
  { name: '--uc-banner-green-3', light: '#008574', dark: '#008574', group: 'palette' },
  { name: '--uc-banner-yellow-1', light: '#D1960A', dark: '#E8BF52', group: 'palette' },
  { name: '--uc-banner-yellow-2', light: '#DFA805', dark: '#F2C84B', group: 'palette' },
  { name: '--uc-banner-yellow-3', light: '#EDBA00', dark: '#FFD24D', group: 'palette' },
  { name: '--uc-banner-orange-1', light: '#E3690E', dark: '#FF9A47', group: 'palette' },
  { name: '--uc-banner-orange-2', light: '#E67301', dark: '#FF9D3C', group: 'palette' },
  { name: '--uc-banner-orange-3', light: '#F0871D', dark: '#FFB15C', group: 'palette' },
  { name: '--uc-banner-pink-1', light: '#FFBDA5', dark: '#A86B4F', group: 'palette' },
  { name: '--uc-banner-pink-2', light: '#FFCBB1', dark: '#9A6246', group: 'palette' },
  { name: '--uc-banner-pink-3', light: '#FFDAC0', dark: '#8F5E42', group: 'palette' },
  { name: '--uc-banner-red-1', light: '#9A000B', dark: '#D94A5A', group: 'palette' },
  { name: '--uc-banner-red-2', light: '#B91823', dark: '#F04A58', group: 'palette' },
  { name: '--uc-banner-red-3', light: '#E2001A', dark: '#E2001A', group: 'palette' },
  { name: '--uc-banner-blue-1', light: '#006375', dark: '#CCCCCC', group: 'palette' },
  { name: '--uc-banner-blue-2', light: '#007A91', dark: '#FFFFFF', group: 'palette' },
  { name: '--uc-banner-blue-3', light: '#05829A', dark: '#4FC6DD', group: 'palette' },
  { name: '--uc-banner-grey-1', light: '#B9B9B9', dark: '#7A7A7A', group: 'palette' },
  { name: '--uc-banner-grey-2', light: '#454545', dark: '#D0D0D0', group: 'palette' },
  {
    name: '--uc-banner-grey-3',
    light: 'rgb(var(--uc-static-black-rgb) / 0.8)',
    dark: 'rgb(var(--uc-static-black-rgb) / 0.8)',
    group: 'palette',
  },
  { name: '--uc-pfm-taxes-penalties', light: '#7757A4', dark: '#9574BF', group: 'palette' },
  { name: '--uc-pfm-income', light: '#05829A', dark: '#3499AD', group: 'palette' },
  { name: '--uc-pfm-utilities', light: '#006375', dark: '#4693A2', group: 'palette' },
  { name: '--uc-pfm-exclude-budget', light: '#B91823', dark: '#E04950', group: 'palette' },
  { name: '--uc-pfm-shopping', light: '#9A000B', dark: '#DA5251', group: 'palette' },
  { name: '--uc-pfm-insurance', light: '#004C3D', dark: '#569482', group: 'palette' },
  { name: '--uc-pfm-groceries', light: '#A33694', dark: '#C355B1', group: 'palette' },
  { name: '--uc-pfm-home', light: '#008574', dark: '#309B88', group: 'palette' },
  { name: '--uc-pfm-education', light: '#5E3D32', dark: '#A17C73', group: 'palette' },
  { name: '--uc-pfm-lifestyle', light: '#388BCA', dark: '#55A2DC', group: 'palette' },
  { name: '--uc-pfm-transportation', light: '#E67300', dark: '#FD8C46', group: 'palette' },
  { name: '--uc-pfm-leisure-time', light: '#E01E25', dark: '#F8434C', group: 'palette' },
  { name: '--uc-pfm-healthcare', light: '#DD1860', dark: '#F63E7B', group: 'palette' },
  { name: '--uc-pfm-investments', light: '#363338', dark: '#88858A', group: 'palette' },
  { name: '--uc-pfm-children', light: '#006375', dark: '#4693A2', group: 'palette' },
  { name: '--uc-pfm-wallet', light: '#7E5B01', dark: '#A28040', group: 'palette' },
  { name: '--uc-pfm-transfers', light: '#359F42', dark: '#4CB65D', group: 'palette' },
  { name: '--uc-pfm-finance', light: '#535453', dark: '#858685', group: 'palette' },
  { name: '--uc-pfm-uncategorized', light: '#007A6B', dark: '#389987', group: 'palette' },
  { name: '--uc-pfm-atm', light: '#388BCA', dark: '#55A2DC', group: 'palette' },
  { name: '--uc-pfm-fx', light: '#244858', dark: '#688C9C', group: 'palette' },
  { name: '--uc-pfm-internal', light: '#0D5870', dark: '#5190A6', group: 'palette' },
  { name: '--uc-robo-scenario-higher', light: 'var(--uc-green-status)', group: 'palette' },
  { name: '--uc-robo-scenario-estimated', light: 'var(--uc-pfm-lifestyle)', group: 'palette' },
  { name: '--uc-robo-scenario-lower', light: '#3D1FAB', group: 'palette' },
  { name: '--uc-robo-scenario-higher-fill', light: '#E1F1E3', group: 'palette' },
  { name: '--uc-robo-scenario-estimated-fill', light: '#E1EEF7', group: 'palette' },
  { name: '--uc-robo-scenario-lower-fill', light: '#E2DDF2', group: 'palette' },
  { name: '--uc-app-bg', light: 'var(--uc-neutral-100)', dark: 'var(--uc-neutral-100)', group: 'role' },
  { name: '--uc-surface', light: 'var(--uc-neutral-white)', dark: 'var(--uc-neutral-200)', group: 'role' },
  { name: '--uc-surface-muted', light: 'var(--uc-neutral-100)', dark: 'var(--uc-neutral-300)', group: 'role' },
  { name: '--uc-surface-raised', light: 'var(--uc-neutral-white)', dark: 'var(--uc-neutral-300)', group: 'role' },
  { name: '--uc-text', light: 'var(--uc-primary-k1)', dark: 'var(--uc-primary-k1)', group: 'role' },
  { name: '--uc-text-muted', light: 'var(--uc-neutral-700)', dark: 'var(--uc-neutral-700)', group: 'role' },
  { name: '--uc-text-subtle', light: 'var(--uc-neutral-600)', dark: 'var(--uc-neutral-600)', group: 'role' },
  { name: '--uc-text-inverse', light: 'var(--uc-neutral-white)', dark: 'var(--uc-neutral-white)', group: 'role' },
  { name: '--uc-glass-hairline', light: 'rgb(255 255 255 / 0.55)', dark: 'rgb(255 255 255 / 0.14)', group: 'role' },
  { name: '--uc-glass-highlight', light: 'rgb(255 255 255 / 0.45)', dark: 'rgb(255 255 255 / 0.10)', group: 'role' },
  { name: '--uc-action-strong', light: 'var(--uc-teal-main)', dark: '#0F6E7C', group: 'role' },
  { name: '--uc-summary-accounts', light: '#94B1BA', dark: '#22343B', group: 'role' },
  { name: '--uc-summary-savings', light: '#DBE0D1', dark: '#2A3227', group: 'role' },
  { name: '--uc-summary-credits', light: '#D9B4AE', dark: '#3B2724', group: 'role' },
  { name: '--uc-summary-insurance', light: '#DED7EA', dark: '#2D2839', group: 'role' },
  { name: '--uc-icon', light: 'var(--uc-primary-k1)', dark: 'var(--uc-primary-k1)', group: 'role' },
  { name: '--uc-icon-muted', light: 'var(--uc-neutral-700)', dark: 'var(--uc-neutral-700)', group: 'role' },
  { name: '--uc-border', light: 'var(--uc-neutral-300)', dark: 'var(--uc-neutral-400)', group: 'role' },
  { name: '--uc-border-muted', light: 'var(--uc-neutral-200)', dark: 'var(--uc-neutral-300)', group: 'role' },
  { name: '--uc-action', light: 'var(--uc-teal-main)', dark: 'var(--uc-teal-main)', group: 'role' },
  { name: '--uc-action-hover', light: 'var(--uc-teal-900)', dark: 'var(--uc-teal-900)', group: 'role' },
  { name: '--uc-action-soft', light: 'var(--uc-teal-pale)', dark: 'var(--uc-teal-pale)', group: 'role' },
  { name: '--uc-action-soft-strong', light: 'var(--uc-teal-soft)', dark: 'var(--uc-teal-soft)', group: 'role' },
  { name: '--uc-brand', light: 'var(--uc-red-main)', dark: 'var(--uc-red-main)', group: 'role' },
  { name: '--uc-danger', light: 'var(--uc-red-main)', dark: 'var(--uc-red-main)', group: 'role' },
  { name: '--uc-shadow-rgb', light: '0 0 0', dark: '0 0 0', group: 'role' },
  { name: '--uc-bottom-bar-bg', light: 'var(--uc-neutral-white)', dark: 'var(--uc-surface)', group: 'role' },
  { name: '--uc-sheet-bg', light: 'var(--uc-neutral-white)', dark: 'var(--uc-surface)', group: 'role' },
  {
    name: '--uc-overlay',
    light: 'rgb(var(--uc-shadow-rgb) / 0.4)',
    dark: 'rgb(var(--uc-shadow-rgb) / 0.55)',
    group: 'role',
  },
  { name: '--background', light: 'var(--uc-app-bg)', dark: 'var(--uc-app-bg)', group: 'web-alias' },
  { name: '--foreground', light: 'var(--uc-text)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--card', light: 'var(--uc-surface)', dark: 'var(--uc-surface)', group: 'web-alias' },
  { name: '--card-foreground', light: 'var(--uc-text)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--popover', light: 'var(--uc-surface)', dark: 'var(--uc-surface)', group: 'web-alias' },
  { name: '--popover-foreground', light: 'var(--uc-text)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--primary', light: 'var(--uc-primary-k1)', dark: 'var(--uc-text)', group: 'web-alias' },
  {
    name: '--primary-foreground',
    light: 'var(--uc-neutral-white)',
    dark: 'var(--uc-text-inverse)',
    group: 'web-alias',
  },
  { name: '--secondary', light: 'var(--uc-neutral-100)', dark: 'var(--uc-surface-muted)', group: 'web-alias' },
  { name: '--secondary-foreground', light: 'var(--uc-text)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--muted', light: 'var(--uc-neutral-200)', dark: 'var(--uc-surface-muted)', group: 'web-alias' },
  { name: '--muted-foreground', light: 'var(--uc-text-muted)', dark: 'var(--uc-text-muted)', group: 'web-alias' },
  { name: '--accent', light: 'var(--uc-action-soft)', dark: 'var(--uc-action-soft)', group: 'web-alias' },
  { name: '--accent-foreground', light: 'var(--uc-action-hover)', dark: 'var(--uc-action-hover)', group: 'web-alias' },
  { name: '--destructive', light: 'var(--uc-danger)', dark: 'var(--uc-danger)', group: 'web-alias' },
  {
    name: '--destructive-foreground',
    light: 'var(--uc-neutral-white)',
    dark: 'var(--uc-static-white)',
    group: 'web-alias',
  },
  { name: '--border', light: 'var(--uc-border)', dark: 'var(--uc-border)', group: 'web-alias' },
  { name: '--input', light: 'transparent', dark: 'var(--uc-surface-muted)', group: 'web-alias' },
  { name: '--input-background', light: 'var(--uc-neutral-100)', dark: 'var(--uc-surface-muted)', group: 'web-alias' },
  { name: '--switch-background', light: 'var(--uc-neutral-400)', dark: 'var(--uc-neutral-400)', group: 'web-alias' },
  { name: '--ring', light: 'var(--uc-action)', dark: 'var(--uc-action)', group: 'web-alias' },
  { name: '--chart-1', light: 'var(--uc-teal-main)', dark: 'var(--uc-action)', group: 'web-alias' },
  { name: '--chart-2', light: 'var(--uc-primary-k1)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--chart-3', light: 'var(--uc-yellow-gold)', dark: 'var(--uc-yellow-gold)', group: 'web-alias' },
  { name: '--chart-4', light: 'var(--uc-green-success)', dark: 'var(--uc-green-success)', group: 'web-alias' },
  { name: '--chart-5', light: 'var(--uc-red-main)', dark: 'var(--uc-brand)', group: 'web-alias' },
  { name: '--sidebar', light: 'var(--uc-surface)', dark: 'var(--uc-surface)', group: 'web-alias' },
  { name: '--sidebar-foreground', light: 'var(--uc-text)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--sidebar-primary', light: 'var(--uc-action)', dark: 'var(--uc-action)', group: 'web-alias' },
  {
    name: '--sidebar-primary-foreground',
    light: 'var(--uc-neutral-white)',
    dark: 'var(--uc-text-inverse)',
    group: 'web-alias',
  },
  { name: '--sidebar-accent', light: 'var(--uc-neutral-100)', dark: 'var(--uc-surface-muted)', group: 'web-alias' },
  { name: '--sidebar-accent-foreground', light: 'var(--uc-text)', dark: 'var(--uc-text)', group: 'web-alias' },
  { name: '--sidebar-border', light: 'var(--uc-border)', dark: 'var(--uc-border)', group: 'web-alias' },
  { name: '--sidebar-ring', light: 'var(--uc-action)', dark: 'var(--uc-action)', group: 'web-alias' },
  { name: '--uc-home-glass-app-bg', light: '#12171a', group: 'scope' },
  { name: '--uc-home-glass-surface', light: 'rgb(30 37 41 / 0.82)', group: 'scope' },
  { name: '--uc-home-glass-surface-muted', light: 'rgb(255 255 255 / 0.09)', group: 'scope' },
  { name: '--uc-home-glass-surface-raised', light: 'rgb(39 47 52 / 0.9)', group: 'scope' },
  { name: '--uc-home-glass-text', light: '#f7f7f4', group: 'scope' },
  { name: '--uc-home-glass-text-muted', light: '#bec2c2', group: 'scope' },
  { name: '--uc-home-glass-text-subtle', light: '#9ca1a1', group: 'scope' },
  { name: '--uc-home-glass-border', light: 'rgb(255 255 255 / 0.18)', group: 'scope' },
  { name: '--uc-home-glass-border-muted', light: 'rgb(255 255 255 / 0.11)', group: 'scope' },
  { name: '--uc-home-glass-action', light: '#65d9d2', group: 'scope' },
  { name: '--uc-home-glass-action-hover', light: '#8cebe5', group: 'scope' },
  { name: '--uc-home-glass-action-soft', light: 'rgb(101 217 210 / 0.15)', group: 'scope' },
  { name: '--uc-home-glass-action-soft-strong', light: 'rgb(101 217 210 / 0.22)', group: 'scope' },
  { name: '--uc-home-glass-action-strong', light: '#0F6E7C', group: 'scope' },
  { name: '--uc-home-glass-bottom-bar-bg', light: 'rgb(34 41 45 / 0.74)', group: 'scope' },
  { name: '--uc-home-glass-dark-text-subtle', light: '#aeb3b3', group: 'scope' },
]

const TOKEN_BY_NAME = new Map<string, ColorToken>(COLOR_TOKENS.map((token) => [token.name, token]))
const resolved: Record<'light' | 'dark', Map<string, string>> = { light: new Map(), dark: new Map() }

/**
 * The value of a token for a theme, with every `var(--other)` alias resolved the way the browser
 * resolves it: a token with no `dark` value keeps the light value already resolved on :root, and a
 * token with one resolves its aliases against dark.
 */
export function resolveColorToken(name: string, theme: 'light' | 'dark', stack: readonly string[] = []): string {
  const cached = resolved[theme].get(name)
  if (cached !== undefined) return cached
  if (stack.includes(name)) throw new Error(`Alias cycle: ${[...stack, name].join(' -> ')}`)
  const token = TOKEN_BY_NAME.get(name)
  if (!token)
    throw new Error(`Unknown color token ${name}${stack.length ? ` (referenced from ${stack[stack.length - 1]})` : ''}`)
  const expression = theme === 'dark' && token.dark !== undefined ? token.dark : token.light
  if (expression === undefined)
    throw new Error(`Color token ${name} has no ${theme === 'dark' ? 'dark or light' : 'light'} value`)
  const inheritedLight = theme === 'dark' && token.dark === undefined
  const value = inheritedLight
    ? resolveColorToken(name, 'light', stack)
    : expression.replace(/var\(\s*(--[A-Za-z0-9-]+)\s*\)/g, (_match, ref: string) =>
        resolveColorToken(ref, theme, [...stack, name]),
      )
  resolved[theme].set(name, value)
  return value
}
