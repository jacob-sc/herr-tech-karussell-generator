/**
 * Brand Palette Derivation
 *
 * Generates a 6-token palette + brand gradient from a single primary color.
 * This is the heart of the "one color in, full design system out" philosophy —
 * the user picks one hex, we derive everything else via HSL manipulation.
 *
 * Tokens produced:
 *   BRAND_PRIMARY  — input as-is
 *   BRAND_LIGHT    — +20% lightness (for dark BG accents)
 *   BRAND_DARK     — -30% lightness (for gradient anchor)
 *   LIGHT_BG       — tinted off-white (hue-aware)
 *   LIGHT_BORDER   — LIGHT_BG -5% lightness
 *   DARK_BG        — near-black with subtle hue tint
 *   GRADIENT       — linear-gradient(165deg, BRAND_DARK, BRAND_PRIMARY, BRAND_LIGHT)
 */

export interface BrandPalette {
  brandPrimary: string
  brandLight: string
  brandDark: string
  lightBg: string
  lightBorder: string
  darkBg: string
  /** CSS gradient string, usable as `background` value */
  gradient: string
}

// ─── HSL Utilities ────────────────────────────────────────────────────────────

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace('#', '')
  const normalized = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned
  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)); break
      case g: h = (b - r) / delta + 2; break
      case b: h = (r - g) / delta + 4; break
    }
    h *= 60
  }

  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const hPrime = h / 60
  const x = c * (1 - Math.abs((hPrime % 2) - 1))
  let r = 0, g = 0, b = 0
  if (hPrime >= 0 && hPrime < 1) { r = c; g = x; b = 0 }
  else if (hPrime < 2) { r = x; g = c; b = 0 }
  else if (hPrime < 3) { r = 0; g = c; b = x }
  else if (hPrime < 4) { r = 0; g = x; b = c }
  else if (hPrime < 5) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  const m = lNorm - c / 2
  const toHex = (v: number) => {
    const scaled = Math.round((v + m) * 255)
    return Math.max(0, Math.min(255, scaled)).toString(16).padStart(2, '0')
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Clamp a number to [min, max]. */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

// ─── Palette Derivation ───────────────────────────────────────────────────────

/**
 * Derive a full brand palette from a single primary hex color.
 * Handles low-saturation (near-gray) inputs by falling back to neutral tints.
 */
export function deriveBrandPalette(primaryHex: string): BrandPalette {
  const { h, s, l } = hexToHsl(primaryHex)

  // Brand variations
  const brandPrimary = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`
  const brandLight = hslToHex(h, s, clamp(l + 20, 0, 92))
  const brandDark = hslToHex(h, s, clamp(l - 30, 6, 100))

  // Light BG: very pale tint with hue awareness.
  // Warm hues (0-60, 300-360) get a warmer off-white, cool hues get cooler.
  // Saturation stays very low so it reads as "neutral with personality".
  const lightBgSat = s < 10 ? 6 : Math.min(12, s * 0.15)
  const lightBg = hslToHex(h, lightBgSat, 97)
  const lightBorder = hslToHex(h, lightBgSat, 92)

  // Dark BG: near-black with subtle brand hue tint.
  const darkBgSat = s < 10 ? 8 : Math.min(18, s * 0.25)
  const darkBg = hslToHex(h, darkBgSat, 8)

  // Gradient: 165deg diagonal from dark → primary → light
  const gradient = `linear-gradient(165deg, ${brandDark} 0%, ${brandPrimary} 50%, ${brandLight} 100%)`

  return {
    brandPrimary,
    brandLight,
    brandDark,
    lightBg,
    lightBorder,
    darkBg,
    gradient,
  }
}

// ─── Image color extraction (ported from old CarouselWorkflow) ────────────────

/**
 * Extract dominant color from an uploaded image file.
 * Returns a single hex string suitable as input to `deriveBrandPalette()`.
 * Client-side only — uses <canvas> + <img>.
 */
export async function extractPrimaryColorFromImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 80
      canvas.height = 80
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); resolve('#B598E2'); return }
      ctx.drawImage(img, 0, 0, 80, 80)
      const data = ctx.getImageData(0, 0, 80, 80).data
      const freq: Record<string, number> = {}
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue
        const r = Math.round(data[i] / 24) * 24
        const g = Math.round(data[i + 1] / 24) * 24
        const b = Math.round(data[i + 2] / 24) * 24
        // Skip near-white and near-black — we want a brand color, not background
        if (r > 235 && g > 235 && b > 235) continue
        if (r < 20 && g < 20 && b < 20) continue
        const key = `${r},${g},${b}`
        freq[key] = (freq[key] || 0) + 1
      }
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
      URL.revokeObjectURL(url)
      if (!top) { resolve('#B598E2'); return }
      const [r, g, b] = top[0].split(',').map(Number)
      resolve(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('#B598E2')
    }
    img.src = url
  })
}
