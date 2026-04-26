import {
  ALLOWED_MODELS,
  DEFAULT_MODEL,
  clamp,
  sanitizeHistory,
  validateChatPayload,
} from '../lib/validate';

describe('clamp', () => {
  it('clamps below the floor', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it('clamps above the ceiling', () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
  it('passes through in-range values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('handles equal bounds', () => {
    expect(clamp(7, 5, 5)).toBe(5);
  });
});

describe('sanitizeHistory', () => {
  it('returns [] for non-array input', () => {
    expect(sanitizeHistory(null)).toEqual([]);
    expect(sanitizeHistory({})).toEqual([]);
    expect(sanitizeHistory('hello')).toEqual([]);
  });

  it('drops items missing a valid role', () => {
    const out = sanitizeHistory([
      { role: 'system', content: 'should drop' },
      { role: 'user', content: 'keep' },
      { role: 'assistant', content: 'keep too' },
    ]);
    expect(out).toEqual([
      { role: 'user', content: 'keep' },
      { role: 'assistant', content: 'keep too' },
    ]);
  });

  it('drops items with non-string content', () => {
    const out = sanitizeHistory([
      { role: 'user', content: 123 },
      { role: 'user', content: 'good' },
    ]);
    expect(out).toEqual([{ role: 'user', content: 'good' }]);
  });

  it('truncates each message to 4000 chars', () => {
    const long = 'x'.repeat(5000);
    const out = sanitizeHistory([{ role: 'user', content: long }]);
    expect(out[0].content.length).toBe(4000);
  });

  it('keeps only the last 20 turns', () => {
    const turns = Array.from({ length: 30 }, (_, i) => ({
      role: 'user' as const,
      content: `m${i}`,
    }));
    const out = sanitizeHistory(turns);
    expect(out.length).toBe(20);
    expect(out[0].content).toBe('m10');
    expect(out[19].content).toBe('m29');
  });
});

describe('validateChatPayload', () => {
  it('rejects empty messages', () => {
    expect(() => validateChatPayload({ message: '   ' })).toThrow(
      /message is required/i,
    );
  });

  it('rejects messages over 4000 chars', () => {
    expect(() =>
      validateChatPayload({ message: 'x'.repeat(4001) }),
    ).toThrow(/too long/i);
  });

  it('falls back to the default model on unknown values', () => {
    const out = validateChatPayload({ message: 'hi', model: 'gpt-9000' });
    expect(out.model).toBe(DEFAULT_MODEL);
  });

  it('keeps allowed models intact', () => {
    for (const model of ALLOWED_MODELS) {
      const out = validateChatPayload({ message: 'hi', model });
      expect(out.model).toBe(model);
    }
  });

  it('clamps maxTokens into [64, 1024]', () => {
    expect(validateChatPayload({ message: 'hi', maxTokens: 1 }).maxTokens).toBe(64);
    expect(validateChatPayload({ message: 'hi', maxTokens: 9999 }).maxTokens).toBe(1024);
    expect(validateChatPayload({ message: 'hi', maxTokens: 256 }).maxTokens).toBe(256);
  });

  it('truncates a long systemPrompt to 8000 chars', () => {
    const out = validateChatPayload({
      message: 'hi',
      systemPrompt: 'y'.repeat(10000),
    });
    expect(out.systemPrompt.length).toBe(8000);
  });

  it('passes history through sanitizeHistory', () => {
    const out = validateChatPayload({
      message: 'hi',
      history: [
        { role: 'user', content: 'a' },
        { role: 'system', content: 'drop' },
      ],
    });
    expect(out.history).toEqual([{ role: 'user', content: 'a' }]);
  });
});
