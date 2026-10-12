# Verification

Verified on 7 October 2026 against the production Next.js build in headless Chromium.

- `npm run build`: passed; the homepage is statically prerendered.
- `npm run typecheck`: passed with strict TypeScript.

## Browser checks passed

- Original desktop video plays; pause and resume work
- Search filters flavours, opens the matching product, handles no results, pauses video, restores focus on Escape
- Header account and basket controls open honest frontend states
- No page overflow or clipped text; CTA, collection and navigation work at 320 x 900
- No page overflow or clipped text; CTA, collection and navigation work at 360 x 900
- No page overflow or clipped text; CTA, collection and navigation work at 390 x 844
- No page overflow or clipped text; CTA, collection and navigation work at 768 x 1024
- No page overflow or clipped text; CTA, collection and navigation work at 1024 x 1536
- No page overflow or clipped text; CTA, collection and navigation work at 1440 x 1000
- No page overflow or clipped text; CTA, collection and navigation work at 812 x 375
- Subtle mouse movement affects card artwork; video pauses offscreen
- Reduced motion keeps static poster and removes entrance/pointer motion
- Failed video retains poster, readable headline and working CTA
- Touch mode uses native pointer and working mobile menu
- No browser runtime errors or missing asset responses

## Visual review

The actual desktop (1024px) and mobile (390px) screenshots were inspected against the selected reference. The desktop retains the cream header, centred two-line headline, flavour dock, green strip, three cards and curved orange closing section. Cards stack and the dock wraps on narrow screens; intermediate widths place the fruit above each flavour label. The selected reference is included for comparison.

The screenshots show reduced-motion mode, so the hero displays its original poster. Normal mode plays the original video. Fine pointer movement is limited to card artwork; the cursor and buttons remain stationary.

Fixed during verification: Escape being consumed by a populated search input; cramped feature-card text at narrow widths; and long flavour labels overflowing the dock. A clipped decorative orange was replaced with the transparent ingredient artwork after the interaction checks; final build, typecheck and desktop/mobile rendering were checked again.

## Original media integrity

SHA-256 hashes match the previous project's files byte for byte:

- hero-desktop.mp4: `54a110b25cfe30d6fa4c946df6eb074ca7014498b0b35966ebf7852fc9e73b40`
- hero-mobile.mp4: `9f9673d1fb0b8cc138697d8da4a1663d0df4b399e71949ab10cce6a729f1dfd8`

## Limits

Physical-device Safari and Firefox were not tested. No Lighthouse score, performance benchmark or full accessibility conformance is claimed. This is a frontend project; account, ordering and payment services are not connected. See ASSET-NOTES.md for recreated artwork, font and wordmark details.
