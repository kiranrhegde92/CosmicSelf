import { AstrologerVisualKey } from '../components/astrologer/AstrologerAvatar';

export type AstrologerTone = 'gold' | 'purple' | 'rose' | 'blue' | 'mint';

export type Astrologer = {
  id: string;
  name: string;
  specialty: string;
  personalityTag: string;
  description: string;
  tone: AstrologerTone;
  visualKey: AstrologerVisualKey;
  greeting: string;
};

export const ASTROLOGERS: Astrologer[] = [
  {
    id: 'veda',
    name: 'Acharya Veda',
    specialty: 'Vedic Astrology',
    personalityTag: 'Wise · Traditional',
    description:
      'Ancient Vedic wisdom passed down through millennia. Acharya Veda reads your dasha and nakshatra with calm precision.',
    tone: 'gold',
    visualKey: 'veda',
    greeting: 'Namaste, seeker. The stars whisper of your journey today.',
  },
  {
    id: 'luna',
    name: 'Luna Sage',
    specialty: 'Western Astrology',
    personalityTag: 'Intuitive · Empathic',
    description:
      'A modern mystic guided by the moon. Luna interprets your sun, moon and rising signs with poetic clarity.',
    tone: 'purple',
    visualKey: 'luna',
    greeting: 'I sense the tides of your inner moon. Tell me what stirs you.',
  },
  {
    id: 'chen',
    name: 'Master Chen',
    specialty: 'Feng Shui & Bazi',
    personalityTag: 'Balanced · Insightful',
    description:
      'Master of the Chinese cosmic compass. Master Chen aligns the five elements in your favour.',
    tone: 'mint',
    visualKey: 'chen',
    greeting: 'Welcome. Let us harmonize your chi with the heavens.',
  },
  {
    id: 'aria',
    name: 'Aria Cosmos',
    specialty: 'Tarot & Cosmic Guidance',
    personalityTag: 'Modern · Playful',
    description:
      'Tarot meets starlight. Aria pulls cards from the cosmic deck and translates them with witty modern flair.',
    tone: 'rose',
    visualKey: 'aria',
    greeting: "Hey star! Let's pull a card and see what the universe is up to.",
  },
  {
    id: 'stella',
    name: 'Grandma Stella',
    specialty: 'Astro Comfort & Healing',
    personalityTag: 'Warm · Nurturing',
    description:
      'A gentle grandmother of the stars. Stella offers soothing emotional guidance and motherly wisdom.',
    tone: 'rose',
    visualKey: 'stella',
    greeting: 'Come closer dear. Let Grandma read the stars for you.',
  },
  {
    id: 'orion',
    name: 'Orion AI',
    specialty: 'Cosmic Intelligence',
    personalityTag: 'Futuristic · Infinite',
    description:
      'A constellation of pure cosmic intelligence. Orion synthesizes all astrological systems instantly.',
    tone: 'blue',
    visualKey: 'orion',
    greeting: 'Greetings. I have aligned your data across all astrological models.',
  },
];
