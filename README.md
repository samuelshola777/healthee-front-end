# HEALTHEE — Fresh Market

Complete Next.js + TypeScript frontend based on the selected Fresh Market reference.

## Run locally

Use Node.js 20.9 or newer. Open a terminal inside this folder and run:

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

Check TypeScript with `npm run typecheck`. No environment variables or external services are required. Fonts, images and video are bundled locally. Dependency versions and the lockfile are retained from the existing project.

## Included design

- Cream header, green/orange wordmark, three navigation links and reference utility icons.
- Centred “Good days. Start juicy.” headline, support text and orange Explore juices button.
- Original responsive hero videos with pause/resume, static posters, loading/failure handling and reduced-motion support.
- Five-flavour rounded cream selector and green FIND YOUR FLAVOUR strip.
- Pick your happy section with the three reference cards.
- Curved orange Make room for a juicy moment closing section with fruit corners.
- Mobile layouts, gentle reveals and subtle artwork response to a mouse. Buttons remain stationary; touch and reduced-motion users do not get pointer effects.

The page ends at the closing section shown in the selected image. There are no extra FAQ sections, promotional banners, reviews or added page sections.

## Controls and scope

Explore juices scrolls to the drinks section. Flavour selectors and collection buttons open a product dialog. Search filters the five flavours. The mobile menu, Escape, backdrop close and focus restoration work. Account and basket icons retain the selected appearance and open clear unavailable/empty states. Authentication, orders, checkout and a Java backend are not implemented.

## Project map

| File | Responsibility |
| --- | --- |
| `app/page.tsx` | Page composition and motion helpers |
| `app/layout.tsx` | Metadata, theme colour and global CSS |
| `app/globals.css` | Layout, colours, fonts, breakpoints, cards and dialogs |
| `components/FreshMarket.tsx` | Header, hero copy, flavour selector, cards, closing section and dialogs |
| `components/Icons.tsx` | Arrow, utility and leaf SVGs |
| `components/hero/HeroVideo.tsx` | Responsive video lifecycle and pause control |
| `components/hero/hero.module.css` | Video placement, blending and playback button |
| `components/PointerEffects.tsx` | Fine-pointer artwork movement |
| `components/ScrollEffects.tsx` | One-time section entrances |
| `components/dialog.ts` | Backdrop closing and scroll locking |
| `components/products.ts` | Five flavour names, descriptions and bottle paths |
| `public/assets/fresh-market/` | Five recreated artwork assets |
| `public/assets/hero/` | Original MP4s and poster images |
| `public/fonts/` | Local fonts and licences |

`previews/desktop.png` and `previews/mobile.png` show the actual built page with reduced motion enabled. `design-reference/selected-design.png` is the supplied concept for comparison. See `ASSET-NOTES.md` for artwork and font fidelity details and `VERIFICATION.md` for executed checks.

This is the complete project: extract it into a new folder. It replaces the previous Graphic Playground version. `COPY-PASTE.md` also contains the complete application source files, but image/video/font folders must be copied as files, not pasted as text.
