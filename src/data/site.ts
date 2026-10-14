// BusinessCopper dataset: the single source of truth for the storefront page.
// Scores are house-curated means across independent press and customer reviews
// (overall = mean of the five craft dimensions; value is scored separately and
// never counted toward the overall grade).

export interface CraftScores {
  craft: number;
  finish: number;
  purity: number;
  design: number;
  heritage: number;
  value: number;
  overall: number;
}

export type DimensionKey = "craft" | "finish" | "purity" | "design" | "heritage" | "value";

export interface Dimension {
  key: DimensionKey;
  label: string;
  short: string;
  description: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    key: "craft",
    label: "Build quality",
    short: "Build",
    description: "2.5mm solid copper, hand-raised and riveted — no warping, no hot spots.",
  },
  {
    key: "finish",
    label: "Tin lining & finish",
    short: "Finish",
    description: "Hand-wiped tin interior, polished exterior. Food-safe and re-tinnable for life.",
  },
  {
    key: "purity",
    label: "Copper purity",
    short: "Purity",
    description: "99.9% pure copper in every batch, assayed at the foundry. Heats fast and evenly.",
  },
  {
    key: "design",
    label: "Design",
    short: "Design",
    description: "Classic French shapes with stay-cool iron handles, balanced for daily cooking.",
  },
  {
    key: "heritage",
    label: "Warranty & repairs",
    short: "Warranty",
    description: "Lifetime warranty and in-house re-tinning. Send it back, we fix it.",
  },
  {
    key: "value",
    label: "Value for money",
    short: "Value",
    description: "Costs more than nonstick up front, cheaper per year — it lasts decades, not seasons.",
  },
];

export interface ProofItem {
  benchmark: string;
  value: string;
  sources: string[];
}

export interface ReviewRating {
  key: string;
  name: string;
  detail: string;
  quote: string;
  scores: CraftScores;
}

export const BUSINESS = {
  name: "BusinessCopper",
  short:
    "Solid-copper cookware, barware, and home goods — hand-hammered in our Ohio workshop, tinned for everyday cooking, and guaranteed for life.",
  scores: {
    craft: 96,
    finish: 94,
    purity: 98,
    design: 92,
    heritage: 95,
    value: 78,
    overall: 95,
  } as CraftScores,
  verified: "2026-10-01",
  meta: {
    leadTime: "Ships in 2–3 business days",
    collections: "Sauté Pans · Stockpots · Mugs & Barware",
    pricingTiers: ["Sauté pans from $180", "Moscow mule mugs from $65", "Free US shipping over $150"],
    tradeNote: "Chef & trade program — 15% off full kitchens",
  },
};

export interface Product {
  key: string;
  name: string;
  detail: string;
  price: number;
  rating: number;
  reviews: number;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    key: "saute-10",
    name: "10″ Sauté Pan",
    detail: "2.5mm copper · hand-wiped tin · iron handle",
    price: 180,
    rating: 4.9,
    reviews: 842,
    badge: "Best seller",
  },
  {
    key: "skillet-8",
    name: "8″ Skillet",
    detail: "2.5mm copper · hand-wiped tin · iron handle",
    price: 145,
    rating: 4.8,
    reviews: 517,
  },
  {
    key: "fry-12",
    name: "12″ Frying Pan",
    detail: "2.5mm copper · hand-wiped tin · helper loop",
    price: 220,
    rating: 4.9,
    reviews: 389,
  },
  {
    key: "stock-5",
    name: "5-Qt Stockpot",
    detail: "2.5mm copper · hand-wiped tin · lid included",
    price: 290,
    rating: 4.9,
    reviews: 204,
  },
];

export interface Spec {
  term: string;
  value: string;
}

export const SPECS: Spec[] = [
  { term: "Copper", value: "2.5mm solid, 99.9% pure, 92% recycled" },
  { term: "Lining", value: "Hand-wiped tin, food-safe, re-tinnable" },
  { term: "Handles", value: "Riveted iron — oven-safe to 600°F" },
  { term: "Stovetops", value: "Gas, electric & oven (not induction)" },
];

export const CARE_STEPS: string[] = [
  "Wash warm with soap, dry right away — never the dishwasher.",
  "Brighten with Bar Keeper's Friend when the copper dulls.",
  "Cook daily for decades; send it back for a fresh tin coat every 5–10 years ($45).",
];

export const REVIEWS: ReviewRating[] = [
  {
    key: "mara-ellison",
    name: "Mara Ellison",
    detail: "Executive chef, bought the 10-pc set · Cleveland, OH",
    quote:
      "Heats scary-even. My sauces stopped breaking and the pans still look new after a year on the line.",
    scores: { craft: 98, finish: 96, purity: 99, design: 95, heritage: 97, value: 74, overall: 97 },
  },
  {
    key: "hearth-journal",
    name: "Hearth & Journal",
    detail: "Gear editors, tested 12 copper pans",
    quote: "The BusinessCopper sauté was the only pan with zero hot spots in our jam test. Our pick for 2026.",
    scores: { craft: 97, finish: 95, purity: 98, design: 94, heritage: 96, value: 76, overall: 96 },
  },
  {
    key: "copper-review",
    name: "Copper Review Quarterly",
    detail: "Lab review, Fall 2026 issue",
    quote: "Assayed at 99.9% copper with the most even tin coat we measured. Built like heirloom stock.",
    scores: { craft: 95, finish: 93, purity: 98, design: 91, heritage: 94, value: 80, overall: 94.2 },
  },
  {
    key: "verified-owners",
    name: "2,300+ verified owners",
    detail: "Average 4.9 / 5 across the shop",
    quote: "Bought one skillet, came back for the whole wall. Packaging and care card were a nice touch.",
    scores: { craft: 94, finish: 92, purity: 97, design: 93, heritage: 95, value: 84, overall: 94.2 },
  },
  {
    key: "workshop-weekly",
    name: "Workshop Weekly",
    detail: "Maker profile, Sept 2026",
    quote: "A real working coppersmith shop — you can watch your pan being raised before it ships.",
    scores: { craft: 92, finish: 90, purity: 96, design: 89, heritage: 93, value: 82, overall: 92 },
  },
];

export const PROOF: ProofItem[] = [
  { benchmark: "Lifetime warranty", value: "Included", sources: ["Workshop warranty", "2,300+ owner reviews"] },
  { benchmark: "Free US shipping", value: "Orders $150+", sources: ["Shipping policy", "Checkout guarantee"] },
  { benchmark: "60-day returns", value: "No questions", sources: ["Returns policy", "Verified owners"] },
  { benchmark: "Restaurant kitchens", value: "240+ served", sources: ["Trade program", "Hearth & Journal"] },
  { benchmark: "Recycled copper", value: "92% content", sources: ["Foundry certificate", "Workshop charter"] },
];
