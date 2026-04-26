import {
  computeNatalChart,
  ZODIAC_GLYPHS,
  type NatalChart,
} from './astroEngine';
import {
  synthesizeCompatibility,
  type CompatibilityReport,
} from './compatibilityEngine';
import {
  notificationBlurbFor,
  synthesizeDailyInsight,
  type DailyInsight,
} from './dailyInsightEngine';
import { birthChart, dailyInsight, compatibility } from '../data/mockInsights';
import {
  getBirthInputFromStore,
  partnerToBirthInput,
  useOnboardingStore,
} from '../store/onboardingStore';

export type ChartCardData = {
  sun: { name: string; glyph: string; detail: string };
  moon: { name: string; glyph: string; detail: string };
  ascendant: { name: string; glyph: string; detail: string };
  dominant: { name: string; glyph: string; detail: string };
};

const SIGN_BLURBS: Record<string, string> = {
  Aries: 'Bold, courageous, and ready to lead the charge.',
  Taurus: 'Grounded, sensual, and quietly persistent.',
  Gemini: 'Curious, witty, and a brilliant communicator.',
  Cancer: 'Intuitive, nurturing, deeply emotional.',
  Leo: 'Confident, expressive, warm-hearted.',
  Virgo: 'Precise, devoted, quietly perfectionist.',
  Libra: 'Diplomatic, fair, drawn to beauty and balance.',
  Scorpio: 'Magnetic presence, intense gaze, deep loyalty.',
  Sagittarius: 'Adventurous, philosophical, optimistic.',
  Capricorn: 'Disciplined, ambitious, plays the long game.',
  Aquarius: 'Visionary, independent, future-leaning.',
  Pisces: 'Imaginative, empathic, dreamlike.',
};

/**
 * "17.534" → "17° 32′" — the standard astrology format for a placement
 * within its sign. We round minutes to the nearest integer.
 */
function formatDegreeMinutes(degree: number): string {
  const wholeDeg = Math.floor(degree);
  const minutes = Math.round((degree - wholeDeg) * 60);
  // Carry: 17° 60′ → 18° 00′
  if (minutes === 60) return `${wholeDeg + 1}° 00′`;
  return `${wholeDeg}° ${minutes.toString().padStart(2, '0')}′`;
}

function chartToCards(chart: NatalChart): ChartCardData {
  const sunDeg = formatDegreeMinutes(chart.sun.degree);
  const moonDeg = formatDegreeMinutes(chart.moon.degree);
  const ascDeg = formatDegreeMinutes(chart.ascendant.degree);
  return {
    sun: {
      name: `Sun in ${chart.sun.sign}, ${sunDeg}`,
      glyph: '☉',
      detail: SIGN_BLURBS[chart.sun.sign] ?? '',
    },
    moon: {
      name: `Moon in ${chart.moon.sign}, ${moonDeg}`,
      glyph: '☽',
      detail: SIGN_BLURBS[chart.moon.sign] ?? '',
    },
    ascendant: {
      name: `${chart.ascendant.sign} Rising, ${ascDeg}`,
      glyph: ZODIAC_GLYPHS[chart.ascendant.sign] ?? '↑',
      detail: SIGN_BLURBS[chart.ascendant.sign] ?? '',
    },
    dominant: {
      name: `${chart.dominant.name} Dominant`,
      glyph: chart.dominant.glyph,
      detail: `Channelled through ${chart.dominant.sign}.`,
    },
  };
}

export const astrologyService = {
  async getDailyInsight(when: Date = new Date()): Promise<DailyInsight | typeof dailyInsight> {
    const state = useOnboardingStore.getState();
    const input = getBirthInputFromStore(state);
    if (!input) return dailyInsight;
    return synthesizeDailyInsight(input, when);
  },

  /** Personalized one-liner for the morning push notification. */
  async getDailyNotificationBlurb(when: Date = new Date()): Promise<string | null> {
    const state = useOnboardingStore.getState();
    const input = getBirthInputFromStore(state);
    if (!input) return null;
    return notificationBlurbFor(synthesizeDailyInsight(input, when));
  },

  async getBirthChart(): Promise<ChartCardData> {
    const state = useOnboardingStore.getState();
    const input = getBirthInputFromStore(state);
    if (!input) return birthChart;
    return chartToCards(computeNatalChart(input));
  },

  /** Raw chart placements (used to render BirthChartPreview accurately). */
  async getNatalChart(): Promise<NatalChart | null> {
    const state = useOnboardingStore.getState();
    const input = getBirthInputFromStore(state);
    if (!input) return null;
    return computeNatalChart(input);
  },

  /**
   * Returns a real compatibility report when both birth inputs are
   * available; otherwise the bundled mock so the screen still has shape.
   */
  async getCompatibility(): Promise<CompatibilityReport | typeof compatibility> {
    const state = useOnboardingStore.getState();
    const userInput = getBirthInputFromStore(state);
    const partner = state.partner;
    if (!userInput || !partner) return compatibility;
    return synthesizeCompatibility(
      userInput,
      partnerToBirthInput(partner),
      'You',
      partner.name || 'Them',
    );
  },
};
