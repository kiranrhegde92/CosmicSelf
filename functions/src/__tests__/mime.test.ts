import { ALLOWED_AUDIO_MIME, MAX_AUDIO_BYTES, extForMime } from '../lib/mime';

describe('extForMime', () => {
  it('maps every allowed mime to a sensible extension', () => {
    const cases: Array<[string, string]> = [
      ['audio/m4a', 'm4a'],
      ['audio/mp4', 'm4a'],
      ['audio/x-m4a', 'm4a'],
      ['audio/mpeg', 'mp3'],
      ['audio/mp3', 'mp3'],
      ['audio/wav', 'wav'],
      ['audio/x-wav', 'wav'],
      ['audio/webm', 'webm'],
      ['audio/ogg', 'ogg'],
    ];
    for (const [mime, ext] of cases) {
      expect(extForMime(mime)).toBe(ext);
    }
  });

  it('falls back to bin for unknown mimes', () => {
    expect(extForMime('application/octet-stream')).toBe('bin');
    expect(extForMime('')).toBe('bin');
  });
});

describe('ALLOWED_AUDIO_MIME', () => {
  it('contains every mime extForMime knows about', () => {
    for (const mime of ALLOWED_AUDIO_MIME) {
      expect(extForMime(mime)).not.toBe('bin');
    }
  });
});

describe('MAX_AUDIO_BYTES', () => {
  it('is 8 MiB', () => {
    expect(MAX_AUDIO_BYTES).toBe(8 * 1024 * 1024);
  });
});
