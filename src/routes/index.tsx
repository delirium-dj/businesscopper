/**
 * File: src/routes/index.tsx
 * Purpose: BusinessCopper storefront — handcrafted solid-copper goods, rendered in
 * the editorial AIDA structure of the step52 design study (floating glass nav,
 * asymmetric hero, gapless bento, GSAP scrub + pinned consensus, review carousel,
 * certified-proof table, massive CTA).
 */

import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import {
  BUSINESS,
  CARE_STEPS,
  DIMENSIONS,
  PRODUCTS,
  PROOF,
  REVIEWS,
  SPECS,
} from "../data/site";
import type { ReviewRating } from "../data/site";
import { CopperPan3D } from "../components/copper-pan-3d";
import "./site.css";

// Locally served responsive imagery (Vite + imagetools): every picture below is
// generated at build time in AVIF + WebP (+ JPG fallback) at multiple widths.
import rackPicture from "../assets/copper-pans-rack.jpg?w=640;960;1280&format=avif;webp;jpg&as=picture";
import bowlPicture from "../assets/hand-hammered-bowl.jpg?w=640;960;1280&format=avif;webp;jpg&as=picture";
import saucepansPicture from "../assets/copper-saucepans.jpg?w=480;768;1024&format=avif;webp;jpg&as=picture";
import avatarMaraEllison from "../assets/avatar-mara-ellison.jpg?w=88;176&format=avif;webp;jpg&as=picture";
import avatarHearthJournal from "../assets/avatar-hearth-journal.jpg?w=88;176&format=avif;webp;jpg&as=picture";
import avatarCopperReview from "../assets/avatar-copper-review.jpg?w=88;176&format=avif;webp;jpg&as=picture";
import avatarVerifiedOwners from "../assets/avatar-verified-owners.jpg?w=88;176&format=avif;webp;jpg&as=picture";
import avatarWorkshopWeekly from "../assets/avatar-workshop-weekly.jpg?w=88;176&format=avif;webp;jpg&as=picture";

const AVATARS: Record<string, typeof avatarMaraEllison> = {
  "mara-ellison": avatarMaraEllison,
  "hearth-journal": avatarHearthJournal,
  "copper-review": avatarCopperReview,
  "verified-owners": avatarVerifiedOwners,
  "workshop-weekly": avatarWorkshopWeekly,
};

const business = BUSINESS;

const formatPrice = (n: number): string => `$${n}`;

const formatDate = (raw?: string): string => {
  if (!raw) return "current season";
  return new Date(`${raw}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

// --- GSAP (real library, CDN-loaded, client-only) -------------------------------------

const GSAP_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLL_TRIGGER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";

interface GsapMatchMedia {
  add: (query: string, fn: () => void) => void;
  revert: () => void;
}
interface GsapLike {
  registerPlugin: (plugin: unknown) => void;
  matchMedia: () => GsapMatchMedia;
  to: (
    target: string | Element | Element[],
    vars: Record<string, unknown>,
  ) => void;
  from: (
    target: string | Element | Element[],
    vars: Record<string, unknown>,
  ) => void;
  utils: { toArray: (target: string) => Element[] };
  context: (fn: () => void) => { revert: () => void };
}
interface ScrollTriggerLike {
  create: (config: Record<string, unknown>) => void;
  refresh: () => void;
}

function loadGsap(): Promise<GsapLike | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const w = window as unknown as {
    gsap?: GsapLike;
    ScrollTrigger?: ScrollTriggerLike;
    __bcGsap?: Promise<GsapLike | null> | null;
  };
  if (w.gsap) return Promise.resolve(w.gsap);
  if (w.__bcGsap) return w.__bcGsap;
  const load = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () =>
        reject(new Error(`businesscopper: failed to load ${src}`));
      document.head.appendChild(el);
    });
  w.__bcGsap = load(GSAP_SRC)
    .then(() => load(SCROLL_TRIGGER_SRC))
    .then(() => {
      if (!w.gsap)
        throw new Error("businesscopper: gsap global missing after load");
      return w.gsap;
    })
    .catch(() => null);
  return w.__bcGsap;
}

export default component$(() => {
  // Every independent review of the workshop, best grade first.
  const ratings = [...REVIEWS].sort(
    (a, b) => b.scores.overall - a.scores.overall,
  );

  // Review carousel position.
  const activeReview = useSignal(0);
  const activeQuote = ratings[activeReview.value] ?? ratings[0];

  // Mobile navigation dropdown.
  const menuOpen = useSignal(false);

  const quoteFor = (review: ReviewRating | undefined): string => {
    if (!review) return "No reviews yet — be the first to cook with us.";
    return `“${review.quote}”`;
  };

  // Scrubbing paragraph: plain-spoken shop story, assembled from the dataset only.
  const scrubWords =
    `We hammer every pan from 2.5mm solid copper in our Ohio workshop — no coatings to flake, no base to separate. It heats evenly, sears beautifully, and comes back to us for re-tinning when it needs it. Over 2,300 home cooks and 240+ restaurants cook on ${business.name} every day. ${business.short}`
      .split(" ")
      .filter(Boolean);

  // Marquee ribbon: the range, prices, and shop perks.
  const marqueeItems = [
    ...PRODUCTS.map((p) => `${p.name} — ${formatPrice(p.price)}`),
    "Free US shipping over $150",
    "60-day returns",
    "Lifetime warranty",
    "★★★★★ 4.9/5 from 2,300+ owners",
  ];

  // Real GSAP motion: scrubbing text reveal + entrance physics, gated
  // behind prefers-reduced-motion. Without JS or without GSAP the page stays a
  // fully readable static document (words collapse to full opacity).
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    const gsap = await loadGsap();
    const words = Array.from(
      document.querySelectorAll<HTMLElement>(".bc-word"),
    );
    const revealAllWords = () =>
      words.forEach((word) => (word.style.opacity = "1"));
    if (!gsap) {
      revealAllWords();
      return;
    }
    const scrollTrigger = (
      window as unknown as { ScrollTrigger?: ScrollTriggerLike }
    ).ScrollTrigger;
    if (scrollTrigger) gsap.registerPlugin(scrollTrigger);
    let onLoad: (() => void) | null = null;
    const ctx = gsap.context(() => {
      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: reduce)", () => {
        revealAllWords();
      });
      // Scrubbing text reveals and entrance physics run at every breakpoint.
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        if (!scrollTrigger) return;
        gsap.to(".bc-word", {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: "#bc-scrub",
            start: "top 80%",
            end: "bottom 55%",
            scrub: 0.4,
          },
        });
        gsap.utils.toArray(".bc-reveal").forEach((el) => {
          gsap.from(el, {
            y: 48,
            opacity: 0,
            duration: 1.1,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        onLoad = () => scrollTrigger.refresh();
        window.addEventListener("load", onLoad);
      });
    });
    cleanup(() => {
      if (onLoad) window.removeEventListener("load", onLoad);
      ctx.revert();
    });
  });

  return (
    <main class="bc-page w-full max-w-full overflow-x-hidden">
      <div class="bc-ambient-a" aria-hidden="true" />
      <div class="bc-ambient-b" aria-hidden="true" />
      <div class="bc-grain" aria-hidden="true" />

      {/* Navigation: floating glass pill, hamburger menu on mobile */}
      <header class="fixed left-1/2 top-4 z-50 w-full max-w-3xl -translate-x-1/2 px-3 sm:top-6 sm:px-4">
        <nav
          aria-label="Storefront navigation"
          class="bc-nav-pill relative flex items-center justify-between gap-2 rounded-full px-4 py-2 text-xs font-medium text-zinc-300 sm:gap-4 sm:px-5 sm:py-2.5 md:px-7 md:py-3 md:text-sm"
        >
          <div class="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <span
              class="inline-block h-2 w-2 shrink-0 rounded-full bg-[#d97757]"
              aria-hidden="true"
            />
            <a
              href="#top"
              class="bc-font-display truncate font-bold tracking-tight text-white hover:text-[#d97757]"
            >
              BusinessCopper
            </a>
            <span class="hidden text-zinc-600 sm:inline" aria-hidden="true">
              /
            </span>
            <span class="bc-font-mono hidden text-[11px] text-zinc-400 sm:inline">
              copper atelier
            </span>
          </div>
          <div class="hidden items-center gap-6 md:flex">
            <a href="#craft" class="transition hover:text-white">
              Shop
            </a>
            <a href="#reviews" class="transition hover:text-white">
              Reviews
            </a>
            <a href="#proof" class="transition hover:text-white">
              Shipping & warranty
            </a>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <a
              href="mailto:atelier@businesscopper.shop"
              title="Commission a bespoke piece"
              class="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-zinc-300 transition hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              Commission
            </a>
            <button
              type="button"
              aria-label={menuOpen.value ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen.value}
              onClick$={() => (menuOpen.value = !menuOpen.value)}
              class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-zinc-300 transition hover:border-white/50 hover:text-white md:hidden"
            >
              {menuOpen.value ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 3l8 8M11 3l-8 8"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4h10M2 7h10M2 10h10"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
          {menuOpen.value && (
            <div class="absolute inset-x-0 top-full mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/90 p-2 shadow-2xl backdrop-blur-3xl backdrop-saturate-500 md:hidden">
              {[
                { href: "#craft", label: "Shop" },
                { href: "#reviews", label: "Reviews" },
                { href: "#proof", label: "Shipping & warranty" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick$={() => (menuOpen.value = false)}
                  class="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </nav>
      </header>

      {/* Attention: asymmetric hero + marquee pinned to the bottom of the first screen */}
      <div class="relative flex min-h-[100svh] flex-col">
        {/* 3D copper pan: full-bleed layer so the handle reaches the viewport edge */}
        <div
          class="pointer-events-none absolute inset-0 z-0 hidden md:block"
          aria-hidden="true"
        >
          <CopperPan3D />
        </div>
        <section
          id="top"
          class="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pt-36 pb-16 md:pt-44 md:pb-20"
        >
          <div class="relative z-10 w-full">
            <p class="bc-font-mono max-w-2xl text-xs uppercase tracking-widest text-[#d97757]">
              Hand-hammered in Ohio · since 2011
            </p>
            <h1 class="bc-font-display mt-4 w-full text-[clamp(3rem,7vw,5rem)] font-black leading-[1.2] tracking-tight text-white md:text-[clamp(2.5rem,4.5vw,4rem)] lg:text-[clamp(3rem,5.5vw,5rem)]">
              Copper pans that outlive nonstick.
            </h1>
            <div class="max-w-2xl">
              <p class="mt-16 text-base font-light leading-relaxed text-zinc-300 md:mt-24 md:text-xl">
                {business.short} {business.meta.leadTime}, free US shipping over
                $150.
              </p>
              <div class="mt-20 flex flex-wrap items-center gap-4 md:mt-32">
                <a
                  href="#craft"
                  class="bc-btn-primary rounded-full px-8 py-4 text-sm font-semibold tracking-wide"
                >
                  Shop bestsellers
                </a>
                <a
                  href="#reviews"
                  class="bc-btn-secondary rounded-full px-8 py-4 text-sm font-medium tracking-wide"
                >
                  Read 2,300+ reviews
                </a>
              </div>
              <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-zinc-400">
                <span>★★★★★ 4.9/5 from owners</span>
                <span aria-hidden="true">·</span>
                <span>Lifetime warranty</span>
                <span aria-hidden="true">·</span>
                <span>60-day returns</span>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee ribbon anchored to the bottom of the hero screen */}
        <section
          aria-label="Shop highlights"
          class="bc-marquee relative mt-auto w-full overflow-hidden border-y border-white/10 bg-white/[0.015] py-5"
        >
          <div class="bc-marquee-track items-center gap-12">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <div
                key={`${item}-${index}`}
                class="flex items-center gap-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                <span
                  class="inline-block h-1.5 w-1.5 rounded-full bg-[#d97757]"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Interest: gapless bento grid (8+4, 6+6) */}
      <section
        id="craft"
        class="mx-auto max-w-6xl px-6 pt-32 pb-16 md:pt-48 md:pb-24"
      >
        <div class="max-w-4xl">
          <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
            Shop the range
          </span>
          <h2 class="bc-font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Four pans cover 95% of weeknight cooking
          </h2>
          <p class="mt-6 max-w-2xl text-base font-light text-zinc-300 md:text-lg">
            Each one raised from 2.5mm solid copper, tinned by hand, and shipped
            from our Ohio workshop in 2–3 business days. Guaranteed for life.
          </p>
        </div>

        <div class="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-flow-dense">
          {/* Card 1: bestsellers */}
          <div class="bc-glass bc-reveal group relative overflow-hidden rounded-3xl p-8 md:col-span-8">
            <div class="relative z-10">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
                    Bestsellers
                  </span>
                  <h3 class="bc-font-display mt-2 text-2xl font-bold text-white md:text-3xl">
                    Pans people re-order as gifts
                  </h3>
                </div>
                <span class="bc-font-mono rounded-full bg-[#d97757]/15 px-3 py-1 text-xs font-bold text-[#f0b49f]">
                  ★ 4.9 · 2,300+ reviews
                </span>
              </div>

              <div class="mt-8 divide-y divide-white/10">
                {PRODUCTS.map((p) => (
                  <div
                    key={p.key}
                    class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5"
                  >
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-3">
                        <span class="bc-font-display text-lg font-bold text-white">
                          {p.name}
                        </span>
                        {p.badge ? (
                          <span class="bc-font-mono rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white">
                            {p.badge}
                          </span>
                        ) : null}
                      </div>
                      <p class="mt-1 text-sm font-light text-zinc-400">
                        {p.detail}
                      </p>
                      <p class="bc-font-mono mt-1 text-xs text-zinc-500">
                        ★ {p.rating.toFixed(1)} · {p.reviews} reviews
                      </p>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="bc-font-mono text-xl font-bold text-white">
                        {formatPrice(p.price)}
                      </span>
                      <a
                        href={`mailto:atelier@businesscopper.shop?subject=Order%3A%20${encodeURIComponent(p.name)}`}
                        class="bc-btn-secondary rounded-full px-5 py-2.5 text-xs font-medium tracking-wide"
                      >
                        Order
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: buying promises */}
          <div class="bc-glass bc-reveal relative overflow-hidden rounded-3xl p-8 md:col-span-4">
            <div
              class="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-[#d97757]/15 blur-2xl"
              aria-hidden="true"
            />
            <div class="relative z-10 flex h-full flex-col">
              <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
                Buy once
              </span>
              <p class="bc-font-display mt-4 text-lg font-bold leading-snug text-white">
                Guaranteed for life, returnable for 60 days.
              </p>
              <dl class="mt-6 space-y-4 text-sm">
                <div>
                  <dt class="bc-font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                    Warranty
                  </dt>
                  <dd class="mt-1 text-zinc-200">
                    Lifetime — dents, loose rivets, worn tin, we fix it
                  </dd>
                </div>
                <div>
                  <dt class="bc-font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                    Returns
                  </dt>
                  <dd class="mt-1 text-zinc-200">
                    60 days, cooked in or not, we pay return shipping
                  </dd>
                </div>
                <div>
                  <dt class="bc-font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                    Shipping
                  </dt>
                  <dd class="mt-1 text-zinc-200">
                    {business.meta.leadTime} · free US shipping over $150
                  </dd>
                </div>
              </dl>
              <p class="mt-auto pt-6 text-[11px] leading-relaxed text-zinc-500">
                Every pan leaves Ohio in plastic-free packaging with a care
                card.
              </p>
            </div>
          </div>

          {/* Card 3: what's in the metal */}
          <div class="bc-glass bc-reveal group relative overflow-hidden rounded-3xl p-8 md:col-span-6">
            <div class="relative z-10">
              <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
                No coatings, no cladding
              </span>
              <h3 class="bc-font-display mt-2 text-2xl font-bold text-white">
                What's in the metal
              </h3>
              <dl class="mt-6 divide-y divide-white/10 text-sm">
                {SPECS.map((s) => (
                  <div
                    key={s.term}
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <dt class="text-zinc-400">{s.term}</dt>
                    <dd class="text-right text-white">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <picture aria-hidden="true" class="absolute inset-0">
              <source
                type="image/avif"
                srcset={rackPicture.sources.avif}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
              <source
                type="image/webp"
                srcset={rackPicture.sources.webp}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
              <img
                src={rackPicture.img.src}
                width={rackPicture.img.w}
                height={rackPicture.img.h}
                sizes="(max-width: 767px) 100vw, 50vw"
                alt=""
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover opacity-[0.07] mix-blend-luminosity transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </picture>
          </div>

          {/* Card 4: care */}
          <div class="bc-glass bc-reveal group relative overflow-hidden rounded-3xl p-8 md:col-span-6">
            <div class="relative z-10">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
                  Easier than cast iron
                </span>
                <span class="bc-font-mono rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  30 seconds a day
                </span>
              </div>
              <h3 class="bc-font-display mt-2 text-2xl font-bold text-white">
                Care in 30 seconds
              </h3>
              <ol class="mt-6 space-y-4 text-sm font-light text-zinc-300">
                {CARE_STEPS.map((step, i) => (
                  <li key={step} class="flex gap-4">
                    <span class="bc-font-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d97757]/15 text-xs font-bold text-[#f0b49f]">
                      {i + 1}
                    </span>
                    <span class="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <picture aria-hidden="true" class="absolute inset-0">
              <source
                type="image/avif"
                srcset={bowlPicture.sources.avif}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
              <source
                type="image/webp"
                srcset={bowlPicture.sources.webp}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
              <img
                src={bowlPicture.img.src}
                width={bowlPicture.img.w}
                height={bowlPicture.img.h}
                sizes="(max-width: 767px) 100vw, 50vw"
                alt=""
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover opacity-[0.07] mix-blend-luminosity transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Desire (1/3): scrubbing text reveal */}
      <section id="bc-scrub" class="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <noscript>
          <style>{".bc-word{opacity:1 !important}"}</style>
        </noscript>
        <p class="bc-font-display text-center text-2xl font-bold leading-relaxed text-zinc-500 md:text-4xl md:leading-[1.35]">
          {scrubWords.map((word, index) => (
            <span key={`${word}-${index}`}>
              <span class="bc-word" style={{ opacity: 0.12 }}>
                {word}
              </span>
              {index < scrubWords.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </section>

      {/* Desire (2/3): summary card beside the review rail */}
      <section id="reviews" class="mx-auto max-w-6xl px-6 py-32">
        <div
          id="bc-consensus-grid"
          class="grid grid-cols-1 gap-12 lg:grid-cols-12"
        >
          <div id="bc-consensus-pin" class="lg:col-span-4">
            <div class="space-y-6 lg:sticky lg:top-28">
              <div class="bc-glass relative overflow-hidden rounded-3xl p-8">
                <div
                  class="absolute -top-16 -left-16 h-44 w-44 rounded-full bg-[#d97757]/12 blur-2xl"
                  aria-hidden="true"
                />
                <div class="relative z-10">
                  <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
                    Reviews
                  </span>
                  <h2 class="bc-font-display mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                    Loved in real kitchens
                  </h2>
                  <div class="mt-8 flex items-end gap-3">
                    <span class="bc-font-mono text-6xl font-black text-white">
                      {business.scores.overall}
                    </span>
                    <span class="pb-2 text-sm text-zinc-500">
                      / 100
                      <br />
                      owner average
                    </span>
                  </div>
                  <p class="mt-6 text-sm font-light leading-relaxed text-zinc-300">
                    {ratings.length} press tests plus 2,300+ verified owner
                    reviews. Restocked {formatDate(business.verified)}. Scroll
                    to see every score breakdown.
                  </p>
                </div>
              </div>

              {/* Desktop-only filler: copper pan photo + reassurance note */}
              <figure class="hidden overflow-hidden rounded-3xl border border-white/10 lg:block">
                <picture>
                  <source
                    type="image/avif"
                    srcset={saucepansPicture.sources.avif}
                    sizes="(max-width: 1023px) 0px, 33vw"
                  />
                  <source
                    type="image/webp"
                    srcset={saucepansPicture.sources.webp}
                    sizes="(max-width: 1023px) 0px, 33vw"
                  />
                  <img
                    src={saucepansPicture.img.src}
                    width={saucepansPicture.img.w}
                    height={saucepansPicture.img.h}
                    sizes="(max-width: 1023px) 0px, 33vw"
                    alt="Styled photograph of a collection of polished copper saucepans in a kitchen"
                    loading="lazy"
                    decoding="async"
                    class="aspect-[3/4] w-full object-cover"
                  />
                </picture>
                <figcaption class="bg-black/60 px-5 py-4 text-xs font-light leading-relaxed text-zinc-300">
                  Polished copper, hung with pride — our pans are made to be
                  cooked with daily and displayed always. Lifetime warranty and
                  60-day returns on all of it.
                </figcaption>
              </figure>
            </div>
          </div>

          <div class="space-y-4 lg:col-span-8">
            {ratings.map((review) => (
              <div key={review.key} class="bc-glass rounded-2xl p-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span class="bc-font-display text-lg font-bold text-white">
                      {review.name}
                    </span>
                    <span class="block font-mono text-[11px] text-zinc-500">
                      {review.detail}
                    </span>
                  </div>
                  <span class="bc-font-mono rounded-full bg-[#d97757]/15 px-3 py-1 text-xs font-bold text-[#f0b49f]">
                    {review.scores.overall}/100
                  </span>
                </div>
                <p class="mt-4 text-sm font-light leading-relaxed text-zinc-300">
                  “{review.quote}”
                </p>
                <div class="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 font-mono text-[11px] text-zinc-500 sm:grid-cols-6">
                  {DIMENSIONS.map((d) => (
                    <div key={d.key} title={d.description}>
                      <span>{d.short}</span>
                      <p class="text-sm font-bold text-zinc-200">
                        {review.scores[d.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desire (3/3): review carousel */}
      <section class="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
        <div class="bc-glass relative overflow-hidden rounded-3xl p-10 md:p-14">
          <div
            class="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d97757]/10 blur-3xl"
            aria-hidden="true"
          />
          <div class="relative z-10">
            <div class="flex flex-wrap items-center justify-between gap-6">
              <div class="flex -space-x-3">
                {ratings.slice(0, 8).map((review, index) => (
                  <button
                    key={review.key}
                    type="button"
                    title={review.name}
                    aria-label={`Show the ${review.name} verdict`}
                    onClick$={() => (activeReview.value = index)}
                    class={`relative h-11 w-11 overflow-hidden rounded-full ring-2 transition hover:z-10 hover:scale-110 ${
                      index === activeReview.value % Math.max(1, ratings.length)
                        ? "ring-[#d97757]"
                        : "ring-white/20 hover:ring-white/60"
                    }`}
                  >
                    {AVATARS[review.key] ? (
                      <picture class="absolute inset-0">
                        <source
                          type="image/avif"
                          srcset={AVATARS[review.key].sources.avif}
                          sizes="44px"
                        />
                        <source
                          type="image/webp"
                          srcset={AVATARS[review.key].sources.webp}
                          sizes="44px"
                        />
                        <img
                          src={AVATARS[review.key].img.src}
                          width={AVATARS[review.key].img.w}
                          height={AVATARS[review.key].img.h}
                          sizes="44px"
                          alt=""
                          loading="lazy"
                          decoding="async"
                          class="h-full w-full object-cover grayscale"
                        />
                      </picture>
                    ) : null}
                  </button>
                ))}
              </div>
              <div class="flex items-center gap-3">
                <span class="bc-font-mono text-xs text-zinc-500">
                  {Math.min(
                    activeReview.value + 1,
                    Math.max(1, ratings.length),
                  )}{" "}
                  / {Math.max(1, ratings.length)}
                </span>
                <button
                  type="button"
                  aria-label="Previous verdict"
                  onClick$={() =>
                    (activeReview.value =
                      (activeReview.value - 1 + ratings.length) %
                      Math.max(1, ratings.length))
                  }
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-zinc-300 transition hover:border-white/50 hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 3L5 8l5 5"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next verdict"
                  onClick$={() =>
                    (activeReview.value =
                      (activeReview.value + 1) % Math.max(1, ratings.length))
                  }
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-zinc-300 transition hover:border-white/50 hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <blockquote class="bc-font-display mt-8 text-xl font-bold leading-snug text-white md:text-3xl">
              {quoteFor(activeQuote)}
            </blockquote>
            <cite class="bc-font-mono mt-6 block text-xs uppercase tracking-widest text-zinc-500">
              {activeQuote
                ? `${activeQuote.name} — ${activeQuote.detail}`
                : "no review"}
            </cite>
          </div>
        </div>
      </section>

      {/* Action: certified proof table */}
      <section id="proof" class="mx-auto max-w-6xl px-6 pt-16 pb-32 md:pt-6 ">
        <div class="max-w-2xl">
          <span class="bc-font-mono text-xs uppercase tracking-widest text-[#d97757]">
            Our promises, in writing
          </span>
          <h2 class="bc-font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Shop with confidence
          </h2>
          <p class="mt-4 text-base font-light text-zinc-300">
            Lifetime warranty, 60-day returns, and free US shipping over $150 —
            on every pan we hammer.
          </p>
        </div>

        <div class="bc-reveal mt-12 overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-xl">
          <table class="w-full min-w-[640px] text-left text-sm text-zinc-300">
            <thead class="border-b border-white/10 font-mono text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th scope="col" class="px-6 py-4">
                  Promise
                </th>
                <th scope="col" class="px-6 py-4">
                  Details
                </th>
                <th scope="col" class="px-6 py-4">
                  Where to find it
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              {PROOF.map((item) => (
                <tr
                  key={`${item.benchmark}-${item.value}`}
                  class="transition hover:bg-white/[0.03]"
                >
                  <td class="px-6 py-4 font-medium text-white">
                    {item.benchmark}
                  </td>
                  <td class="bc-font-mono px-6 py-4 font-bold text-[#d97757]">
                    {item.value}
                  </td>
                  <td class="px-6 py-4 text-xs text-zinc-400">
                    {item.sources.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Action: massive high-contrast CTA */}
      <section class="mx-auto max-w-6xl px-6 pb-32">
        <div class="bc-glass relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
          <div
            class="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d97757]/15 blur-3xl"
            aria-hidden="true"
          />
          <h2 class="bc-font-display relative z-10 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Your last set of pans
          </h2>
          <p class="relative z-10 mx-auto mt-4 max-w-xl text-base font-light text-zinc-300">
            In stock and shipping this week. Try it for 60 days — if you don't
            love cooking on copper, send it back.
          </p>
          <div class="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:atelier@businesscopper.shop?subject=Bespoke%20commission"
              class="bc-btn-primary rounded-full px-8 py-4 text-sm font-semibold tracking-wide"
            >
              Shop bestsellers
            </a>
            <a
              href="#reviews"
              class="bc-btn-secondary rounded-full px-8 py-4 text-sm font-medium tracking-wide"
            >
              Read owner reviews
            </a>
          </div>
        </div>
      </section>

      {/* Footer: minimal split */}
      <footer class="border-t border-white/10 bg-black/50 py-12">
        <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div class="flex flex-col items-center gap-1 text-center text-xs text-zinc-500 sm:flex-row sm:gap-3 sm:text-left">
            <span class="flex items-center gap-3">
              <span
                class="inline-block h-2 w-2 rounded-full bg-[#d97757]"
                aria-hidden="true"
              />
              <span class="font-bold text-white">BusinessCopper</span>
            </span>
            <span>· solid copper goods, hammered in small batches</span>
          </div>
          <div class="bc-font-mono flex items-center gap-6 text-xs text-zinc-500">
            <a href="#craft" class="transition hover:text-white">
              Shop
            </a>
            <a href="#reviews" class="transition hover:text-white">
              Reviews
            </a>
            <a href="#top" class="transition hover:text-white">
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
});

export const head: DocumentHead = {
  title: "BusinessCopper — Handcrafted solid-copper goods",
  meta: [
    {
      name: "description",
      content:
        "BusinessCopper: hand-raised solid-copper cookware, barware, and home goods. Independent reviews, certified assays, and bespoke commissions.",
    },
  ],
};
