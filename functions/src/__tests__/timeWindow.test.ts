import { currentLocalHour } from '../lib/timeWindow';

describe('currentLocalHour', () => {
  it('returns the UTC hour when offset is 0', () => {
    const at = new Date('2026-04-26T13:00:00Z');
    expect(currentLocalHour(0, at)).toBe(13);
  });

  it('shifts forward for east-of-UTC offsets', () => {
    // Tokyo is UTC+9 → 540 minutes east. 13:00 UTC = 22:00 local.
    const at = new Date('2026-04-26T13:00:00Z');
    expect(currentLocalHour(540, at)).toBe(22);
  });

  it('shifts backward for west-of-UTC offsets', () => {
    // US Eastern Standard is UTC-5 → -300 minutes. 13:00 UTC = 8:00 local.
    const at = new Date('2026-04-26T13:00:00Z');
    expect(currentLocalHour(-300, at)).toBe(8);
  });

  it('wraps over midnight in both directions', () => {
    // Samoa is UTC+13. 12:00 UTC = 01:00 next day local.
    const lateUtc = new Date('2026-04-26T12:00:00Z');
    expect(currentLocalHour(13 * 60, lateUtc)).toBe(1);

    // Hawaii is UTC-10. 02:00 UTC = 16:00 prev day local.
    const earlyUtc = new Date('2026-04-26T02:00:00Z');
    expect(currentLocalHour(-10 * 60, earlyUtc)).toBe(16);
  });

  it('handles fractional half-hour zones (India = UTC+5:30)', () => {
    // 12:00 UTC + 5:30 = 17:30 local → hour 17.
    const at = new Date('2026-04-26T12:00:00Z');
    expect(currentLocalHour(330, at)).toBe(17);
  });
});
