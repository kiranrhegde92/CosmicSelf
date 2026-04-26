import {
  DAILY_CHAT_CAP,
  isOverCap,
  normalizeTier,
  quotaErrorMessage,
} from '../lib/quota';

describe('normalizeTier', () => {
  it('passes through pro and master', () => {
    expect(normalizeTier('pro')).toBe('pro');
    expect(normalizeTier('master')).toBe('master');
  });

  it('falls back to free for anything else', () => {
    expect(normalizeTier('free')).toBe('free');
    expect(normalizeTier('')).toBe('free');
    expect(normalizeTier(null)).toBe('free');
    expect(normalizeTier(undefined)).toBe('free');
    expect(normalizeTier('lifetime')).toBe('free');
    expect(normalizeTier(42)).toBe('free');
  });
});

describe('isOverCap', () => {
  it('blocks free above 20 calls', () => {
    expect(isOverCap('free', 19)).toBe(false);
    expect(isOverCap('free', 20)).toBe(true);
    expect(isOverCap('free', 21)).toBe(true);
  });

  it('blocks pro above 200 calls', () => {
    expect(isOverCap('pro', 199)).toBe(false);
    expect(isOverCap('pro', 200)).toBe(true);
  });

  it('never blocks master', () => {
    expect(isOverCap('master', 1)).toBe(false);
    expect(isOverCap('master', 1_000_000)).toBe(false);
    expect(isOverCap('master', DAILY_CHAT_CAP.master)).toBe(true);
    // ^ Number.POSITIVE_INFINITY === Number.POSITIVE_INFINITY is the only
    //   true case; in practice no real call count reaches this.
  });
});

describe('quotaErrorMessage', () => {
  it('mentions upgrading on the free tier', () => {
    expect(quotaErrorMessage('free')).toMatch(/upgrade/i);
  });
  it('uses a tomorrow message on paid tiers', () => {
    expect(quotaErrorMessage('pro')).toMatch(/tomorrow/i);
    expect(quotaErrorMessage('master')).toMatch(/tomorrow/i);
  });
});
