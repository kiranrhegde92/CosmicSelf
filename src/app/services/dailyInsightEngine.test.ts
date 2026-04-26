import { computeNatalChart, computeTransits } from './astroEngine';
import {
  notificationBlurbFor,
  pickStrongestTransit,
  synthesizeDailyInsight,
} from './dailyInsightEngine';

const SEED_BIRTH = {
  isoLocal: '1995-05-20T08:30:00',
  lat: 19.07,
  lon: 72.87,
  tzOffsetMinutes: 330,
};

describe('astroEngine.computeTransits', () => {
  it('finds at least one in-orb aspect on a typical day', () => {
    const chart = computeNatalChart(SEED_BIRTH);
    const transits = computeTransits(chart, new Date('2026-04-26T12:00:00Z'));
    expect(transits.length).toBeGreaterThan(0);
    for (const t of transits) {
      expect(t.orb).toBeGreaterThanOrEqual(0);
      expect(t.orb).toBeLessThanOrEqual(6.01);
      expect(t.strength).toBeGreaterThan(0);
    }
  });

  it('returns transits sorted by strength descending', () => {
    const chart = computeNatalChart(SEED_BIRTH);
    const transits = computeTransits(chart, new Date('2026-04-26T12:00:00Z'));
    for (let i = 1; i < transits.length; i += 1) {
      expect(transits[i - 1].strength).toBeGreaterThanOrEqual(transits[i].strength);
    }
  });

  it('reports a recognized sign for the transiting planet', () => {
    const chart = computeNatalChart(SEED_BIRTH);
    const transits = computeTransits(chart, new Date('2026-04-26T12:00:00Z'));
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
    ];
    for (const t of transits) {
      expect(signs).toContain(t.transitingSign);
    }
  });
});

describe('synthesizeDailyInsight', () => {
  const insight = synthesizeDailyInsight(SEED_BIRTH, new Date('2026-04-26T12:00:00Z'));

  it('produces all four sections', () => {
    expect(insight.sections.map((s) => s.key).sort()).toEqual(
      ['career', 'energy', 'health', 'love'].sort(),
    );
  });

  it('has a non-empty headline + body', () => {
    expect(insight.headline.length).toBeGreaterThan(0);
    expect(insight.body.length).toBeGreaterThan(0);
  });

  it('emits the user\'s sun sign and glyph', () => {
    expect(insight.zodiac.length).toBeGreaterThan(0);
    expect(insight.zodiacGlyph.length).toBeGreaterThan(0);
  });

  it('formats a notification blurb that mentions the source planet', () => {
    const blurb = notificationBlurbFor(insight);
    if (insight.source?.transit) {
      expect(blurb).toMatch(insight.source.transit.transiting);
    }
  });
});

describe('pickStrongestTransit', () => {
  it('returns null on empty input', () => {
    expect(pickStrongestTransit([])).toBeNull();
  });
});
