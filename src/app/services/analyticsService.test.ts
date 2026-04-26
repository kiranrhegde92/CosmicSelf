import { analytics, Events } from './analyticsService';

describe('analyticsService', () => {
  it('routes track() to all registered adapters', () => {
    const a = jest.fn();
    const b = jest.fn();
    analytics.use({ track: a }, { track: b });
    analytics.track(Events.ChatMessageSent, { astrologer: 'veda' });
    expect(a).toHaveBeenCalledWith('chat_message_sent', { astrologer: 'veda' });
    expect(b).toHaveBeenCalledWith('chat_message_sent', { astrologer: 'veda' });
  });

  it('routes screen() and identify() the same way', () => {
    const screen = jest.fn();
    const identify = jest.fn();
    analytics.use({ screen, identify });
    analytics.screen('Home', { greeting: 'morning' });
    analytics.identify('uid_123', { email: 'seeker@cosmic.app' });
    expect(screen).toHaveBeenCalledWith('Home', { greeting: 'morning' });
    expect(identify).toHaveBeenCalledWith('uid_123', { email: 'seeker@cosmic.app' });
  });

  it('falls back to the console adapter when use() is called with no args', () => {
    // Just ensure it doesn't throw.
    analytics.use();
    expect(() => analytics.track(Events.AppOpened)).not.toThrow();
  });
});
