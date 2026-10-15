# Copper Frying Pan

Handcrafted solid-copper goods storefront — a dark, editorial single-page shop
for hand-raised copper cookware, barware, and home goods. Built with
[Qwik](https://qwik.dev/) + [Qwik City](https://qwik.dev/docs/qwikcity/),
[Tailwind CSS v3](https://v3.tailwindcss.com/), [Vite](https://vite.dev/),
and [Three.js](https://threejs.org/) for the interactive 3D hero pan.

## Features

- **Interactive 3D hero** — a PBR frying pan (lathe-turned copper bowl, tinned
  interior, iron handle, rivets) with studio environment lighting, slow
  quasi-random tumble, mouse parallax, and scroll-driven spin + fade.
  Desktop-only; mobile gets clean fast text.
- **Product range bento** — bestsellers with prices, ratings, and per-pan
  order links; buying promises; materials spec sheet; 30-second care guide.
- **Infinite marquee** pinned to the bottom of the first screen with range
  prices and shop perks (pauses on hover, disabled under reduced motion).
- **Owner reviews** — sticky summary card, full review rail with score
  breakdowns and enlarged quotes, plus a featured-verdict carousel that
  stacks all verdicts in one grid cell (card sizes to the tallest, no layout
  shift) and auto-rotates to a random verdict every 7s (pauses on
  hover/focus, hidden tab, or reduced motion).
- **Shop promises table, big CTA, mobile hamburger nav**, GSAP scroll reveals.
- **Buttons + anchors** — primary CTAs cross-fade via an overlay (smooth
  hover-in/out); `#featured-review` / `#cta` panels stay locked (no hover
  lift). Every section has a stable anchor: `#top`, `#highlights`, `#craft`,
  `#story`, `#reviews`, `#featured-review`, `#proof`, `#cta`.
- **Local responsive imagery** — every photo is served from `src/assets/` and
  generated at build time in AVIF + WebP (+ JPEG fallback) at multiple widths
  via `vite-imagetools`. No remote images.

## Getting started

Requires Node.js ≥ 18.17 and [pnpm](https://pnpm.io/) 9.

```bash
pnpm install
pnpm dev        # local dev server (SSR mode)
```

## Scripts

| Command               | What it does                                  |
| --------------------- | --------------------------------------------- |
| `pnpm dev`            | Start the dev server (`vite --mode ssr`)      |
| `pnpm start`          | Start dev server and open it in the browser   |
| `pnpm build`          | Full production build (`qwik build`)          |
| `pnpm build.client`   | Client-only Vite build (also emits AVIF/WebP) |
| `pnpm build.preview`  | SSR preview-entry build                       |
| `pnpm build.types`    | Typecheck (`tsc --incremental --noEmit`)      |
| `pnpm preview`        | Preview a production build locally            |

## Project structure

```
src/
  assets/                 # Local image sources (responsive AVIF/WebP generated at build)
  components/
    copper-pan-3d.tsx     # Three.js hero showpiece (lazy, client-only)
    router-head.tsx        # <head> meta / icons
  data/
    site.ts               # Single source of truth: business, products, specs,
                          # reviews, promises (edit copy here)
  routes/
    index.tsx             # The storefront page
    site.css              # Design tokens, glass, buttons, marquee
    layout.tsx
  global.css              # Tailwind + base canvas color
```

Copy lives in `src/data/site.ts` — products, pricing, reviews, and promises
can all be updated there without touching layout code.

## Notes

- The 3D pan and GSAP animations are client-only and respect
  `prefers-reduced-motion` (static end-states, no animation).
- Fonts load from Fontshare / Google Fonts CDNs; GSAP loads from cdnjs.
  Everything else (images, JS, CSS) is bundled locally.
