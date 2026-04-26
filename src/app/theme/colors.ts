export const colors = {
  // Backgrounds
  bgPrimary: '#080817',
  bgSecondary: '#11102A',
  navy: '#070B1F',

  // Purples
  deepPurple: '#251047',
  royalPurple: '#3A1B6D',
  purpleHaze: '#1A1138',
  midnight: '#0E0B26',

  // Gold
  goldPrimary: '#F6C85F',
  goldBright: '#FFD98A',
  goldMuted: '#B98A3A',
  goldDeep: '#7A5A24',

  // Text
  white: '#FFFFFF',
  textSecondary: '#B9B4D0',
  textMuted: '#807A9E',
  textDim: '#5A5478',

  // Status
  error: '#FF6B6B',
  success: '#65E6A5',
  info: '#7AA9FF',

  // Surfaces
  glassSurface: 'rgba(255,255,255,0.08)',
  glassSurfaceDark: 'rgba(8,8,23,0.55)',
  glassBorder: 'rgba(246,200,95,0.32)',
  glassBorderSoft: 'rgba(246,200,95,0.16)',
  darkCard: '#141229',
  darkCardSoft: '#1B1736',

  // Overlays
  overlay: 'rgba(0,0,0,0.55)',
  shimmer: 'rgba(255,255,255,0.06)',
} as const;

export type ColorKey = keyof typeof colors;

export const gradients = {
  cosmic: ['#080817', '#11102A', '#1A1138', '#0E0B26'] as const,
  deep: ['#070B1F', '#11102A', '#251047'] as const,
  glow: ['#3A1B6D', '#251047', '#080817'] as const,
  goldShine: ['#FFD98A', '#F6C85F', '#B98A3A'] as const,
  goldButton: ['#FFD98A', '#F6C85F', '#D9A641'] as const,
  glassCard: ['rgba(58,27,109,0.45)', 'rgba(20,18,41,0.65)'] as const,
  glassCardSoft: ['rgba(58,27,109,0.35)', 'rgba(8,8,23,0.55)'] as const,
  chamber: ['#1F0F3D', '#0E0826', '#080817'] as const,
};
