export type SubscriptionPlan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  features: { label: string; included: boolean }[];
  recommended?: boolean;
  ctaLabel: string;
  iconKey: 'free' | 'pro' | 'master';
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Explore the basics',
    price: '₹0',
    cadence: 'Forever',
    iconKey: 'free',
    ctaLabel: 'Current Plan',
    features: [
      { label: 'Daily Horoscope', included: true },
      { label: 'AI Chat (Limited)', included: true },
      { label: 'Video Call', included: false },
      { label: 'Compatibility', included: false },
      { label: 'Detailed Reports', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Seeker',
    tagline: 'For the curious soul',
    price: '₹699',
    cadence: 'Billed monthly',
    iconKey: 'pro',
    recommended: true,
    ctaLabel: 'Continue',
    features: [
      { label: 'Daily Predictions', included: true },
      { label: 'AI Chat (Unlimited)', included: true },
      { label: 'Weekly Video Call', included: true },
      { label: 'Compatibility Reports', included: true },
      { label: 'Detailed Reports', included: true },
      { label: 'Priority Support', included: true },
    ],
  },
  {
    id: 'master',
    name: 'Cosmic Master',
    tagline: 'For the cosmic seeker',
    price: '₹1499',
    cadence: 'Billed monthly',
    iconKey: 'master',
    ctaLabel: 'Select Plan',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Unlimited Video Call', included: true },
      { label: 'In-depth Birth Chart', included: true },
      { label: 'Advanced Compatibility', included: true },
      { label: 'Custom Rituals', included: true },
      { label: '1:1 Expert Sessions', included: true },
      { label: 'Priority Support', included: true },
    ],
  },
];
