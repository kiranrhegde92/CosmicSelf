# Brand Assets

Two folders here:

```
assets/
├── source/           # SVG source — version-controlled, hand-edited
│   ├── icon.svg            (1024x1024 iOS/web app icon)
│   ├── icon-foreground.svg (1024x1024 Android adaptive-icon foreground)
│   └── splash.svg          (1284x2778 Expo splash)
└── images/           # Rendered PNGs — referenced by app.json
    ├── icon.png
    ├── adaptive-icon.png
    └── splash.png
```

## Re-rendering after a tweak

```bash
npm run build:assets
```

The script (`scripts/build-assets.js`) runs each SVG through `sharp` at 384 DPI
and writes the PNG into `assets/images/`. Idempotent — commit both the SVG and
the resulting PNG.

## Icon design rules (the ones the SVG sources already follow)

- **iOS app icon**: full bleed, opaque background, no system rounded corners
  (iOS applies them).
- **Android adaptive icon foreground**: transparent background; keep all art
  inside the inner 66% safe zone (the `scale(0.78)` group in
  `icon-foreground.svg`). The system supplies the background color from
  `app.json`.
- **Splash**: focal element (zodiac wheel) sits dead-center vertically. The
  outer 200-300px on each axis can crop on shorter devices.

## Replacing astrologer art

The current `AstrologerAvatar` component is pure-SVG. To swap in real
artwork:

1. Drop PNG portraits into `assets/images/astrologers/<id>.png`
2. Add an `image` field on each entry in `src/app/data/astrologers.ts`
3. Render `<Image source={astrologer.image} />` inside `AstrologerAvatar`
   instead of the SVG layers.

## Custom fonts

Custom fonts ship via `@expo-google-fonts/playfair-display` and
`@expo-google-fonts/inter` — TTF files are bundled inside the npm packages,
so this folder doesn't need a `fonts/` subdirectory.

`useBrandFonts()` (`src/app/theme/useBrandFonts.ts`) loads them; `App.tsx`
holds the splash until the hook resolves.
