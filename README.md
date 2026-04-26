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

CosmicSelf uses **Firebase** end-to-end:
- **Firebase Auth** for email/password sign-in
- **Firestore** for chat history and saved insights
- **Cloud Functions** as the Anthropic proxy (key never ships in the app)

The app is wired with graceful fallbacks — without any env vars it still
launches and every screen still works on curated mock data.

### 1. Set up your Firebase project

```bash
# One-time
npm install -g firebase-tools
firebase login
firebase use --add        # pick your Firebase project, alias as 'default'
```

In the Firebase Console:
- **Authentication → Sign-in method:** enable Email/Password
- **Firestore Database:** create (Native mode, any region)

### 2. Drop the web SDK config into `.env`

Copy `.env.example` → `.env` and fill in the values from
**Firebase Console → Project Settings → "Your apps" → SDK setup**:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_REGION=us-central1
```

> Firebase web config is public by design — security comes from
> Firestore Rules + Auth rules, not from hiding these values.

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

The rules in `firestore.rules` enforce per-user access and lock down chat
transcripts as immutable.

### 4. Deploy the Anthropic proxy (Cloud Functions)

```bash
# Set your Anthropic key as a Functions secret (never goes in git):
firebase functions:secrets:set ANTHROPIC_API_KEY

# Build and deploy:
cd functions && npm install && cd ..
firebase deploy --only functions
```

The deployed callable function `astrologerChat`:
- Requires the user to be signed in (`request.auth`)
- Validates message length, history shape, model allowlist
- Holds the Anthropic key as a Functions secret
- Returns `{ reply, usage }`

The client (`aiChatService`) automatically calls it when Firebase env vars
are present. **For local iteration without redeploying Functions**, set
`EXPO_PUBLIC_ANTHROPIC_API_KEY` and the client will hit Anthropic directly
(dev-only path).

### 5. Optional — RevenueCat

```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
```

Requires `npx expo install react-native-purchases` and a custom dev build
(`eas build --profile development`).

### Repo layout for backend code

```
firebase.json            # firestore + functions deploy config
firestore.rules          # per-user access; transcripts are append-only
firestore.indexes.json   # (empty for now)
functions/
├── src/index.ts         # astrologerChat callable function
├── package.json
└── tsconfig.json
```

### What's implemented in the app

- **Auth (`authService`)** — Firebase email/password sign-up and sign-in,
  with `restoreSession` waiting for the first `onAuthStateChanged` tick.
  `useSessionSync` keeps the local Zustand store in lockstep.
- **Birth chart (`astroEngine`)** — pure-JS Sun / Moon / Ascendant /
  dominant-planet calculator using `astronomy-engine` + the Meeus
  ascendant formula. Inputs come from the persisted onboarding store
  (date + time + lat/lon + tz offset).
- **Geocoding (`geocodingService`)** — debounced city search against
  Open-Meteo (no API key). Populates the onboarding store with real
  coordinates and timezone.
- **Date picker** — native `DateTimePicker` (spinner on iOS, modal on
  Android), clamped to 1900..today, emitting ISO `YYYY-MM-DD`.
- **AI chat (`aiChatService`)** — Claude (default `claude-haiku-4-5`)
  via the `astrologerChat` Cloud Function (production path) or directly
  via the Anthropic SDK (dev path). Falls back to curated replies with
  no backend.
- **Chat history (`chatRepository`)** — every message is persisted under
  `users/{uid}/threads/{astrologerId}/messages/`. Loads on screen mount,
  appends fire-and-forget on send. Switching astrologers swaps threads.
- **Daily horoscope** — `notificationsService.scheduleDailyHoroscope()`
  schedules a recurring local notification at 8:00 AM. Settings toggle
  drives it; bootstrap hook re-schedules on app start.
- **Subscriptions** — `paymentService` is feature-flagged. With keys + a
  custom dev build, `react-native-purchases` loads lazily; without them,
  the screen mocks success.

### EAS

`eas.json` ships with three profiles: `development` (dev client),
`preview` (internal install: APK on Android, simulator IPA on iOS),
`production` (auto-incrementing version). Trigger a cloud build with
`eas build --profile <name> --platform ios|android`.

## License

Internal demo for the CosmicSelf product. Not for redistribution.
