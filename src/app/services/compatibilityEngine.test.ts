import { computeNatalChart, computeSynastry } from './astroEngine';
import { synthesizeCompatibility } from './compatibilityEngine';

const MUMBAI = {
  isoLocal: '1995-05-20T08:30:00',
  lat: 19.07,
  lon: 72.87,
  tzOffsetMinutes: 330,
};

const NYC = {
  isoLocal: '1992-09-11T16:45:00',
  lat: 40.71,
  lon: -74.01,
  tzOffsetMinutes: -240,
};

describe('computeSynastry', () => {
  const a = computeNatalChart(MUMBAI);
  const b = computeNatalChart(NYC);
  const result = computeSynastry(a, b);

  it('returns a clamped score between 20 and 95', () => {
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.score).toBeLessThanOrEqual(95);
  });

  it('finds at least one inter-chart aspect', () => {
    expect(result.aspects.length).toBeGreaterThan(0);
  });

  it('aspects are sorted by absolute strength descending', () => {
    for (let i = 1; i < result.aspects.length; i += 1) {
      expect(Math.abs(result.aspects[i - 1].signedStrength)).toBeGreaterThanOrEqual(
        Math.abs(result.aspects[i].signedStrength),
      );
    }
  });

  it('is symmetric (swapping A and B yields the same score)', () => {
    const swapped = computeSynastry(b, a);
    expect(swapped.score).toBe(result.score);
  });
});

describe('synthesizeCompatibility', () => {
  const report = synthesizeCompatibility(MUMBAI, NYC, 'You', 'Partner');

  it('returns four cards with the expected keys', () => {
    expect(report.cards.map((c) => c.key).sort()).toEqual(
      ['challenges', 'communication', 'emotional', 'longterm'].sort(),
    );
  });

  it('emits a non-empty score label', () => {
    expect(report.label.length).toBeGreaterThan(0);
  });

  it('uses provided partner labels', () => {
    expect(report.partnerA.label).toBe('You');
    expect(report.partnerB.label).toBe('Partner');
  });

  it('returns at most three top aspects', () => {
    expect(report.topAspects.length).toBeLessThanOrEqual(3);
  });
});
