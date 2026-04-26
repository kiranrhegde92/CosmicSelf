# Assets

This folder is reserved for binary assets that aren't checked into the SVG-based
component library. Drop replacements here as the brand kit lands:

```
src/app/assets/
├── images/
│   ├── astrologers/        # 6 final character portraits (PNG, 800×800)
│   ├── icon.png            # 1024×1024 app icon
│   ├── adaptive-icon.png   # Android adaptive icon foreground
│   ├── splash.png          # Splash image (legacy)
│   └── og-card.png
├── fonts/
│   ├── PlayfairDisplay-Regular.ttf
│   ├── PlayfairDisplay-Bold.ttf
│   ├── Inter-Regular.ttf
│   └── Inter-SemiBold.ttf
└── animations/             # Lottie/Skia files if you go down that path
```

## Loading custom fonts

Once font files are in place, in `App.tsx` wrap the navigator in `useFonts`:

```ts
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

const [ready, setReady] = useState(false);
useEffect(() => {
  Font.loadAsync({
    'PlayfairDisplay-Regular': require('./src/app/assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Bold':    require('./src/app/assets/fonts/PlayfairDisplay-Bold.ttf'),
    'Inter-Regular':           require('./src/app/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold':          require('./src/app/assets/fonts/Inter-SemiBold.ttf'),
  }).finally(() => setReady(true));
}, []);
if (!ready) return <SplashView animate={false} />;
```

Then update `src/app/theme/typography.ts` to use the loaded family names.

## Replacing astrologer art

The current `AstrologerAvatar` component is pure-SVG. To swap in real artwork:

1. Drop PNG portraits into `assets/images/astrologers/<id>.png`
2. Add an `image` field on each entry in `src/app/data/astrologers.ts`
3. Render `<Image source={astrologer.image} />` inside `AstrologerAvatar`
   instead of the SVG layers (gate behind a feature flag if you want to A/B).
