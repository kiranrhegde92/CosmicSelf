/**
 * Synthesize a compatibility report from two natal charts.
 *
 * Pure: same inputs always produce the same output. The numeric score and
 * the four card values come from the synastry math in astroEngine; the
 * prose comes from a small per-category template.
 */
import type { IconName } from '../components/ui/CosmicIcon';
import {
  AspectType,
  SynastryAspect,
  SynastryPlanet,
  ZODIAC_GLYPHS,
  computeNatalChart,
  computeSynastry,
  type BirthInput,
  type NatalChart,
} from './astroEngine';

export type CompatibilityCardKey =
  | 'emotional'
  | 'communication'
  | 'longterm'
  | 'challenges';

export type CompatibilityCard = {
  key: CompatibilityCardKey;
  title: string;
  icon: IconName;
  tone: 'gold' | 'rose' | 'mint' | 'blue';
  value: string;
  description: string;
};

export type CompatibilityReport = {
  partnerA: { sign: string; glyph: string; label: string };
  partnerB: { sign: string; glyph: string; label: string };
  score: number;
  label: string;
  cards: CompatibilityCard[];
  /** Top three aspects, useful for premium "view full report" deeper read. */
  topAspects: SynastryAspect[];
};

const SCORE_LABEL = (s: number): string => {
  if (s >= 88) return 'Soulmate Pull';
  if (s >= 75) return 'Strong Alignment';
  if (s >= 60) return 'Promising Resonance';
  if (s >= 45) return 'Workable Tension';
  return 'Hard-Earned Bond';
};

const TIP_HEAD = (s: number): string => {
  if (s >= 75) return 'You catch each other\'s rhythm fast.';
  if (s >= 60) return 'There\'s a draw, with rough edges to soften.';
  if (s >= 45) return 'Different gravities — beautiful when chosen on purpose.';
  return 'Real work, real growth. Not for the faint of heart.';
};

/* -------------------------------------------------------------------------- */
/* Per-category bucketing                                                     */
/* -------------------------------------------------------------------------- */

type CategoryBucket = { key: CompatibilityCardKey; planets: SynastryPlanet[]; verdict: 'plus' | 'minus' };

const CATEGORY_RULES: { category: CompatibilityCardKey; involves: SynastryPlanet[]; bias?: 'plus' | 'minus' }[] = [
  { category: 'emotional', involves: ['Moon'] },
  { category: 'emotional', involves: ['Venus', 'Sun'] }, // Sun-Venus inter-aspects
  { category: 'communication', involves: ['Mercury'] },
  { category: 'longterm', involves: ['Saturn'] },
  { category: 'longterm', involves: ['Jupiter'] },
  // Challenges = the negative aspects regardless of bodies
  { category: 'challenges', involves: ['Mars', 'Saturn'], bias: 'minus' },
];

function planetsInvolved(a: SynastryAspect): SynastryPlanet[] {
  return [a.bodyA, a.bodyB];
}

function aspectMatchesRule(
  a: SynastryAspect,
  rule: { involves: SynastryPlanet[]; bias?: 'plus' | 'minus' },
): boolean {
  const ps = planetsInvolved(a);
  const involvesAnyRequired = rule.involves.some((p) => ps.includes(p));
  if (!involvesAnyRequired) return false;
  if (rule.bias === 'minus' && a.signedStrength >= 0) return false;
  if (rule.bias === 'plus' && a.signedStrength <= 0) return false;
  return true;
}

function categoryScore(
  aspects: SynastryAspect[],
  rules: typeof CATEGORY_RULES,
  category: CompatibilityCardKey,
): { value: string; description: string } {
  const matched = aspects.filter((a) =>
    rules.some((r) => r.category === category && aspectMatchesRule(a, r)),
  );

  if (matched.length === 0) {
    return CATEGORY_FALLBACKS[category];
  }

  const meanSigned =
    matched.reduce((sum, a) => sum + a.signedStrength, 0) / matched.length;

  // Translate mean into a 0..100 percentage for emotional/communication/long-term
  // and a qualitative label for challenges.
  if (category === 'challenges') {
    const tense = matched.filter((a) => a.signedStrength < 0);
    if (tense.length >= 4) {
      return {
        value: 'Significant',
        description: 'Several friction points cluster around drive, control, and limits.',
      };
    }
    if (tense.length >= 2) {
      return {
        value: 'Manageable',
        description: 'Stubborn streaks on both sides. Practice yielding gently.',
      };
    }
    return {
      value: 'Light',
      description: 'Minor static. Mostly smooth sailing if you talk through it.',
    };
  }

  // emotional / communication / longterm get a 0..100 percentage.
  const pct = Math.round(50 + meanSigned * 45);
  const clamped = Math.max(20, Math.min(96, pct));
  return {
    value: `${clamped}%`,
    description: blurbFor(category, clamped),
  };
}

const CATEGORY_FALLBACKS: Record<CompatibilityCardKey, { value: string; description: string }> = {
  emotional: { value: '—', description: 'No major Moon or Venus contacts. Build rapport by spending real time.' },
  communication: { value: '—', description: 'No direct Mercury contacts. Talk style is independent — make space for both.' },
  longterm: { value: '—', description: 'No Saturn or Jupiter signal. Reassess in a few months as transits shift.' },
  challenges: { value: 'Light', description: 'Few hot-spot aspects. Mostly easy sailing.' },
};

function blurbFor(category: CompatibilityCardKey, pct: number): string {
  if (category === 'emotional') {
    if (pct >= 80) return 'Inner worlds resonate. Vulnerability deepens trust.';
    if (pct >= 60) return 'Steady warmth, with the occasional emotional miss.';
    return 'Different emotional textures. Slow it down to find the overlap.';
  }
  if (category === 'communication') {
    if (pct >= 80) return 'You finish each other\'s thoughts. Words flow.';
    if (pct >= 60) return 'Clear most days; pause when one is tired.';
    return 'Different rhythms. Slow conversation builds clarity.';
  }
  if (category === 'longterm') {
    if (pct >= 80) return 'Shared ideals and aligned values. A steady upward arc.';
    if (pct >= 60) return 'Foundations are workable; commit to the small habits.';
    return 'Less innate alignment. Strong intent makes up the gap.';
  }
  return '';
}

/* -------------------------------------------------------------------------- */
/* Card meta                                                                  */
/* -------------------------------------------------------------------------- */

const CARDS_META: Record<CompatibilityCardKey, { title: string; icon: IconName; tone: CompatibilityCard['tone'] }> = {
  emotional: { title: 'Emotional Bond', icon: 'heart', tone: 'rose' },
  communication: { title: 'Communication', icon: 'chat', tone: 'blue' },
  longterm: { title: 'Long-Term Potential', icon: 'star', tone: 'gold' },
  challenges: { title: 'Challenges', icon: 'shield', tone: 'mint' },
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function synthesizeCompatibility(
  birthA: BirthInput,
  birthB: BirthInput,
  labelA: string = 'You',
  labelB: string = 'Them',
): CompatibilityReport {
  const chartA = computeNatalChart(birthA);
  const chartB = computeNatalChart(birthB);
  const { aspects, score } = computeSynastry(chartA, chartB);

  const cards: CompatibilityCard[] = (
    ['emotional', 'communication', 'longterm', 'challenges'] as CompatibilityCardKey[]
  ).map((key) => {
    const { value, description } = categoryScore(aspects, CATEGORY_RULES, key);
    return {
      key,
      ...CARDS_META[key],
      value,
      description,
    };
  });

  return {
    partnerA: {
      sign: chartA.sun.sign,
      glyph: ZODIAC_GLYPHS[chartA.sun.sign] ?? '✦',
      label: labelA,
    },
    partnerB: {
      sign: chartB.sun.sign,
      glyph: ZODIAC_GLYPHS[chartB.sun.sign] ?? '✦',
      label: labelB,
    },
    score,
    label: SCORE_LABEL(score),
    cards,
    topAspects: aspects.slice(0, 3),
  };
}

export function tipFor(report: CompatibilityReport): string {
  return TIP_HEAD(report.score);
}

// re-export for tests
export type { AspectType, NatalChart };
