export const dailyInsight = {
  date: 'Saturday, 26 April',
  zodiac: 'Leo',
  zodiacGlyph: '♌',
  headline: 'A radiant day for bold decisions',
  body: "Today the sun energizes your fifth house, casting golden light on your creative ambitions. Trust your inner monarch — small acts of leadership today will ripple far. Mercury softens your tongue; speak gently and you will be heard.",
  sections: [
    {
      key: 'love',
      title: 'Love',
      icon: 'heart' as const,
      tone: 'rose' as const,
      value: 'Tender',
      description: 'A warm conversation rekindles a quiet bond. Listen more than you speak.',
    },
    {
      key: 'career',
      title: 'Career',
      icon: 'crown' as const,
      tone: 'gold' as const,
      value: 'Magnetic',
      description: 'Your ideas attract the right ears. Volunteer one bold suggestion.',
    },
    {
      key: 'health',
      title: 'Health',
      icon: 'sun' as const,
      tone: 'mint' as const,
      value: 'Recharging',
      description: 'Stretch, hydrate, and step into morning light. Your spine craves the sun.',
    },
    {
      key: 'energy',
      title: 'Energy',
      icon: 'sparkle' as const,
      tone: 'blue' as const,
      value: '78 / 100',
      description: 'A waxing crescent of vitality. Channel it into one focused project.',
    },
  ],
};

export const compatibility = {
  partnerA: { sign: 'Leo', glyph: '♌', label: 'You' },
  partnerB: { sign: 'Aquarius', glyph: '♒', label: 'Them' },
  score: 82,
  label: 'Strong Alignment',
  cards: [
    {
      key: 'emotional',
      title: 'Emotional Bond',
      icon: 'heart' as const,
      tone: 'rose' as const,
      value: '88%',
      description: 'Your inner worlds resonate. Vulnerability deepens trust.',
    },
    {
      key: 'communication',
      title: 'Communication',
      icon: 'chat' as const,
      tone: 'blue' as const,
      value: '74%',
      description: 'Different rhythms. Slow conversation builds clarity.',
    },
    {
      key: 'longterm',
      title: 'Long-Term Potential',
      icon: 'star' as const,
      tone: 'gold' as const,
      value: '85%',
      description: 'Shared ideals and aligned values. A steady upward arc.',
    },
    {
      key: 'challenges',
      title: 'Challenges',
      icon: 'shield' as const,
      tone: 'mint' as const,
      value: 'Manageable',
      description: 'Stubborn streaks on both sides. Practice yielding gently.',
    },
  ],
};

export const birthChart = {
  sun: { name: 'Sun in Leo', glyph: '☉', detail: 'Confident, expressive, warm-hearted.' },
  moon: { name: 'Moon in Cancer', glyph: '☽', detail: 'Intuitive, nurturing, deeply emotional.' },
  ascendant: { name: 'Scorpio Rising', glyph: '↑', detail: 'Magnetic presence, intense gaze.' },
  dominant: { name: 'Mars Dominant', glyph: '♂', detail: 'Driven, courageous, action-oriented.' },
};

export const homeQuickActions: {
  key: string;
  label: string;
  description: string;
  icon: import('../components/ui/CosmicIcon').IconName;
  tone: 'gold' | 'rose' | 'mint' | 'blue' | 'purple';
}[] = [
  {
    key: 'daily',
    label: 'Daily Insight',
    description: 'See beyond',
    icon: 'sparkle',
    tone: 'gold',
  },
  {
    key: 'chat',
    label: 'AI Chat',
    description: 'Guidance & insight',
    icon: 'chat',
    tone: 'purple',
  },
  {
    key: 'chart',
    label: 'Birth Chart',
    description: 'Reveal your map',
    icon: 'chart',
    tone: 'gold',
  },
  {
    key: 'compatibility',
    label: 'Compatibility',
    description: 'Yes or no answers',
    icon: 'heart',
    tone: 'rose',
  },
  {
    key: 'video',
    label: 'Video Call',
    description: 'Self discovery',
    icon: 'video',
    tone: 'blue',
  },
  {
    key: 'rituals',
    label: 'Celestial Calendar',
    description: 'Plans with the cosmos',
    icon: 'calendar',
    tone: 'mint',
  },
];

export const sampleMessages: { id: string; from: 'user' | 'ai'; text: string }[] = [
  { id: 'm1', from: 'ai', text: 'Greetings, seeker. I sense Saturn weighing on your week. What is on your mind?' },
  { id: 'm2', from: 'user', text: 'I feel stuck in my career. Is this a good month for a big change?' },
  { id: 'm3', from: 'ai', text: 'The 10th house is illuminated by Jupiter on the 18th. A powerful window for new offers — but pause before signing anything before that day.' },
  { id: 'm4', from: 'user', text: 'What about love?' },
  { id: 'm5', from: 'ai', text: 'Venus enters your 7th house this Saturday. Open conversations carry unusual weight. Speak softly — the universe listens.' },
];
