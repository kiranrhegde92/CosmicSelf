import { computeNatalChart, ZODIAC_SIGNS } from './astroEngine';

describe('astroEngine.computeNatalChart', () => {
  it('places the Sun in Taurus for a 1995-05-20 birth', () => {
    const chart = computeNatalChart({
      isoLocal: '1995-05-20T08:30:00',
      lat: 19.07, // Mumbai
      lon: 72.87,
      tzOffsetMinutes: 330,
    });
    expect(chart.sun.sign).toBe('Taurus');
    expect(chart.sun.degree).toBeGreaterThanOrEqual(0);
    expect(chart.sun.degree).toBeLessThan(30);
    expect(chart.sun.longitude).toBeGreaterThanOrEqual(30); // Taurus = 30..60
    expect(chart.sun.longitude).toBeLessThan(60);
  });

  it('returns recognized signs for Sun, Moon, Ascendant, and Dominant', () => {
    const chart = computeNatalChart({
      isoLocal: '2000-01-01T12:00:00',
      lat: 0,
      lon: 0,
      tzOffsetMinutes: 0,
    });
    for (const placement of [chart.sun, chart.moon, chart.ascendant]) {
      expect(ZODIAC_SIGNS).toContain(placement.sign as (typeof ZODIAC_SIGNS)[number]);
      expect(placement.glyph).toMatch(/[♈♉♊♋♌♍♎♏♐♑♒♓]/);
    }
    expect(typeof chart.dominant.name).toBe('string');
    expect(chart.dominant.name.length).toBeGreaterThan(0);
  });

  it('moves the Sun to the next sign across an ingress', () => {
    // March 19 should be Pisces; March 22 should be Aries (post-ingress).
    const before = computeNatalChart({
      isoLocal: '2000-03-19T12:00:00',
      lat: 0,
      lon: 0,
      tzOffsetMinutes: 0,
    });
    const after = computeNatalChart({
      isoLocal: '2000-03-22T12:00:00',
      lat: 0,
      lon: 0,
      tzOffsetMinutes: 0,
    });
    expect(before.sun.sign).toBe('Pisces');
    expect(after.sun.sign).toBe('Aries');
  });
});
