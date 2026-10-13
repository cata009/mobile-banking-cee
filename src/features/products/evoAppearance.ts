import auroraImage from '@/assets/app2027/uni-theme-aurora-v1.png'
import obsidianImage from '@/assets/app2027/uni-theme-obsidian-v1.png'
import porcelainImage from '@/assets/app2027/uni-theme-porcelain-v1.png'

export type HomeTheme =
  | 'standard'
  | 'aurora'
  | 'porcelain'
  | 'obsidian'
  | 'nordlys'
  | 'blue-lines'
  | 'blockcraft'
  | 'magenta'
  | 'garden'
  | 'solar'

export interface App2027ThemeDefinition {
  id: HomeTheme
  name: string
  description: string
  swatch: string
  image?: string
  position?: string
}

export const APP_2027_THEMES: readonly App2027ThemeDefinition[] = [
  {
    id: 'standard',
    name: 'Classic UniCredit',
    description: 'The essential UniCredit Home',
    swatch: 'linear-gradient(135deg,#f5f5f5 0 48%,#242424 49% 100%)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Living teal light',
    image: auroraImage,
    position: '50% 42%',
    swatch: 'linear-gradient(135deg,#062d32,#0aa5a8 56%,#d0001a)',
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    description: 'Warm luminous calm',
    image: porcelainImage,
    position: '50% 44%',
    swatch: 'linear-gradient(135deg,#fffaf4,#e8ded4 58%,#8fc8c5)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Deep cinematic glass',
    image: obsidianImage,
    position: '50% 48%',
    swatch: 'linear-gradient(135deg,#050708,#1a2528 55%,#8b1424)',
  },
  {
    id: 'nordlys',
    name: 'Nordlys',
    description: 'Polar night',
    swatch:
      'radial-gradient(circle at 74% 72%,#fbb800,transparent 24%),linear-gradient(118deg,#03141c,#0a3a4a 50%,#3ed6c8)',
  },
  {
    id: 'blue-lines',
    name: 'Blue Lines',
    description: 'Kinetic meridians',
    swatch:
      'repeating-linear-gradient(124deg,transparent 0 10px,#4fc6dd 11px 13px,transparent 14px 24px),linear-gradient(135deg,#061a36,#1366aa,#008c95)',
  },
  {
    id: 'blockcraft',
    name: 'Blockcraft',
    description: 'Geometric energy',
    swatch: 'conic-gradient(from 45deg,#9aa82f 0 25%,#174c3c 0 50%,#d3a02c 0 75%,#748320 0)',
  },
  {
    id: 'magenta',
    name: 'Magenta',
    description: 'Luminous brand glow',
    swatch: 'linear-gradient(135deg,#512342,#be2764 52%,#e2001a)',
  },
  {
    id: 'garden',
    name: 'Garden',
    description: 'Fresh living lines',
    swatch: 'linear-gradient(135deg,#174c3c,#4c9f38 58%,#fbb800)',
  },
  {
    id: 'solar',
    name: 'Solar',
    description: 'Warm orbital light',
    swatch:
      'radial-gradient(circle at 70% 28%,#fbb800,transparent 31%),linear-gradient(135deg,#b81f2f,#ed6b1a 62%,#fbb800)',
  },
] as const

export function getApp2027Theme(theme: HomeTheme) {
  return APP_2027_THEMES.find((item) => item.id === theme) ?? APP_2027_THEMES[0]!
}
