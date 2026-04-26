# CosmicSelf

> *Align with your universe.*

CosmicSelf is a premium AI astrology mobile app — built with **React Native (Expo + TypeScript)**.
Dark cosmic gradients, glowing zodiac wheels, glassmorphic cards, and gold accents
across 14 production-ready screens.

---

## Tech Stack

| Layer            | Library                                    |
| ---------------- | ------------------------------------------ |
| Runtime          | React Native + Expo SDK 51                 |
| Language         | TypeScript (strict)                        |
| Navigation       | React Navigation (Native Stack + Bottom Tabs) |
| State            | Zustand + AsyncStorage persist             |
| Animations       | React Native Reanimated 3                  |
| Gestures         | React Native Gesture Handler               |
| Vectors / SVG    | react-native-svg                           |
| Gradients / Glass| expo-linear-gradient + expo-blur           |
| Auth (optional)  | Supabase                                   |
| AI Chat (optional) | Anthropic Claude (`@anthropic-ai/sdk`)   |
| Astrology engine | `astronomy-engine` (pure JS)               |
| Geocoding        | Open-Meteo (free, no key)                  |
| Date picker      | `@react-native-community/datetimepicker`   |
| Notifications    | `expo-notifications` (local daily horoscope) |
| Subscriptions    | RevenueCat scaffold (`react-native-purchases`) |
| Tests            | Jest + ts-jest                             |
| CI               | GitHub Actions (typecheck + tests)         |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

```bash
# iOS (requires macOS + Xcode)
npm run ios

# Android (requires Android Studio / emulator)
npm run android

# Or open in Expo Go
npm start
```

### 3. Type-check + run tests

```bash
npm run typecheck
npm test
```

---

## Project Structure

```
src/app/
├── components/
│   ├── astrologer/      # AstrologerCard, AstrologerAvatar (SVG), Carousel, PersonaBadge
│   ├── astrology/       # BirthChartPreview, CompatibilityMeter, DailyInsightCard, TimeDialPicker
│   ├── cosmic/          # CosmicBackground, ZodiacWheel, StarParticles, AuraRing
│   └── ui/              # CosmicButton, CosmicInput, GlassCard, ScreenHeader,
│                          StepProgress, BottomNav, ToggleMode, PillBadge, CosmicIcon
├── data/                # Static data (astrologers, plans, mock insights)
├── navigation/          # AuthNavigator, MainNavigator, RootNavigator, routes
├── screens/             # 14 screens (see below)
├── services/            # auth, astrology, aiChat, payment (mocked)
├── store/               # Zustand stores: authStore, onboardingStore, appStore
└── theme/               # colors, typography, spacing, shadows, navigation
```

---

## Screens

| #  | Screen                  | File                              |
| -- | ----------------------- | --------------------------------- |
| 1  | Splash                  | `SplashScreen.tsx`                |
| 2  | Login                   | `LoginScreen.tsx`                 |
| 3  | Signup                  | `SignupScreen.tsx`                |
| 4  | Birth Details (3 steps) | `BirthDetailsScreen.tsx`          |
| 5  | Choose Astrologer       | `AstrologerSelectionScreen.tsx`   |
| 6  | Home Dashboard          | `HomeScreen.tsx`                  |
| 7  | AI Chat                 | `ChatScreen.tsx`                  |
| 8  | AI Video Call           | `VideoCallScreen.tsx`             |
| 9  | Birth Chart             | `BirthChartScreen.tsx`            |
| 10 | Daily Insight           | `DailyInsightScreen.tsx`          |
| 11 | Compatibility           | `CompatibilityScreen.tsx`         |
| 12 | Subscription            | `SubscriptionScreen.tsx`          |
| 13 | Profile                 | `ProfileScreen.tsx`               |
| 14 | Settings                | `SettingsScreen.tsx`              |

### Flow

```
Splash → Login / Signup → Birth Details → Choose Astrologer
       → Home Dashboard
            ↳ AI Chat
            ↳ Video Call
            ↳ Birth Chart
            ↳ Daily Insight
            ↳ Compatibility
            ↳ Subscription
            ↳ Profile → Settings
```

---

## Design System

### Colors
Defined in `src/app/theme/colors.ts`.
- **Backgrounds:** `#080817` → `#11102A` → `#251047` cosmic gradients
- **Accents:** Gold primary `#F6C85F`, gold bright `#FFD98A`
- **Glass:** `rgba(255,255,255,0.08)` surface with `rgba(246,200,95,0.32)` border
- **Status:** `#FF6B6B` error, `#65E6A5` success

### Typography
Serif headings (Didot on iOS, system serif on Android), sans body (`System`).
Sizes: hero 36, title 30, section 20, body 15, caption 12.

### Tokens
- Radii: cards 24, inputs 16, buttons 18, pills 999
- Spacing: 4 / 8 / 12 / 16 / 24 / 32
- Shadows: gold glow, purple glow, deep, card

### Animations
- Splash: zodiac wheel fade + scale + breathing pulse, title fade-up, tagline fade
- Buttons: press scale 1 → 0.97, primary CTA shimmer loop
- Inputs: gold border + glow on focus (interpolated color via Reanimated)
- Birth Details: step transitions slide / fade, completed-step checkmark
- Astrologer cards: selected scales up with golden aura, others scale down
- Home: floating quick-action buttons gently bob, astrologer avatar AuraRing pulse
- Chat: animated bubble fade-in, glowing typing dots
- Video Call: pulsing aura ring, rotating zodiac wheel, animated audio waveform

---

## State (Zustand)

```ts
useAuthStore      // isAuthenticated, user, login(), signup(), logout()
useOnboardingStore // birthDate, birthTime, birthLocation,
                   // selectedAstrologerId, mode ('serious' | 'fun'),
                   // hasOnboarded
useAppStore       // themeMode, activeTab
```

`RootNavigator.tsx` switches between `AuthNavigator` and `MainNavigator`
based on `isAuthenticated && hasOnboarded`.

---

## Reusable Components

All components are typed and prop-driven. Highlights:

- `CosmicBackground` — variants: `default | glass | minimal | chamber`,
  optional zodiac wheel, particles, intensity.
- `CosmicButton` — variants: `primary | secondary | glass | outline | danger`,
  shimmer loop on primary, press-scale animation, loading state.
- `CosmicInput` — animated focus border glow, secure-text toggle, error/help text.
- `GlassCard` — gradient + thin gold border + soft glow.
- `ZodiacWheel` — pure SVG, configurable size, rotate speed, signs, intensity.
- `BirthChartPreview` — SVG circular chart with planets, signs, aspect lines.
- `CompatibilityMeter` — animated SVG ring (Reanimated `useAnimatedProps`).
- `TimeDialPicker` — gesture-driven analogue clock dial with AM/PM toggle.
- `BottomNav` — custom tab bar with glowing active state.
- `AstrologerAvatar` — pure-SVG illustrated portraits for all six astrologers
  (no third-party assets needed).

---

## Mock Data & Services

All services in `src/app/services/` simulate latency with `setTimeout`.
You can swap them for real APIs without touching the UI:

```ts
authService.login(email, password)        // → AuthUser
authService.signup(name, email, password) // → AuthUser
astrologyService.getDailyInsight()        // → mock insight
astrologyService.getBirthChart()          // → mock chart
astrologyService.getCompatibility()       // → mock report
aiChatService.send(message, astrologerId) // → string reply
paymentService.startCheckout(planId)      // → { ok, planId }
```

---

## Accessibility & Performance

- All buttons have `accessibilityLabel` and `accessibilityRole`.
- Touch targets ≥ 44 px.
- Particle counts are tunable per intensity (`low | medium | high`).
- Heavy SVGs (ZodiacWheel, BirthChartPreview) avoid expensive blur stacks
  to stay smooth on low-end Android.
- `KeyboardAvoidingView` on every form-bearing screen.

---

## Replacing Placeholder Assets

Astrologer portraits are generated via `AstrologerAvatar` (SVG).
To swap in real artwork later:

1. Drop images into `src/app/assets/images/astrologers/`
2. Add an `image` field on each `Astrologer` in `src/app/data/astrologers.ts`
3. Render `<Image source={astrologer.image} />` inside `AstrologerAvatar`
   instead of the SVG layers.

---

## Backend integrations

The app is wired to graceful fallbacks: if you don't configure any of the
optional providers below, the relevant feature uses curated mock data — the
app still launches and every screen still works.

Copy `.env.example` to `.env` and fill in the keys you have:

```env
# Supabase auth (email/password). Without these, login/signup accept anything.
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Anthropic chat. Without it, ChatScreen serves curated replies.
EXPO_PUBLIC_ANTHROPIC_API_KEY=
EXPO_PUBLIC_ANTHROPIC_MODEL=claude-haiku-4-5

# RevenueCat. Requires a custom dev build (`react-native-purchases`).
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
```

> **Security:** keys here ship in the bundle. Move the Anthropic key to a
> backend proxy (Cloudflare Worker / Supabase Edge Function / Vercel) before
> a public release. `aiChatService.ts` has the security note inline.

### What's implemented

- **Auth (`authService`)** — Supabase email/password sign-up and sign-in,
  plus `restoreSession` on app boot via `useSessionSync`. Local Zustand
  store stays in sync with `onAuthStateChange`.
- **Birth chart (`astroEngine`)** — pure-JS Sun / Moon / Ascendant /
  dominant-planet calculator using `astronomy-engine` + the Meeus
  ascendant formula. Inputs are taken from the persisted onboarding store
  (date + time + lat/lon + tz offset).
- **Geocoding (`geocodingService`)** — debounced city search against
  Open-Meteo (no API key). The result populates the onboarding store with
  real coordinates and timezone.
- **Date picker** — native `DateTimePicker` (spinner on iOS, modal on
  Android), clamped to 1900..today, emitting ISO `YYYY-MM-DD`.
- **AI chat (`aiChatService`)** — Claude (default `claude-haiku-4-5`) with
  a per-astrologer / per-mode system prompt and the user's natal placements
  woven in. Falls back to curated replies without a key.
- **Daily horoscope** — `notificationsService.scheduleDailyHoroscope()`
  schedules a recurring local notification at 8:00 AM. The Settings toggle
  drives it; the bootstrap hook re-schedules on app start.
- **Subscriptions** — `paymentService` is feature-flagged. With keys + a
  custom dev build, `react-native-purchases` is loaded lazily; without
  them, the screen mocks success.

### EAS

`eas.json` ships with three profiles: `development` (dev client),
`preview` (internal install: APK on Android, simulator IPA on iOS),
`production` (auto-incrementing version). Trigger the relevant cloud
build with `eas build --profile <name> --platform ios|android`.

## License

Internal demo for the CosmicSelf product. Not for redistribution.
