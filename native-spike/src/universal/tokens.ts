/** Visual parameters are provided by the experience, never inferred from its country. */
export interface ControlTokens {
  accent: string;
  text: string;
  muted: string;
  background: string;
  surface: string;
  border: string;
  inverse: string;
  font: string;
  strongFont: string;
  radius: number;
  controlHeight: number;
  searchRadius?: number;
  searchBorder?: string;
  searchBorderWidth?: number;
  searchBackground?: string;
  searchFocusBorder?: string;
  searchGap?: number;
  searchPaddingHorizontal?: number;
  rowHeight?: number;
  rowPaddingHorizontal?: number;
  rowPaddingVertical?: number;
  rowGap?: number;
  rowSubtitleSize?: number;
}
export const mobileFirstTokens: ControlTokens = {
  accent: '#007a91',
  text: '#262626',
  muted: '#666666',
  background: '#ffffff',
  surface: '#f5f5f5',
  border: '#e5e5e5',
  inverse: '#ffffff',
  font: 'UniCredit-regular',
  strongFont: 'UniCredit-bold',
  radius: 8,
  controlHeight: 48,
  searchRadius: 24,
  searchBorder: '#909090',
  searchBorderWidth: 2,
  searchBackground: '#ffffff',
  searchFocusBorder: '#004f95',
  searchGap: 16,
  searchPaddingHorizontal: 16,
  rowHeight: 76,
  rowPaddingHorizontal: 12,
  rowPaddingVertical: 14,
  rowGap: 10,
  rowSubtitleSize: 12,
};
