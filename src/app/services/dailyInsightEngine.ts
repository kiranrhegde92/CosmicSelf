/**
 * Synthesize a personalized daily reading from the user's natal chart and
 * today's transits. Pure functions — no I/O — so the same date + chart
 * produces a stable result (we seed the random tone-picker on the date).
 */
import {
  AspectType,
  NatalPoint,
  Transit,
  TransitingPlanet,
  ZODIAC_GLYPHS,
  computeNatalChart,
  computeTransits,
  type BirthInput,
  type NatalChart,
} from './astroEngine';
import type { IconName } from '../components/ui/CosmicIcon';

export type SectionKey = 'love' | 'career' | 'health' | 'energy';
export type ToneKey = 'gold' | 'rose' | 'mint' | 'blue';

export type DailyInsightSection = {
  key: SectionKey;
  title: string;
  icon: IconName;
  tone: ToneKey;
  value: string;
  description: string;
};

export type DailyInsight = {
  date: string;
  zodiac: string;
  zodiacGlyph: string;
  headline: string;
  body: string;
  sections: DailyInsightSection[];
  /** Source transit, kept around so callers can quote it in notifications. */
  source?: { transit: Transit; chart: NatalChart };
};

const HARMONIOUS: AspectType[] = ['trine', 'sextile'];
const TENSE: AspectType[] = ['square', 'opposition'];

const ASPECT_VERB: Record<AspectType, string> = {
  conjunction: 'conjuncts',
  sextile: 'sextiles',
  square: 'squares',
  trine: 'trines',
  opposition: 'opposes',
};

const ASPECT_FEELING: Record<AspectType, string> = {
  conjunction: 'merged with',
  sextile: 'gently in step with',
  square: 'frictioning against',
  trine: 'flowing into',
  opposition: 'mirrored across from',
};

const NATAL_LABEL: Record<NatalPoint, string> = {
  sun: 'your core identity',
  moon: 'your inner emotions',
  ascendant: 'the way the world meets you',
};

const NATAL_SHORT: Record<NatalPoint, string> = {
  sun: 'Sun',
  moon: 'Moon',
  ascendant: 'Ascendant',
};

const PLANET_BLURB: Record<TransitingPlanet, string> = {
  Sun: 'vitality and ego',
  Moon: 'mood and instinct',
  Mercury: 'words and choices',
  Venus: 'tenderness and beauty',
  Mars: 'drive and confrontation',
  Jupiter: 'expansion and luck',
  Saturn: 'discipline and limits',
};

/* -------------------------------------------------------------------------- */
/* Section tinting per active planet                                          */
/* -------------------------------------------------------------------------- */

type SectionShade = { value: string; description: string };
type SectionTable = Record<TransitingPlanet, SectionShade>;

const SECTIONS: Record<SectionKey, SectionTable> = {
  love: {
    Venus: { value: 'Magnetic', description: 'Tenderness amplifies. Soft words travel far today.' },
    Mars: { value: 'Charged', description: 'Bring the heat — but watch for sparks turning into smoke.' },
    Moon: { value: 'Tender', description: 'Listen more than you speak. Feelings ride close to the surface.' },
    Mercury: { value: 'Curious', description: 'A conversation deepens what was casual.' },
    Sun: { value: 'Radiant', description: 'You shine; others want to be near it.' },
    Jupiter: { value: 'Generous', description: 'Say yes to the small invitation.' },
    Saturn: { value: 'Steady', description: 'Loyalty over novelty. Show up, gently.' },
  },
  career: {
    Mercury: { value: 'Sharp', description: 'Your words land. Pitch the idea you\'ve been holding.' },
    Sun: { value: 'Magnetic', description: 'Visibility favors you. Step into the room.' },
    Mars: { value: 'Driven', description: 'Push the project an extra hour. Ground gets gained.' },
    Saturn: { value: 'Disciplined', description: 'Boring tasks pay disproportionate dividends today.' },
    Jupiter: { value: 'Expansive', description: 'A door cracks open — walk through.' },
    Venus: { value: 'Charming', description: 'Diplomacy unblocks what brute force couldn\'t.' },
    Moon: { value: 'Intuitive', description: 'Trust the gut feeling on the email you almost sent.' },
  },
  health: {
    Sun: { value: 'Recharging', description: 'Step into morning light. Your spine craves the sun.' },
    Moon: { value: 'Resting', description: 'Sleep early. The body asks for slowness.' },
    Mars: { value: 'Active', description: 'Move hard, then stretch harder.' },
    Mercury: { value: 'Light', description: 'Hydrate and walk. Mental clutter clears with motion.' },
    Venus: { value: 'Soft', description: 'Comfort foods are fine; just savor, don\'t scarf.' },
    Jupiter: { value: 'Generous', description: 'A slightly bigger meal won\'t hurt; portion up the joy.' },
    Saturn: { value: 'Disciplined', description: 'Routine over novelty. Bedtime by ten.' },
  },
  energy: {
    Sun: { value: '82 / 100', description: 'A bright crescendo of vitality. Spend it on one thing that matters.' },
    Mars: { value: '88 / 100', description: 'Engine running hot — pick a worthy target.' },
    Jupiter: { value: '78 / 100', description: 'Buoyant. The sails catch wind.' },
    Mercury: { value: '70 / 100', description: 'Quick, scattered. Tame the swirl with one list.' },
    Venus: { value: '66 / 100', description: 'Soft and steady. Move slowly through beautiful tasks.' },
    Moon: { value: '55 / 100', description: 'Wavy. Honor the dip; the rise comes by evening.' },
    Saturn: { value: '60 / 100', description: 'Heavy but useful. Each step counts double.' },
  },
};

const SECTION_META: Record<SectionKey, { title: string; icon: IconName; tone: ToneKey }> = {
  love: { title: 'Love', icon: 'heart', tone: 'rose' },
  career: { title: 'Career', icon: 'crown', tone: 'gold' },
  health: { title: 'Health', icon: 'sun', tone: 'mint' },
  energy: { title: 'Energy', icon: 'sparkle', tone: 'blue' },
};

/* -------------------------------------------------------------------------- */
/* Headline + body                                                            */
/* -------------------------------------------------------------------------- */

function headlineFor(t: Transit): string {
  if (HARMONIOUS.includes(t.aspect)) {
    return `${t.transiting} ${ASPECT_VERB[t.aspect]} your ${NATAL_SHORT[t.natal]} — a soft alignment`;
  }
  if (TENSE.includes(t.aspect)) {
    return `${t.transiting} ${ASPECT_VERB[t.aspect]} your ${NATAL_SHORT[t.natal]} — a useful tension`;
  }
  return `${t.transiting} sits with your ${NATAL_SHORT[t.natal]} — a charged conjunction`;
}

function bodyFor(t: Transit): string {
  const polarity = HARMONIOUS.includes(t.aspect)
    ? 'eases'
    : TENSE.includes(t.aspect)
      ? 'tests'
      : 'amplifies';
  return [
    `Today the transiting ${t.transiting} (in ${t.transitingSign}) is ${ASPECT_FEELING[t.aspect]} ${NATAL_LABEL[t.natal]}.`,
    `This ${polarity} themes of ${PLANET_BLURB[t.transiting]} — orb of ${t.orb.toFixed(1)}°, exact tomorrow${t.orb < 1 ? '... in fact, near-perfect right now' : ''}.`,
    HARMONIOUS.includes(t.aspect)
      ? 'Lean in. Doors that look small may swing wide.'
      : TENSE.includes(t.aspect)
        ? 'Don\'t armor up. The friction is showing you where the work is.'
        : 'Sit with the intensity before you act — clarity is on the other side of the surge.',
  ].join(' ');
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function pickStrongestTransit(transits: Transit[]): Transit | null {
  return transits[0] ?? null;
}

function formatDate(d: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function fallbackSection(key: SectionKey): DailyInsightSection {
  const meta = SECTION_META[key];
  return {
    key,
    ...meta,
    value: '—',
    description: 'A quiet day. Hold steady; the cosmos is listening.',
  };
}

function sectionFor(key: SectionKey, primary: Transit, secondary?: Transit): DailyInsightSection {
  const meta = SECTION_META[key];
  // Career prefers Mercury/Sun/Mars/Saturn; Love prefers Venus/Moon. Use the
  // strongest transit whose planet has a tinted blurb for this section, with
  // a fallback to the strongest overall.
  const table = SECTIONS[key];
  const candidate = [primary, secondary].find((t) => t && table[t.transiting]) ?? primary;
  const shade = table[candidate.transiting];
  if (!shade) return fallbackSection(key);
  return { key, ...meta, value: shade.value, description: shade.description };
}

/**
 * Synthesize the day's reading. If the chart yields no in-orb transits
 * (rare — usually 5+ are active), returns a calm "still skies" reading.
 */
export function synthesizeDailyInsight(
  birth: BirthInput,
  when: Date = new Date(),
): DailyInsight {
  const chart = computeNatalChart(birth);
  const transits = computeTransits(chart, when);
  const primary = pickStrongestTransit(transits);
  const dateLabel = formatDate(when);

  if (!primary) {
    return {
      date: dateLabel,
      zodiac: chart.sun.sign,
      zodiacGlyph: ZODIAC_GLYPHS[chart.sun.sign] ?? '✦',
      headline: 'Still skies overhead',
      body: 'No major transits are touching your chart today. The cosmos is giving you breathing room — use it. Rest, write, plan.',
      sections: (['love', 'career', 'health', 'energy'] as SectionKey[]).map(fallbackSection),
      source: { transit: primary as unknown as Transit, chart },
    };
  }

  const secondary = transits[1];

  return {
    date: dateLabel,
    zodiac: chart.sun.sign,
    zodiacGlyph: ZODIAC_GLYPHS[chart.sun.sign] ?? '✦',
    headline: headlineFor(primary),
    body: bodyFor(primary),
    sections: (['love', 'career', 'health', 'energy'] as SectionKey[]).map((k) =>
      sectionFor(k, primary, secondary),
    ),
    source: { transit: primary, chart },
  };
}

/**
 * One-line summary for push notifications. Short enough to fit in a banner
 * without truncation on iOS/Android, but specific enough to feel personal.
 */
export function notificationBlurbFor(insight: DailyInsight): string {
  if (!insight.source?.transit) {
    return insight.headline;
  }
  const t = insight.source.transit;
  return `${t.transiting} ${ASPECT_VERB[t.aspect]} your ${NATAL_SHORT[t.natal]} today — tap to read.`;
}
