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
  // Multi-stop cosmic background — starts at near-black at the top, drifts
  // through deep purple, then back down. Richer than a 2-stop gradient.
  cosmic: ['#080817', '#0F0B22', '#1A1138', '#251047', '#0E0B26', '#080817'] as const,
  deep: ['#070B1F', '#0F0E22', '#11102A', '#1B1340', '#251047'] as const,
  glow: ['#5A2A9F', '#3A1B6D', '#251047', '#0E0826', '#080817'] as const,
  // Gold sheen with a subtle highlight stop near the top so buttons feel
  // physically lit, not flat-painted.
  goldShine: ['#FFE4A8', '#FFD98A', '#F6C85F', '#D9A641', '#B98A3A'] as const,
  goldButton: ['#FFE4A8', '#FFD98A', '#F6C85F', '#D9A641'] as const,
  // Glass cards — top-down lighting feel (slightly brighter at top).
  glassCard: ['rgba(78,40,140,0.55)', 'rgba(40,22,90,0.55)', 'rgba(20,18,41,0.65)'] as const,
  glassCardSoft: ['rgba(58,27,109,0.42)', 'rgba(28,16,68,0.42)', 'rgba(8,8,23,0.55)'] as const,
  // Top-edge gloss applied inside cards/buttons — gold sheen fading out.
  topGloss: ['rgba(255,217,138,0.22)', 'rgba(255,217,138,0.05)', 'rgba(255,217,138,0)'] as const,
  // Bottom-edge inner shadow for depth.
  bottomShade: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.32)'] as const,
  chamber: ['#2A1455', '#1F0F3D', '#100728', '#0E0826', '#080817'] as const,
};
