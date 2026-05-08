/**
 * Slide type definitions for the Instagram Carousel Generator v2.
 *
 * Narrative arc (default 7 slides):
 *   1. hero      — Logo + Hook (LIGHT_BG)
 *   2. problem   — Status quo critique (DARK_BG)
 *   3. solution  — Our answer (Brand-Gradient)
 *   4. features  — List of benefits (LIGHT_BG)
 *   5. details   — Tags/specifics (DARK_BG)
 *   6. how-to    — Numbered steps (LIGHT_BG)
 *   7. cta       — Final call-to-action (Brand-Gradient, no swipe arrow)
 *
 * Background alternates light/dark/gradient to create visual rhythm
 * as the reader swipes through.
 */

export type SlideType =
  | 'hero'
  | 'problem'
  | 'solution'
  | 'features'
  | 'details'
  | 'how-to'
  | 'cta'

/** A slide's visual background treatment */
export type SlideBackground = 'light' | 'dark' | 'gradient'

export interface HeroSlide {
  type: 'hero'
  tagLabel: string           // uppercase mini-label, e.g. "NEUES TOOL"
  headline: string           // the hook
  hook: string               // supporting sentence
  showWatermark?: boolean
}

export interface ProblemSlide {
  type: 'problem'
  tagLabel: string           // e.g. "DAS PROBLEM"
  headline: string
  strikethroughPills: string[]  // e.g. ["Stundenlanges Editing", "Chaotische Prompts"]
}

export interface SolutionSlide {
  type: 'solution'
  tagLabel: string           // e.g. "DIE LÖSUNG"
  headline: string
  promptBox?: {              // optional quote/prompt highlight
    label: string
    quote: string
  }
}

export interface FeaturesSlide {
  type: 'features'
  tagLabel: string           // e.g. "FEATURES"
  headline: string
  features: Array<{
    icon: string             // single emoji or glyph
    label: string
    description: string
  }>
}

export interface DetailsSlide {
  type: 'details'
  tagLabel: string           // e.g. "IM DETAIL"
  headline: string
  tags: string[]             // pill-style tags
}

export interface HowToSlide {
  type: 'how-to'
  tagLabel: string           // e.g. "SO GEHT'S"
  headline: string
  steps: Array<{
    title: string
    description: string
  }>
}

export interface CtaSlide {
  type: 'cta'
  tagLabel?: string          // optional, e.g. "JETZT STARTEN"
  headline: string
  tagline: string            // subtitle under headline
  ctaText: string            // button text, e.g. "Zum Tool →"
}

export type Slide =
  | HeroSlide
  | ProblemSlide
  | SolutionSlide
  | FeaturesSlide
  | DetailsSlide
  | HowToSlide
  | CtaSlide

// ─── Background mapping ──────────────────────────────────────────────────────

/**
 * Returns the background treatment for each slide type.
 * Pinned by type (not index) so re-ordering slides keeps visual logic intact.
 */
export function backgroundForSlide(type: SlideType): SlideBackground {
  switch (type) {
    case 'hero':
    case 'features':
    case 'how-to':
      return 'light'
    case 'problem':
    case 'details':
      return 'dark'
    case 'solution':
    case 'cta':
      return 'gradient'
  }
}

// ─── Default 7-slide narrative template ──────────────────────────────────────

/**
 * Default slides used when user hasn't generated anything yet,
 * or as a fallback if API response is malformed.
 */
export const DEFAULT_SLIDES: Slide[] = [
  {
    type: 'hero',
    tagLabel: 'NEU',
    headline: 'Dein Titel hier',
    hook: 'Ein starker Hook, der den Scroll stoppt.',
    showWatermark: true,
  },
  {
    type: 'problem',
    tagLabel: 'DAS PROBLEM',
    headline: 'Was heute nicht funktioniert',
    strikethroughPills: ['Alter Weg 1', 'Alter Weg 2', 'Alter Weg 3'],
  },
  {
    type: 'solution',
    tagLabel: 'DIE LÖSUNG',
    headline: 'Ein besserer Ansatz',
    promptBox: { label: 'Beispiel', quote: '„Ein inspirierendes Zitat hier"' },
  },
  {
    type: 'features',
    tagLabel: 'FEATURES',
    headline: 'Was drin ist',
    features: [
      { icon: '⚡', label: 'Schnell', description: 'Beschreibung hier' },
      { icon: '🎯', label: 'Präzise', description: 'Beschreibung hier' },
      { icon: '✨', label: 'Schön', description: 'Beschreibung hier' },
    ],
  },
  {
    type: 'details',
    tagLabel: 'IM DETAIL',
    headline: 'Worauf es ankommt',
    tags: ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'],
  },
  {
    type: 'how-to',
    tagLabel: 'SO GEHT\u2019S',
    headline: 'In 3 Schritten',
    steps: [
      { title: 'Schritt 1', description: 'Beschreibung' },
      { title: 'Schritt 2', description: 'Beschreibung' },
      { title: 'Schritt 3', description: 'Beschreibung' },
    ],
  },
  {
    type: 'cta',
    tagLabel: 'JETZT STARTEN',
    headline: 'Bereit?',
    tagline: 'Lass uns loslegen.',
    ctaText: 'Zum Tool →',
  },
]

// ─── Font Pairings ────────────────────────────────────────────────────────────

export interface FontPairing {
  id: string
  name: string
  emoji: string
  headlineFont: string
  bodyFont: string
  headlineWeight: string
  bodyWeight: string
  googleFontsQuery: string
  /** Short description for UI */
  description: string
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    emoji: '📖',
    headlineFont: 'Playfair Display',
    bodyFont: 'DM Sans',
    headlineWeight: '700',
    bodyWeight: '400',
    googleFontsQuery: 'family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600',
    description: 'Magazin-Look mit Serifen-Headlines',
  },
  {
    id: 'modern',
    name: 'Modern',
    emoji: '✨',
    headlineFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    headlineWeight: '800',
    bodyWeight: '400',
    googleFontsQuery: 'family=Plus+Jakarta+Sans:wght@400;500;600;800',
    description: 'Clean, geometrisch, tech-forward',
  },
  {
    id: 'warm',
    name: 'Warm',
    emoji: '☕',
    headlineFont: 'Lora',
    bodyFont: 'Nunito Sans',
    headlineWeight: '700',
    bodyWeight: '400',
    googleFontsQuery: 'family=Lora:wght@600;700&family=Nunito+Sans:wght@400;600',
    description: 'Einladend, soft, human',
  },
  {
    id: 'technical',
    name: 'Technisch',
    emoji: '⚙️',
    headlineFont: 'Space Grotesk',
    bodyFont: 'Space Grotesk',
    headlineWeight: '700',
    bodyWeight: '400',
    googleFontsQuery: 'family=Space+Grotesk:wght@400;500;700',
    description: 'Monospace-Flair, Developer-vibe',
  },
  {
    id: 'bold',
    name: 'Bold',
    emoji: '💥',
    headlineFont: 'Fraunces',
    bodyFont: 'Outfit',
    headlineWeight: '800',
    bodyWeight: '400',
    googleFontsQuery: 'family=Fraunces:wght@700;900&family=Outfit:wght@400;500;600',
    description: 'Expressive Serifen, maximale Präsenz',
  },
  {
    id: 'classic',
    name: 'Klassisch',
    emoji: '🏛️',
    headlineFont: 'Libre Baskerville',
    bodyFont: 'Work Sans',
    headlineWeight: '700',
    bodyWeight: '400',
    googleFontsQuery: 'family=Libre+Baskerville:wght@700&family=Work+Sans:wght@400;500;600',
    description: 'Zeitlos, seriös, vertrauensvoll',
  },
  {
    id: 'rounded',
    name: 'Rounded',
    emoji: '🎨',
    headlineFont: 'Bricolage Grotesque',
    bodyFont: 'Bricolage Grotesque',
    headlineWeight: '700',
    bodyWeight: '400',
    googleFontsQuery: 'family=Bricolage+Grotesque:wght@400;500;700;800',
    description: 'Playful, kreativ, variable weights',
  },
]

export const DEFAULT_FONT_PAIRING = FONT_PAIRINGS[1] // Modern
