const replies = [
  'The stars are listening. Let me consult the cosmic wheel...',
  'Mars and Venus are weaving a path for you. Trust your timing.',
  'The moon suggests rest before action. Pause for two breaths.',
  'Your seventh house is illuminated. A meaningful conversation is near.',
  'Saturn rewards patience. Hold steady — the gate opens within seven days.',
];

export const aiChatService = {
  async send(_message: string, astrologerId?: string): Promise<string> {
    await new Promise((res) => setTimeout(res, 900 + Math.random() * 800));
    const idx = Math.floor(Math.random() * replies.length);
    const prefix =
      astrologerId === 'aria'
        ? 'Ooh, the cards are spilling — '
        : astrologerId === 'orion'
          ? 'Synthesizing... '
          : '';
    return `${prefix}${replies[idx]}`;
  },
};
