# Complete source files

This is the Fresh Market project, replacing the previous design. File paths below are relative to the project root. The ZIP already contains each file in its correct location.

Copy the entire `public/` directory and `package-lock.json` from this project too. Binary artwork, fonts and videos cannot be copied from these code blocks. See README.md for startup instructions.

## app/page.tsx

```tsx
import FreshMarket from "../components/FreshMarket";
import ScrollEffects from "../components/ScrollEffects";
import PointerEffects from "../components/PointerEffects";

export default function Home() {
  return (
    <>
      <FreshMarket />
      <ScrollEffects />
      <PointerEffects />
    </>
  );
}
```

## app/layout.tsx

```tsx
import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "HEALTHEE — Good days. Start juicy.",
  description:
    "Five flavours. Find your favourite. Explore Orange, Watermelon, Pineapple, Zobo and Tigernut.",
  icons: { icon: "/assets/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0f2a1b" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## app/globals.css

```css
@font-face {
  font-family: Fraunces;
  src: url("/fonts/fraunces-900.ttf") format("truetype");
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Poppins;
  src: url("/fonts/poppins-400.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Poppins;
  src: url("/fonts/poppins-500.ttf") format("truetype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Poppins;
  src: url("/fonts/poppins-600.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: Poppins;
  src: url("/fonts/poppins-700.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
:root {
  --cream: #f9f8e3;
  --green: #018543;
  --orange: #f25f2c;
  --ink: #0f2a1b;
  --display: Fraunces, Georgia, serif;
  --body: Poppins, Arial, sans-serif;
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
  scroll-padding-top: 30px;
}
body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--body);
  font-size: 16px;
}
body.modal-open {
  overflow: hidden;
}
button,
input {
  font: inherit;
}
button,
a {
  -webkit-tap-highlight-color: transparent;
}
button {
  color: inherit;
}
a {
  color: inherit;
  text-decoration: none;
}
button {
  cursor: pointer;
}
img {
  max-width: 100%;
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--green);
  outline-offset: 5px;
}
.hero a:focus-visible,
.hero button:focus-visible {
  outline-color: var(--cream);
}
h1,
h2,
h3,
p {
  margin: 0;
}
h1,
h2,
h3 {
  font-family: var(--display);
  font-weight: 900;
  letter-spacing: -0.035em;
}
.skip-link {
  position: fixed;
  left: 16px;
  top: 10px;
  padding: 12px 20px;
  background: var(--cream);
  z-index: 20;
  transform: translateY(-160%);
}
.skip-link:focus {
  transform: none;
}
.site-header {
  height: 70px;
  padding: 0 4.6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  background: var(--cream);
  position: relative;
  z-index: 5;
}
.wordmark {
  font-family: var(--display);
  font-size: 42px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  color: var(--green);
}
.wordmark > span {
  position: relative;
  color: var(--orange);
}
.wordmark svg {
  position: absolute;
  width: 24px;
  top: -8px;
  right: 9px;
  color: var(--green);
}
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 40px;
  font-size: 14px;
  font-weight: 500;
}
.desktop-nav button {
  border: 0;
  padding: 8px 0;
  background: transparent;
}
.desktop-nav a,
.desktop-nav button {
  position: relative;
}
.desktop-nav a:after,
.desktop-nav button:after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--green);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s;
}
.desktop-nav a:hover:after,
.desktop-nav button:hover:after {
  transform: scaleX(1);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: transparent;
}
.icon-button:hover {
  background: #01854310;
}
.cart-button {
  position: relative;
}
.cart-count {
  position: absolute;
  top: 4px;
  right: 0;
  background: #c84108;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
}
.menu-button {
  display: none;
}
.hero {
  height: 700px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 60% 64%,
    #0e5432 0,
    #042b16 56%,
    #001407 100%
  );
  color: var(--cream);
}
.hero-copy {
  position: relative;
  z-index: 2;
  text-align: center;
  margin: auto;
  padding-top: 26px;
  max-width: 850px;
}
.hero h1 {
  font-size: 88px;
  line-height: 0.86;
  letter-spacing: -0.035em;
}
.hero h1 span {
  color: var(--orange);
  display: inline-block;
  padding-top: 5px;
}
.hero-copy > p {
  font-size: 20px;
  font-weight: 600;
  margin: 17px 0 11px;
}
.pill-button {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-height: 51px;
  background: var(--orange);
  color: #fff;
  padding: 8px 14px 8px 26px;
  border-radius: 99px;
  font-size: 19px;
  font-weight: 700;
}
.outlined-arrow {
  border: 1px solid currentColor;
  border-radius: 50%;
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
}
.pill-button svg,
.round-arrow svg {
  transition: transform 0.22s ease;
}
.pill-button:hover svg,
.round-arrow:hover svg {
  transform: translateX(3px);
}
.pill-button:hover {
  background: #e94e0c;
}
.round-arrow {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  background: var(--orange);
  color: #fff;
  border: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 6px;
}
.flavour-zone {
  position: relative;
  background: var(--green);
  padding-top: 47px;
}
.flavour-dock {
  position: absolute;
  top: -43px;
  left: 1.6%;
  right: 1.6%;
  z-index: 4;
  border-radius: 36px;
  min-height: 84px;
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(0, 1.17fr) minmax(
      0,
      1.05fr
    ) minmax(0, 0.88fr) minmax(0, 0.99fr);
  background: var(--cream);
  padding: 8px 14px;
  box-shadow: 0 1px 0 #e8e4c0;
}
.flavour-dock > button {
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 4px;
  font-size: 14px;
  font-weight: 700;
  position: relative;
  min-width: 0;
}
.flavour-dock > button + button:before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background: #eae6c9;
}
.flavour-dock .round-arrow {
  width: 28px;
  height: 28px;
  padding: 2px;
}
.flavour-dock .ingredient {
  width: 60px;
}
.flavour-dock .round-arrow svg {
  width: 21px;
}
.flavour-dock > button:hover .round-arrow {
  background: var(--green);
}
.ingredient {
  width: 65px;
  height: 68px;
  display: block;
  flex-shrink: 0;
  background-image: url("/assets/fresh-market/ingredients.png");
  background-size: 500% auto;
  background-repeat: no-repeat;
}
.ingredient-orange {
  background-position: 0% center;
}
.ingredient-watermelon {
  background-position: 25% center;
}
.ingredient-pineapple {
  background-position: 50% center;
}
.ingredient-zobo {
  background-position: 75% center;
}
.ingredient-tigernut {
  background-position: 100% center;
}
.flavour-band {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  color: var(--cream);
  font-weight: 600;
  font-size: 21px;
  letter-spacing: 7px;
}
.flavour-band > svg {
  color: #f6d915;
  width: 26px;
  height: 28px;
}
.flavour-band > svg:nth-of-type(2) {
  transform: scaleX(-1);
}
.band-leaf,
.band-orange {
  position: absolute;
  width: 100px;
  height: 60px;
  background-image: url("/assets/fresh-market/closing-fruit.png");
  background-size: 600px 200px;
  bottom: 0;
}
.band-leaf {
  left: 0;
  background-position: -10px -10px;
}
.band-orange {
  right: -5px;
  bottom: -50px;
  width: 100px;
  height: 100px;
  background-image: url('/assets/fresh-market/ingredients.png');
  background-size: 500% auto;
  background-position: 0 center;
  transform: rotate(-22deg);
}
.drinks-section {
  padding: 28px 3.2% 10px;
  max-width: 1600px;
  margin: 0 auto;
}
.section-intro {
  padding: 0 1.8%;
}
.eyebrow {
  font-family: var(--body);
  font-size: 16px;
  letter-spacing: 2px;
  font-weight: 600;
  color: #c84108;
}
.section-intro h2 {
  font-size: 66px;
  line-height: 1.08;
  color: var(--green);
  margin: 1px 0 10px;
}
.intro-description {
  max-width: 520px;
  font-size: 17px;
  line-height: 1.34;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 17px;
}
.feature-card {
  width: 100%;
  min-height: 260px;
  isolation: isolate;
  position: relative;
  min-width: 0;
  aspect-ratio: 1.23;
  border-radius: 22px;
  background: radial-gradient(ellipse at 60% 45%, #fffad7, #eef1d3);
  border: 1px solid #e9e7c7;
  overflow: hidden;
}
.feature-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
  transform: translate(
      calc(var(--pointer-x, 0) * 3px),
      calc(var(--pointer-y, 0) * 3px)
    )
    scale(1.015);
  transition: transform 0.35s ease;
}
.feature-copy {
  position: relative;
  padding: 20px;
  z-index: 1;
  width: 70%;
}
.feature-copy h3 {
  font-size: 29px;
  line-height: 1;
  color: var(--green);
  letter-spacing: -0.035em;
}
.feature-copy p {
  font-size: 14px;
  line-height: 1.35;
  margin: 12px 0 18px;
}
.orange-card .feature-art {
  width: 95%;
  height: 105%;
  left: auto;
  right: -7%;
  top: 0;
  object-fit: fill;
}
.moments-card {
  color: var(--cream);
  border-color: transparent;
  background: #304b25;
}
.moments-card:after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, #0c260d9c, transparent 72%);
}
.moments-card .feature-copy h3 {
  color: var(--cream);
}
.moments-card .feature-copy p {
  margin-bottom: 18px;
}
.collection-card .feature-art {
  width: 88%;
  height: 108%;
  left: auto;
  right: -7%;
  object-fit: fill;
}
.collection-card .feature-copy {
  width: 84%;
}
.collection-card .feature-copy p {
  margin-top: 12px;
  margin-bottom: 14px;
}
.closing-section {
  min-height: 205px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--orange);
  padding: 47px 20px 58px;
  color: var(--cream);
  text-align: center;
  margin-top: 0;
}
.cream-wave {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 45px;
  color: var(--cream);
  z-index: 2;
}
.closing-section h2 {
  position: relative;
  z-index: 3;
  font-size: 49px;
  line-height: 1;
  letter-spacing: -0.025em;
  max-width: 620px;
  margin: auto;
}
.closing-fruit {
  position: absolute;
  bottom: 0;
  width: 300px;
  height: 194px;
  background: url("/assets/fresh-market/closing-fruit.png") no-repeat;
  background-size: auto 225px;
  z-index: 1;
  pointer-events: none;
}
.closing-left {
  left: 0;
  background-position: left bottom;
}
.closing-right {
  right: 0;
  background-position: right bottom;
}
.market-dialog {
  border: 1px solid #e4e2c6;
  border-radius: 24px;
  padding: 28px;
  max-width: 700px;
  width: calc(100% - 32px);
  max-height: 85dvh;
  background: var(--cream);
  color: var(--ink);
  box-shadow: 0 24px 100px #0004;
}
.market-dialog::backdrop {
  background: #00180cbb;
  backdrop-filter: blur(6px);
}
.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dialog-header h2 {
  font-size: 34px;
  line-height: 1.08;
  color: var(--green);
  padding-top: 6px;
}
.dialog-header .icon-button {
  flex-shrink: 0;
}
.product-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.product-options button {
  border: 1px solid #b7c5a3;
  border-radius: 99px;
  background: transparent;
  padding: 9px 13px;
  font-size: 13px;
  min-height: 42px;
}
.product-options button[aria-pressed="true"] {
  background: var(--green);
  border-color: var(--green);
  color: var(--cream);
}
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
  padding-top: 24px;
}
.product-detail img {
  width: 100%;
  height: 300px;
  object-fit: contain;
  mix-blend-mode: multiply;
  border-radius: 20px;
}
.product-detail h3 {
  font-size: 37px;
  color: var(--green);
  margin: 8px 0 12px;
}
.product-detail p {
  font-size: 15px;
}
.search-panel label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
}
.search-panel input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1px solid #74946f;
  color: var(--ink);
  background: #fffdf0;
}
.search-status {
  font-size: 13px;
  margin: 12px 0;
}
.search-results {
  display: grid;
}
.search-results > button {
  display: flex;
  align-items: center;
  gap: 15px;
  border: 0;
  border-top: 1px solid #dadfc3;
  background: transparent;
  text-align: left;
  min-height: 72px;
}
.search-results > button:hover {
  background: #0185430c;
}
.search-results > button > svg {
  margin-left: auto;
}
.empty-panel {
  text-align: center;
  max-width: 450px;
  margin: 25px auto;
}
.empty-panel > svg {
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  color: var(--green);
}
.empty-panel h3 {
  font-size: 30px;
  margin-bottom: 14px;
}
.empty-panel p {
  margin-bottom: 14px;
  line-height: 1.6;
}
.text-button {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  background: var(--green);
  color: var(--cream);
  border: 0;
  border-radius: 99px;
  padding: 12px 24px;
  margin-top: 12px;
}
.mobile-nav {
  display: grid;
}
.mobile-nav a,
.mobile-nav button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #daddc3;
  text-align: left;
}
@media (prefers-reduced-motion: no-preference) {
  .hero-copy {
    animation: hero-enter 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }
  .js-motion .reveal {
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.65s ease,
      transform 0.65s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .js-motion .reveal.visible {
    opacity: 1;
    transform: none;
  }
  .feature-card:nth-child(2) {
    transition-delay: 0.07s;
  }
  .feature-card:nth-child(3) {
    transition-delay: 0.14s;
  }
  @keyframes hero-enter {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
}
@media (min-width: 1280px) {
  .site-header {
    height: 84px;
  }
  .wordmark {
    font-size: 48px;
  }
  .desktop-nav {
    font-size: 16px;
    gap: 50px;
  }
  .header-actions {
    gap: 16px;
  }
  .hero {
    height: min(760px, 60vw);
  }
  .hero-copy {
    padding-top: 35px;
  }
  .hero h1 {
    font-size: 104px;
  }
  .hero-copy > p {
    margin-top: 20px;
  }
  .flavour-dock {
    max-width: 1400px;
    left: 50%;
    right: auto;
    width: 96.8%;
    transform: translateX(-50%);
    min-height: 98px;
    top: -48px;
  }
  .flavour-dock > button {
    font-size: 16px;
    gap: 15px;
  }
  .flavour-zone {
    padding-top: 57px;
  }
  .flavour-band {
    height: 60px;
  }
  .drinks-section {
    padding-top: 38px;
    padding-bottom: 16px;
  }
  .section-intro h2 {
    font-size: 76px;
  }
  .intro-description {
    font-size: 18px;
    max-width: 580px;
  }
  .feature-grid {
    gap: 24px;
    margin-top: 24px;
  }
  .feature-copy {
    padding: 26px;
  }
  .feature-copy h3 {
    font-size: 37px;
  }
  .feature-copy p {
    font-size: 17px;
    line-height: 1.4;
    margin: 18px 0 20px;
  }
  .collection-card .feature-copy p {
    margin-top: 18px;
    margin-bottom: 20px;
  }
  .closing-section {
    padding-top: 62px;
    min-height: 250px;
  }
  .closing-section h2 {
    font-size: 64px;
  }
  .cream-wave {
    height: 55px;
  }
  .closing-fruit {
    transform: scale(1.25);
    transform-origin: bottom;
  }
  .closing-left {
    left: 25px;
  }
  .closing-right {
    right: 25px;
  }
}
@media (max-width: 950px) {
  .desktop-nav {
    gap: 20px;
    font-size: 12px;
  }
  .site-header {
    padding: 0 3%;
    gap: 16px;
  }
  .wordmark {
    font-size: 36px;
  }
  .header-actions {
    gap: 0;
  }
  .flavour-dock {
    padding: 8px 5px;
  }
  .flavour-dock > button {
    gap: 5px;
    font-size: 12px;
    padding: 0 5px;
  }
  .flavour-dock .ingredient {
    zoom: 0.8;
  }
  .flavour-dock .round-arrow {
    width: 25px;
    height: 25px;
  }
  .feature-copy {
    padding: 16px;
  }
  .feature-copy h3 {
    font-size: 25px;
  }
  .feature-copy p {
    font-size: 12px;
    margin: 10px 0 12px;
  }
  .feature-copy .round-arrow {
    width: 34px;
    height: 34px;
  }
  .feature-grid {
    gap: 14px;
  }
  .section-intro h2 {
    font-size: 59px;
  }
  .feature-card {
    aspect-ratio: 1.08;
  }
}
@media (min-width: 701px) and (max-width: 950px) {
  .flavour-dock {
    top: -55px;
    min-height: 110px;
  }
  .flavour-dock > button {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: 64px 24px;
    column-gap: 6px;
  }
  .flavour-dock .ingredient {
    grid-column: 1 / -1;
    justify-self: center;
  }
  .flavour-zone {
    padding-top: 62px;
  }
}
@media (max-width: 700px) {
  .site-header {
    height: 68px;
    padding: 0 18px;
    gap: 10px;
  }
  .wordmark {
    font-size: 34px;
  }
  .wordmark svg {
    width: 19px;
    top: -7px;
    right: 7px;
  }
  .desktop-nav,
  .account-button {
    display: none;
  }
  .menu-button {
    display: inline-flex;
  }
  .header-actions {
    gap: 1px;
  }
  .icon-button {
    width: 36px;
    height: 44px;
  }
  .header-actions svg {
    width: 22px;
  }
  .hero {
    height: 650px;
  }
  .hero-copy {
    padding: 31px 12px 0;
  }
  .hero h1 {
    font-size: clamp(49px, 10.9vw, 75px);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }
  .hero-copy > p {
    font-size: 14px;
    margin: 15px 0;
  }
  .pill-button {
    background: #c84108;
    font-size: 15px;
    min-height: 46px;
    padding: 7px 11px 7px 20px;
    gap: 12px;
  }
  .outlined-arrow {
    width: 30px;
    height: 30px;
  }
  .flavour-zone {
    padding-top: 0;
  }
  .flavour-dock {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin: -16px 12px 0;
    padding: 12px 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 0;
    border-radius: 24px;
    min-height: 0;
  }
  .flavour-dock > button {
    width: 33.333%;
    flex-direction: column;
    gap: 0;
    font-size: 12px;
    padding: 2px 4px 9px;
    min-height: 106px;
  }
  .flavour-dock > button + button:before {
    display: none;
  }
  .flavour-dock .ingredient {
    zoom: 0.77;
  }
  .flavour-dock .round-arrow {
    width: 23px;
    height: 23px;
    margin-top: 6px;
  }
  .flavour-dock .round-arrow svg {
    width: 17px;
  }
  .flavour-band {
    height: 62px;
    font-size: 13px;
    letter-spacing: 3.6px;
    gap: 9px;
  }
  .flavour-band > svg {
    width: 17px;
    height: 21px;
  }
  .band-leaf,
  .band-orange {
    width: 40px;
    opacity: 0.55;
  }
  .drinks-section {
    padding: 30px 18px 10px;
  }
  .section-intro {
    padding: 0 2px;
  }
  .eyebrow {
    font-size: 13px;
  }
  .section-intro h2 {
    font-size: clamp(37px, 9vw, 55px);
    margin: 7px 0 12px;
  }
  .intro-description {
    font-size: 14px;
    line-height: 1.5;
    max-width: 440px;
  }
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 18px;
    margin-top: 22px;
  }
  .feature-card {
    aspect-ratio: 1.25;
    min-height: 290px;
    border-radius: 22px;
  }
  .feature-copy {
    padding: 23px;
  }
  .feature-copy h3 {
    font-size: 33px;
  }
  .feature-copy p {
    font-size: 15px;
    margin: 15px 0 18px;
  }
  .feature-copy .round-arrow {
    width: 40px;
    height: 40px;
  }
  .moments-card .feature-copy p {
    margin-bottom: 18px;
  }
  .collection-card .feature-copy p {
    margin-top: 15px;
    margin-bottom: 18px;
  }
  .closing-section {
    padding: 52px 12px 130px;
    min-height: 300px;
  }
  .closing-section h2 {
    font-size: clamp(32px, 8.5vw, 48px);
  }
  .closing-fruit {
    transform: scale(0.62);
    transform-origin: bottom;
  }
  .closing-left {
    left: -60px;
  }
  .closing-right {
    right: -60px;
  }
  .cream-wave {
    height: 30px;
  }
  .market-dialog {
    padding: 20px;
    border-radius: 20px;
  }
  .dialog-header h2 {
    font-size: 28px;
  }
  .product-detail {
    grid-template-columns: 1fr;
    gap: 12px;
    text-align: center;
  }
  .product-detail img {
    height: 220px;
  }
  .product-detail h3 {
    font-size: 32px;
  }
  .product-options {
    gap: 6px;
  }
  .product-options button {
    font-size: 12px;
    padding: 8px 11px;
  }
  .product-detail p {
    font-size: 14px;
  }
}
@media (max-width: 359px) {
  .feature-card {
    min-height: 260px;
  }
  .site-header {
    padding: 0 12px;
  }
  .wordmark {
    font-size: 30px;
  }
  .header-actions {
    gap: 0;
  }
  .hero {
    height: 600px;
  }
  .hero-copy > p {
    font-size: 12px;
  }
  .feature-copy {
    padding: 18px;
  }
  .feature-copy h3 {
    font-size: 29px;
  }
  .feature-copy p {
    font-size: 13px;
    margin: 12px 0 14px;
  }
  .flavour-band {
    font-size: 11px;
    letter-spacing: 3px;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *:before,
  *:after {
    animation: none !important;
    transition: none !important;
  }
  .feature-art {
    transform: none;
  }
  .reveal {
    opacity: 1;
    transform: none;
  }
}
```

## components/FreshMarket.tsx

```tsx
"use client";
import { useRef, useState } from "react";
import HeroVideo from "./hero/HeroVideo";
import { closeOnBackdrop, useDialogScrollLock } from "./dialog";
import { products, type Product } from "./products";
import { Arrow, Icon, Leaf } from "./Icons";

type Panel = "search" | "account" | "cart" | "menu" | "collection";

export default function FreshMarket() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel>("collection");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product>(products[0]);
  useDialogScrollLock(dialog);
  function open(next: Panel, product?: Product) {
    setPanel(next);
    setQuery("");
    if (product) setSelected(product);
    dialog.current?.showModal();
  }
  const close = () => dialog.current?.close();
  const filtered = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const panelTitle = {
    search: "Find your flavour.",
    account: "Your HEALTHEE account",
    cart: "Your basket",
    menu: "Explore HEALTHEE",
    collection: "Meet your next favourite.",
  }[panel];
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="HEALTHEE home">
          healt
          <span>
            hee
            <svg viewBox="0 0 27 20" aria-hidden="true">
              <path
                d="M13 17C2 16 2 8 1 3c9 0 12 5 12 14ZM14 17C12 6 20 2 26 1c1 9-4 15-12 16Z"
                fill="currentColor"
              />
              <path
                d="m8 8 6 10 7-11"
                stroke="#f9f8e3"
                fill="none"
                strokeWidth="1.3"
              />
            </svg>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#our-drinks">Our drinks</a>
          <a href="#healthee-way">The HEALTHEE way</a>
          <button onClick={() => open("collection")}>Explore collection</button>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Search flavours"
            onClick={() => open("search")}
          >
            <Icon name="search" />
          </button>
          <button
            className="icon-button account-button"
            aria-label="Account"
            onClick={() => open("account")}
          >
            <Icon name="account" />
          </button>
          <button
            className="icon-button cart-button"
            aria-label="Basket, 0 items"
            onClick={() => open("cart")}
          >
            <Icon name="cart" />
            <span className="cart-count">0</span>
          </button>
          <button
            className="icon-button menu-button"
            aria-label="Open menu"
            onClick={() => open("menu")}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <HeroVideo />
          <div className="hero-copy">
            <h1 id="hero-title">
              Good days.
              <br />
              <span>Start juicy.</span>
            </h1>
            <p>Five flavours. Find your favourite.</p>
            <a className="pill-button" href="#our-drinks">
              Explore juices{" "}
              <span className="outlined-arrow">
                <Arrow />
              </span>
            </a>
          </div>
        </section>
        <div className="flavour-zone">
          <nav className="flavour-dock" aria-label="Explore juice flavours">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => open("collection", product)}
                aria-label={`Explore ${product.name}`}
              >
                <span
                  className={`ingredient ingredient-${product.id}`}
                  aria-hidden="true"
                />
                <span>{product.name}</span>
                <span className="round-arrow">
                  <Arrow />
                </span>
              </button>
            ))}
          </nav>
          <div className="flavour-band">
            <span className="band-leaf" aria-hidden="true" />
            <Leaf />
            <span>FIND YOUR FLAVOUR</span>
            <Leaf />
            <span className="band-orange" aria-hidden="true" />
          </div>
        </div>
        <section
          className="drinks-section"
          id="our-drinks"
          aria-labelledby="drinks-title"
        >
          <div className="section-intro reveal">
            <p className="eyebrow">OUR DRINKS</p>
            <h2 id="drinks-title">Pick your happy.</h2>
            <p className="intro-description">
              Real fruit flavours crafted for your everyday moments. Five
              delicious options, one refreshing collection.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature-card orange-card reveal">
              <img
                className="feature-art"
                src="/assets/fresh-market/orange-card.png"
                alt="Orange HEALTHEE bottle with orange slices and green leaves"
                width="1254"
                height="1254"
                loading="lazy"
              />
              <div className="feature-copy">
                <h3>
                  Fruity
                  <br />
                  Flavours
                </h3>
                <p>
                  Five vibrant
                  <br />
                  flavours made
                  <br />
                  with real fruits.
                </p>
                <button
                  className="round-arrow"
                  aria-label="Discover fruity flavours"
                  onClick={() => open("collection", products[0])}
                >
                  <Arrow />
                </button>
              </div>
            </article>
            <article
              className="feature-card moments-card reveal"
              id="healthee-way"
            >
              <img
                className="feature-art"
                src="/assets/fresh-market/moments-card.png"
                alt="A woman enjoying a HEALTHEE watermelon drink outdoors"
                width="1254"
                height="1254"
                loading="lazy"
              />
              <div className="feature-copy">
                <h3>
                  Made
                  <br />
                  for your
                  <br />
                  moments
                </h3>
                <p>
                  A flavour for
                  <br />
                  every mood
                  <br />
                  and every day.
                </p>
                <a
                  className="round-arrow"
                  href="#juicy-moment"
                  aria-label="The HEALTHEE way: a juicy moment"
                >
                  <Arrow />
                </a>
              </div>
            </article>
            <article className="feature-card collection-card reveal">
              <img
                className="feature-art"
                src="/assets/fresh-market/fruit-collage.png"
                alt="A colourful arrangement of pineapple, watermelon, citrus, hibiscus and nuts"
                width="1254"
                height="1254"
                loading="lazy"
              />
              <div className="feature-copy">
                <h3>
                  Explore
                  <br />
                  the collection
                </h3>
                <p>
                  Discover all five
                  <br />
                  HEALTHEE juices
                  <br />
                  and find your
                  <br />
                  favourite.
                </p>
                <button
                  className="round-arrow"
                  aria-label="Explore all five juices"
                  onClick={() => open("collection")}
                >
                  <Arrow />
                </button>
              </div>
            </article>
          </div>
        </section>
        <section
          className="closing-section"
          id="juicy-moment"
          aria-labelledby="closing-title"
        >
          <svg
            className="cream-wave"
            viewBox="0 0 1024 60"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 0H1024V6C868 74 777 26 638 24S358 1 203 23 63 15 0 0Z"
              fill="currentColor"
            />
          </svg>
          <span className="closing-fruit closing-left" aria-hidden="true" />
          <span className="closing-fruit closing-right" aria-hidden="true" />
          <h2 className="reveal" id="closing-title">
            Make room for
            <br />a juicy moment.
          </h2>
        </section>
      </main>
      <dialog
        className="market-dialog"
        ref={dialog}
        aria-labelledby="dialog-title"
        onClick={closeOnBackdrop}
        onKeyDownCapture={(event) => {
          // Search inputs otherwise consume the first Escape to clear their value.
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      >
        <div className="dialog-header">
          <h2 id="dialog-title">{panelTitle}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </div>
        {panel === "menu" && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#our-drinks" onClick={close}>
              Our drinks <Arrow />
            </a>
            <a href="#healthee-way" onClick={close}>
              The HEALTHEE way <Arrow />
            </a>
            <button onClick={() => setPanel("collection")}>
              Explore collection <Arrow />
            </button>
            <button onClick={() => setPanel("account")}>
              Account <Icon name="account" />
            </button>
          </nav>
        )}
        {panel === "search" && (
          <div className="search-panel">
            <label htmlFor="flavour-search">Search our five flavours</label>
            <input
              id="flavour-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try orange or watermelon"
              autoComplete="off"
            />
            <p className="search-status" role="status">
              {filtered.length} {filtered.length === 1 ? "flavour" : "flavours"}{" "}
              found
            </p>
            <div className="search-results">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelected(product);
                    setPanel("collection");
                  }}
                >
                  <span
                    className={`ingredient ingredient-${product.id}`}
                    aria-hidden="true"
                  />
                  {product.name}
                  <Arrow />
                </button>
              ))}
            </div>
            {!filtered.length && (
              <p>
                Try another flavour: Orange, Watermelon, Pineapple, Zobo or
                Tigernut.
              </p>
            )}
          </div>
        )}
        {panel === "account" && (
          <div className="empty-panel">
            <Icon name="account" />
            <p>Online accounts are not available yet.</p>
            <p>You can still discover all five HEALTHEE flavours.</p>
            <button
              className="text-button"
              onClick={() => setPanel("collection")}
            >
              Explore the collection <Arrow />
            </button>
          </div>
        )}
        {panel === "cart" && (
          <div className="empty-panel">
            <Icon name="cart" />
            <h3>Your basket is empty.</h3>
            <p>
              Online ordering is not available yet. Find your favourite flavour
              in the collection.
            </p>
            <button
              className="text-button"
              onClick={() => setPanel("collection")}
            >
              Explore juices <Arrow />
            </button>
          </div>
        )}
        {panel === "collection" && (
          <div className="collection-panel">
            <div
              className="product-options"
              role="group"
              aria-label="Select a flavour"
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  aria-pressed={selected.id === product.id}
                  onClick={() => setSelected(product)}
                >
                  {product.name}
                </button>
              ))}
            </div>
            <div className="product-detail" aria-live="polite">
              <img
                src={selected.image}
                alt={`${selected.name} HEALTHEE juice bottle`}
                width="400"
                height="400"
              />
              <div>
                <p className="eyebrow">{selected.category}</p>
                <h3>{selected.name}</h3>
                <p>{selected.description}</p>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
```

## components/Icons.tsx

```tsx
import type { SVGProps } from "react";
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: "search" | "account" | "cart" | "menu" | "close";
}) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {name === "search" && (
        <>
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="m16 16 5 5" />
        </>
      )}
      {name === "account" && (
        <>
          <circle cx="12" cy="6.5" r="4" />
          <path d="M3.5 21v-2a8.5 8.5 0 0 1 17 0v2z" />
        </>
      )}
      {name === "cart" && (
        <>
          <path d="M2 3h3l2 13h12l2-10H6M8 12h11" />
          <circle cx="9" cy="20" r="1.3" />
          <circle cx="18" cy="20" r="1.3" />
        </>
      )}
      {name === "menu" && <path d="M3 6h18M3 12h18M3 18h18" />}
      {name === "close" && <path d="m5 5 14 14M19 5 5 19" />}
    </svg>
  );
}
export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M3 2c19 0 25 9 21 27C7 29 1 19 3 2Z" />
      <path d="M6 6 23 28" fill="none" stroke="#018543" strokeWidth="2" />
    </svg>
  );
}
```

## components/hero/HeroVideo.tsx

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";

const MOBILE_QUERY = "(max-width: 900px) and (orientation: portrait)";

export default function HeroVideo({
  onActivityChange,
}: {
  onActivityChange?: (active: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<
    "idle" | "blocked" | "unavailable" | "reduced" | "loading" | "ready"
  >("idle");
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !hostRef.current) return;
    const video = videoRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia(MOBILE_QUERY);
    let disposed = false,
      userPaused = false,
      inView = true,
      failed = false;
    let modalOpen = !!document.querySelector("dialog[open]"),
      source = "",
      generation = 0;
    let loadTimeout: number | undefined;
    const canPlay = () =>
      !disposed &&
      !failed &&
      !userPaused &&
      !motion.matches &&
      inView &&
      !document.hidden &&
      !modalOpen;

    function sync() {
      onActivityChange?.(canPlay() && video!.readyState >= 2);
      if (!canPlay()) {
        video.pause();
        return;
      }
      const attempt = generation;
      const playing = video.play();
      playing
        ?.then(() => {
          if (!canPlay()) video.pause();
        })
        .catch((error) => {
          // A pause or responsive source change may cancel an in-flight play().
          if (disposed || attempt !== generation || error.name === "AbortError")
            return;
          if (error.name === "NotAllowedError") {
            userPaused = true;
            setPaused(true);
            setStatus("blocked");
            onActivityChange?.(false);
          } else fail();
        });
    }
    function fail() {
      if (disposed) return;
      failed = true;
      onActivityChange?.(false);
      video.pause();
      clearTimeout(loadTimeout);
      setVisible(false);
      setStatus("unavailable");
    }
    function chooseSource() {
      if (motion.matches) {
        generation++;
        onActivityChange?.(false);
        video.pause();
        clearTimeout(loadTimeout);
        video.removeAttribute("src");
        video.load();
        source = "";
        setVisible(false);
        setStatus("reduced");
        return;
      }
      const next = `/assets/hero/hero-${mobile.matches ? "mobile" : "desktop"}.mp4`;
      if (next !== source) {
        generation++;
        onActivityChange?.(false);
        source = next;
        failed = false;
        video.pause();
        setVisible(false);
        setStatus("loading");
        clearTimeout(loadTimeout);
        video.src = source;
        video.load();
        loadTimeout = window.setTimeout(fail, 15000);
      }
      sync();
    }
    function loaded() {
      if (disposed || failed || motion.matches) return;
      clearTimeout(loadTimeout);
      setVisible(true);
      setStatus("ready");
      sync();
    }
    function dialogsChanged() {
      modalOpen = !!document.querySelector("dialog[open]");
      sync();
    }
    controllerRef.current = () => {
      userPaused = !userPaused;
      setPaused(userPaused);
      sync();
    };
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("error", fail);
    const observer = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    });
    observer.observe(hostRef.current);
    const dialogs = new MutationObserver(dialogsChanged);
    document
      .querySelectorAll("dialog")
      .forEach((dialog) =>
        dialogs.observe(dialog, {
          attributes: true,
          attributeFilter: ["open"],
        }),
      );
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", chooseSource);
    mobile.addEventListener("change", chooseSource);
    chooseSource();
    return () => {
      disposed = true;
      onActivityChange?.(false);
      generation++;
      clearTimeout(loadTimeout);
      observer.disconnect();
      dialogs.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", chooseSource);
      mobile.removeEventListener("change", chooseSource);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("error", fail);
      video.pause();
      video.removeAttribute("src");
      video.load();
      controllerRef.current = null;
    };
  }, [onActivityChange]);

  const disabled =
    status === "loading" || status === "reduced" || status === "unavailable";
  const label =
    status === "reduced"
      ? "Motion reduced"
      : status === "unavailable"
        ? "Still image"
        : status === "loading"
          ? "Loading motion"
          : paused
            ? "Play animation"
            : "Pause animation";
  return (
    <>
      <div
        className={styles.media}
        ref={hostRef}
        data-testid="hero-media"
        aria-hidden="true"
      >
        <picture>
          <source
            media={MOBILE_QUERY}
            srcSet="/assets/hero/poster-mobile.webp"
          />
          <img
            src="/assets/hero/poster-desktop.webp"
            alt=""
            width="1600"
            height="900"
            fetchPriority="high"
          />
        </picture>
        <video
          ref={videoRef}
          className={visible ? styles.videoVisible : ""}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          disablePictureInPicture
        />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.motionControl}>
        {status !== "idle" && (
          <button
            type="button"
            onClick={() => controllerRef.current?.()}
            disabled={disabled}
            aria-pressed={paused}
            aria-label={label}
          >
            <span aria-hidden="true">
              {disabled ? "○" : paused ? "▷" : "Ⅱ"}
            </span>
            {label}
          </button>
        )}
      </div>
    </>
  );
}
```

## components/hero/hero.module.css

```css
.media {
  position: absolute;
  inset: 110px 0 0;
  overflow: hidden;
  mask-image: linear-gradient(transparent, #000 20%);
}
.media picture,
.media img,
.media video {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.media img,
.media video {
  object-fit: cover;
  object-position: 65% 100%;
}
.media video {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.media video.videoVisible {
  opacity: 1;
}
.shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 18, 8, 0.22), transparent 50%);
  pointer-events: none;
}
.motionControl {
  position: absolute;
  z-index: 3;
  bottom: 64px;
  right: 20px;
}
.motionControl button {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid #f9f8e3;
  color: #f9f8e3;
  background: #0f2a1b80;
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-size: 0;
}
.motionControl button span {
  font-size: 29px;
  line-height: 1;
}
.motionControl button:disabled {
  cursor: default;
  opacity: 0.7;
}
@media (min-width: 1280px) {
  .media {
    top: 135px;
  }
}
@media (max-width: 700px) {
  .media {
    inset: 180px 0 0;
    mask-image: linear-gradient(transparent, #000 22%);
  }
  .media img,
  .media video {
    object-fit: cover;
    object-position: center bottom;
  }
  .motionControl {
    bottom: 28px;
    right: 16px;
  }
  .motionControl button {
    width: 44px;
    height: 44px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .media video {
    transition: none;
  }
}
```

## components/PointerEffects.tsx

```tsx
"use client";

import { useEffect } from "react";

export default function PointerEffects() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown = () => {};

    function setup() {
      teardown();
      if (!finePointer.matches || reducedMotion.matches) return;

      const cleanups: (() => void)[] = [];
      document
        .querySelectorAll<HTMLElement>(".feature-card")
        .forEach((element) => {
          let frame = 0;
          let x = 0;
          let y = 0;

          function move(event: PointerEvent) {
            if (event.pointerType !== "mouse") return;
            const bounds = element.getBoundingClientRect();
            x = Math.max(
              -1,
              Math.min(
                1,
                ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
              ),
            );
            y = Math.max(
              -1,
              Math.min(
                1,
                ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
              ),
            );
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
              element.style.setProperty("--pointer-x", String(x));
              element.style.setProperty("--pointer-y", String(y));
              frame = 0;
            });
          }

          function reset() {
            window.cancelAnimationFrame(frame);
            frame = 0;
            element.style.removeProperty("--pointer-x");
            element.style.removeProperty("--pointer-y");
          }

          element.addEventListener("pointermove", move, { passive: true });
          element.addEventListener("pointerleave", reset);
          cleanups.push(() => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", reset);
            reset();
          });
        });
      teardown = () => cleanups.forEach((cleanup) => cleanup());
    }

    finePointer.addEventListener("change", setup);
    reducedMotion.addEventListener("change", setup);
    setup();
    return () => {
      teardown();
      finePointer.removeEventListener("change", setup);
      reducedMotion.removeEventListener("change", setup);
    };
  }, []);

  return null;
}
```

## components/ScrollEffects.tsx

```tsx
"use client";
import { useEffect } from "react";

// Section entrances are independent of the hero's automatic animation clock.
export default function ScrollEffects() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    function setup() {
      observer?.disconnect();
      const elements = document.querySelectorAll(".reveal");
      if (preference.matches || !("IntersectionObserver" in window)) {
        document.documentElement.classList.remove("js-motion");
        elements.forEach((element) => element.classList.add("visible"));
        return;
      }
      document.documentElement.classList.add("js-motion");
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 },
      );
      elements.forEach((element) => observer?.observe(element));
    }
    preference.addEventListener("change", setup);
    setup();
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", setup);
      document.documentElement.classList.remove("js-motion");
    };
  }, []);
  return null;
}
```

## components/dialog.ts

```typescript
"use client";
import { useEffect, type MouseEvent, type RefObject } from "react";

export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
}

// Native dialogs handle focus trapping, Escape and focus restoration.
export function useDialogScrollLock(ref: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const update = () =>
      document.body.classList.toggle(
        "modal-open",
        Boolean(document.querySelector("dialog[open]")),
      );
    const observer = new MutationObserver(update);
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    dialog.addEventListener("close", update);
    return () => {
      observer.disconnect();
      dialog.removeEventListener("close", update);
      if (dialog.open) dialog.close();
      update();
    };
  }, [ref]);
}
```

## components/products.ts

```typescript
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
}

export const products: Product[] = [
  {
    id: "orange",
    name: "Orange",
    category: "CITRUS",
    description: "A bright citrus moment.",
    image: "/assets/orange.png",
  },
  {
    id: "watermelon",
    name: "Watermelon",
    category: "REFRESHING",
    description: "A splash of summer colour.",
    image: "/assets/watermelon.png",
  },
  {
    id: "pineapple",
    name: "Pineapple",
    category: "TROPICAL",
    description: "Your tropical interlude.",
    image: "/assets/pineapple.png",
  },
  {
    id: "zobo",
    name: "Zobo",
    category: "HIBISCUS",
    description: "Rich colour. Distinct character.",
    image: "/assets/zobo.png",
  },
  {
    id: "tigernut",
    name: "Tigernut",
    category: "DISTINCTIVE",
    description: "Something a little different.",
    image: "/assets/tigernut.png",
  },
];
```

## package.json

```json
{
  "name": "healthee-fresh-market",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.4.0",
    "react": "19.3.0",
    "react-dom": "19.3.0"
  },
  "engines": {
    "node": ">=20.9.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

## next.config.mjs

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
export default { turbopack: { root: projectRoot } };
```
