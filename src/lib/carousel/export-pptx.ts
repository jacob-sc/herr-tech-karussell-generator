/**
 * PPTX export for Instagram Carousel slides.
 *
 * Produces a 4:5 PowerPoint (4"x5" layout) with editable shapes, text, and
 * pills — suitable for Canva import. Each Slide type gets its own renderer.
 *
 * NOTE: PowerPoint has no first-class gradient-fill-from-three-colors, so we
 * use pptxgenjs's gradient fill approximation (two-stop) or solid + overlay.
 * Fonts are passed by name — Canva substitutes if the font isn't installed.
 */

import type { BrandPalette } from './palette'
import type {
  Slide,
  SlideType,
  FontPairing,
} from './slides'

// ─── Layout constants ────────────────────────────────────────────────────────
// pptxgenjs uses inches. 4×5 inches at 270dpi = 1080×1350 px — perfect IG post.
const LAYOUT_W = 4
const LAYOUT_H = 5
const PAD = 0.35
const CONTENT_W = LAYOUT_W - PAD * 2
const CONTENT_RIGHT_WITH_ARROW = LAYOUT_W - PAD - 0.3

export interface ExportPptxOptions {
  slides: Slide[]
  palette: BrandPalette
  pairing: FontPairing
  brandName?: string
  handle?: string
  filename?: string
}

export async function exportCarouselAsPptx(opts: ExportPptxOptions): Promise<void> {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'IG_VERTICAL', width: LAYOUT_W, height: LAYOUT_H })
  pptx.layout = 'IG_VERTICAL'

  const { slides, palette, pairing, brandName = '', handle = '' } = opts
  const hex = (c: string) => c.replace('#', '')

  slides.forEach((slide, i) => {
    const pSlide = pptx.addSlide()
    const isLast = i === slides.length - 1
    const bg = backgroundForSlideType(slide.type)

    // Background
    if (bg === 'light') {
      pSlide.background = { color: hex(palette.lightBg) }
    } else if (bg === 'dark') {
      pSlide.background = { color: hex(palette.darkBg) }
    } else {
      // Gradient approximation: solid primary + overlay shape
      pSlide.background = { color: hex(palette.brandPrimary) }
      // Overlay gradient anchor: dark on top-left, light on bottom-right
      pSlide.addShape('rect', {
        x: 0, y: 0, w: LAYOUT_W, h: LAYOUT_H,
        fill: {
          type: 'gradient',
          color1: hex(palette.brandDark),
          color2: hex(palette.brandLight),
          angle: 165,
        } as never, // pptxgenjs types are incomplete; runtime accepts this
      })
    }

    renderSlide(pptx, pSlide, slide, i, slides.length, {
      palette, pairing, brandName, handle, bg, isLast,
    })
  })

  await pptx.writeFile({ fileName: opts.filename ?? 'karussell.pptx' })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type BgType = 'light' | 'dark' | 'gradient'

function backgroundForSlideType(type: SlideType): BgType {
  switch (type) {
    case 'hero': case 'features': case 'how-to': return 'light'
    case 'problem': case 'details': return 'dark'
    case 'solution': case 'cta': return 'gradient'
  }
}

function headlineColorFor(bg: BgType): string {
  return bg === 'light' ? '111111' : 'FFFFFF'
}

function bodyColorFor(bg: BgType): string {
  return bg === 'light' ? '555555' : 'E5E5E5'
}

function tagColorFor(bg: BgType, palette: BrandPalette): string {
  if (bg === 'light') return palette.brandPrimary.replace('#', '')
  if (bg === 'dark') return palette.brandLight.replace('#', '')
  return 'FFFFFFCC' as unknown as string // fallback — pptxgenjs ignores alpha in some contexts
}

// ─── Per-slide renderer ──────────────────────────────────────────────────────

interface RenderCtx {
  palette: BrandPalette
  pairing: FontPairing
  brandName: string
  handle: string
  bg: BgType
  isLast: boolean
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function renderSlide(
  pptx: any,
  pSlide: any,
  slide: Slide,
  i: number,
  total: number,
  ctx: RenderCtx,
): void {
  const { palette, pairing, brandName, handle, bg, isLast } = ctx
  const hex = (c: string) => c.replace('#', '')
  const headlineColor = headlineColorFor(bg)
  const bodyColor = bodyColorFor(bg)
  const tagColor = tagColorFor(bg, palette)

  const contentTop = 0.55
  const bottomAreaY = LAYOUT_H - 0.5

  // ─── Shared: Progress Bar (bottom) ─────────────────────────────────────────
  const progressY = LAYOUT_H - 0.3
  const progressW = LAYOUT_W - PAD * 2 - 0.5
  const pct = (i + 1) / total
  // Track
  pSlide.addShape('rect', {
    x: PAD, y: progressY, w: progressW, h: 0.035,
    fill: { color: bg === 'light' ? 'E5E5E5' : 'FFFFFF', transparency: bg === 'light' ? 0 : 80 },
    line: { type: 'none' } as never,
  })
  // Fill
  pSlide.addShape('rect', {
    x: PAD, y: progressY, w: progressW * pct, h: 0.035,
    fill: { color: bg === 'light' ? hex(palette.brandPrimary) : 'FFFFFF' },
    line: { type: 'none' } as never,
  })
  // Counter
  pSlide.addText(
    `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
    {
      x: LAYOUT_W - PAD - 0.45, y: progressY - 0.04, w: 0.45, h: 0.15,
      fontSize: 7, fontFace: pairing.bodyFont,
      color: bg === 'light' ? '555555' : 'CCCCCC',
      align: 'right', charSpacing: 2,
    },
  )

  // ─── Shared: Swipe Arrow (except last) ─────────────────────────────────────
  if (!isLast) {
    pSlide.addText('›', {
      x: LAYOUT_W - 0.35, y: LAYOUT_H / 2 - 0.2, w: 0.3, h: 0.4,
      fontSize: 28, fontFace: 'Arial', bold: true,
      color: bg === 'light' ? '888888' : 'FFFFFF',
      align: 'center', valign: 'middle',
      transparency: bg === 'light' ? 40 : 30,
    })
  }

  // ─── Type-specific content ─────────────────────────────────────────────────
  switch (slide.type) {
    case 'hero': {
      // Brand lockup
      if (brandName) {
        pSlide.addText(brandName, {
          x: PAD, y: PAD, w: CONTENT_W, h: 0.3,
          fontSize: 12, bold: true, fontFace: pairing.bodyFont,
          color: headlineColor,
        })
      }
      // Tag
      pSlide.addText(slide.tagLabel.toUpperCase(), {
        x: PAD, y: LAYOUT_H * 0.35, w: CONTENT_W, h: 0.2,
        fontSize: 8, bold: true, fontFace: pairing.bodyFont,
        color: tagColor, charSpacing: 4,
      })
      // Headline
      pSlide.addText(slide.headline, {
        x: PAD, y: LAYOUT_H * 0.4, w: CONTENT_W, h: 1.3,
        fontSize: 28, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, lineSpacingMultiple: 1.1, wrap: true,
      })
      // Hook
      pSlide.addText(slide.hook, {
        x: PAD, y: LAYOUT_H * 0.65, w: CONTENT_W, h: 0.9,
        fontSize: 12, fontFace: pairing.bodyFont,
        color: bodyColor, lineSpacingMultiple: 1.4, wrap: true,
      })
      if (handle && slide.showWatermark !== false) {
        pSlide.addText(`@${handle}`, {
          x: LAYOUT_W - PAD - 1.2, y: bottomAreaY - 0.3, w: 1.2, h: 0.2,
          fontSize: 8, fontFace: pairing.bodyFont,
          color: bg === 'light' ? '999999' : 'AAAAAA',
          align: 'right', transparency: 30,
        })
      }
      break
    }

    case 'problem': {
      pSlide.addText(slide.tagLabel.toUpperCase(), {
        x: PAD, y: contentTop, w: CONTENT_W, h: 0.2,
        fontSize: 8, bold: true, fontFace: pairing.bodyFont,
        color: tagColor, charSpacing: 4,
      })
      pSlide.addText(slide.headline, {
        x: PAD, y: contentTop + 0.3, w: CONTENT_W, h: 1.2,
        fontSize: 24, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, lineSpacingMultiple: 1.15, wrap: true,
      })
      // Pills (stacked vertically, strikethrough)
      const pillStartY = contentTop + 1.7
      slide.strikethroughPills.forEach((p, idx) => {
        const pillY = pillStartY + idx * 0.42
        pSlide.addShape('roundRect', {
          x: PAD, y: pillY, w: Math.min(CONTENT_W, p.length * 0.08 + 0.4), h: 0.34,
          fill: { color: 'FFFFFF', transparency: 92 },
          line: { color: 'FFFFFF', width: 0.5, transparency: 80 },
          rectRadius: 0.17,
        })
        pSlide.addText(p, {
          x: PAD + 0.15, y: pillY, w: Math.min(CONTENT_W, p.length * 0.08 + 0.4) - 0.3, h: 0.34,
          fontSize: 11, fontFace: pairing.bodyFont,
          color: 'FFFFFF', strike: 'sngStrike' as never, transparency: 15,
          valign: 'middle',
        })
      })
      break
    }

    case 'solution': {
      pSlide.addText(slide.tagLabel.toUpperCase(), {
        x: PAD, y: contentTop, w: CONTENT_W, h: 0.2,
        fontSize: 8, bold: true, fontFace: pairing.bodyFont,
        color: 'FFFFFF', charSpacing: 4, transparency: 15,
      })
      pSlide.addText(slide.headline, {
        x: PAD, y: contentTop + 0.3, w: CONTENT_W, h: 1.4,
        fontSize: 26, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, lineSpacingMultiple: 1.15, wrap: true,
      })
      if (slide.promptBox) {
        const boxY = contentTop + 1.9
        pSlide.addShape('roundRect', {
          x: PAD, y: boxY, w: CONTENT_W, h: 1.3,
          fill: { color: 'FFFFFF', transparency: 88 },
          line: { color: 'FFFFFF', width: 0.5, transparency: 70 },
          rectRadius: 0.12,
        })
        pSlide.addText(slide.promptBox.label.toUpperCase(), {
          x: PAD + 0.2, y: boxY + 0.15, w: CONTENT_W - 0.4, h: 0.2,
          fontSize: 7, bold: true, fontFace: pairing.bodyFont,
          color: 'FFFFFF', charSpacing: 3, transparency: 30,
        })
        pSlide.addText(slide.promptBox.quote, {
          x: PAD + 0.2, y: boxY + 0.4, w: CONTENT_W - 0.4, h: 0.8,
          fontSize: 13, italic: true, fontFace: pairing.bodyFont,
          color: 'FFFFFF', lineSpacingMultiple: 1.4, wrap: true,
        })
      }
      break
    }

    case 'features': {
      pSlide.addText(slide.tagLabel.toUpperCase(), {
        x: PAD, y: contentTop, w: CONTENT_W, h: 0.2,
        fontSize: 8, bold: true, fontFace: pairing.bodyFont,
        color: tagColor, charSpacing: 4,
      })
      pSlide.addText(slide.headline, {
        x: PAD, y: contentTop + 0.3, w: CONTENT_W, h: 1.1,
        fontSize: 22, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, lineSpacingMultiple: 1.15, wrap: true,
      })
      const featStartY = contentTop + 1.55
      const featGap = Math.min(0.7, (LAYOUT_H - featStartY - 0.8) / slide.features.length)
      slide.features.forEach((f, idx) => {
        const y = featStartY + idx * featGap
        // Icon
        pSlide.addText(f.icon, {
          x: PAD, y, w: 0.4, h: 0.4,
          fontSize: 18, fontFace: 'Arial', color: headlineColor, align: 'left',
        })
        // Label
        pSlide.addText(f.label, {
          x: PAD + 0.45, y, w: CONTENT_W - 0.45, h: 0.22,
          fontSize: 12, bold: true, fontFace: pairing.headlineFont,
          color: headlineColor,
        })
        // Description
        pSlide.addText(f.description, {
          x: PAD + 0.45, y: y + 0.24, w: CONTENT_W - 0.45, h: 0.28,
          fontSize: 9.5, fontFace: pairing.bodyFont,
          color: bodyColor, wrap: true, lineSpacingMultiple: 1.35,
        })
      })
      break
    }

    case 'details': {
      pSlide.addText(slide.tagLabel.toUpperCase(), {
        x: PAD, y: contentTop, w: CONTENT_W, h: 0.2,
        fontSize: 8, bold: true, fontFace: pairing.bodyFont,
        color: tagColor, charSpacing: 4,
      })
      pSlide.addText(slide.headline, {
        x: PAD, y: contentTop + 0.3, w: CONTENT_W, h: 1.2,
        fontSize: 24, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, lineSpacingMultiple: 1.15, wrap: true,
      })
      const tagStartY = contentTop + 1.7
      let x = PAD
      let y = tagStartY
      const rowH = 0.4
      const gap = 0.1
      slide.tags.forEach((t) => {
        const w = Math.min(CONTENT_W, t.length * 0.08 + 0.4)
        if (x + w > LAYOUT_W - PAD) { x = PAD; y += rowH + gap }
        pSlide.addShape('roundRect', {
          x, y, w, h: 0.34,
          fill: { color: 'FFFFFF', transparency: 92 },
          line: { color: 'FFFFFF', width: 0.5, transparency: 80 },
          rectRadius: 0.17,
        })
        pSlide.addText(t, {
          x: x + 0.15, y, w: w - 0.3, h: 0.34,
          fontSize: 10, fontFace: pairing.bodyFont,
          color: 'FFFFFF', valign: 'middle', transparency: 10,
        })
        x += w + gap
      })
      break
    }

    case 'how-to': {
      pSlide.addText(slide.tagLabel.toUpperCase(), {
        x: PAD, y: contentTop, w: CONTENT_W, h: 0.2,
        fontSize: 8, bold: true, fontFace: pairing.bodyFont,
        color: tagColor, charSpacing: 4,
      })
      pSlide.addText(slide.headline, {
        x: PAD, y: contentTop + 0.3, w: CONTENT_W, h: 1.1,
        fontSize: 22, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, lineSpacingMultiple: 1.15, wrap: true,
      })
      const stepStartY = contentTop + 1.55
      const stepGap = Math.min(0.7, (LAYOUT_H - stepStartY - 0.8) / slide.steps.length)
      slide.steps.forEach((st, idx) => {
        const y = stepStartY + idx * stepGap
        pSlide.addText(String(idx + 1).padStart(2, '0'), {
          x: PAD, y, w: 0.5, h: 0.5,
          fontSize: 24, bold: true, fontFace: pairing.headlineFont,
          color: hex(palette.brandPrimary),
        })
        pSlide.addText(st.title, {
          x: PAD + 0.55, y: y + 0.02, w: CONTENT_W - 0.55, h: 0.24,
          fontSize: 12, bold: true, fontFace: pairing.headlineFont,
          color: headlineColor,
        })
        pSlide.addText(st.description, {
          x: PAD + 0.55, y: y + 0.26, w: CONTENT_W - 0.55, h: 0.3,
          fontSize: 9.5, fontFace: pairing.bodyFont,
          color: bodyColor, wrap: true, lineSpacingMultiple: 1.35,
        })
      })
      break
    }

    case 'cta': {
      const centerY = LAYOUT_H / 2
      if (brandName) {
        pSlide.addText(brandName, {
          x: PAD, y: centerY - 1.2, w: CONTENT_W, h: 0.3,
          fontSize: 13, bold: true, fontFace: pairing.bodyFont,
          color: 'FFFFFF', align: 'center',
        })
      }
      if (slide.tagLabel) {
        pSlide.addText(slide.tagLabel.toUpperCase(), {
          x: PAD, y: centerY - 0.85, w: CONTENT_W, h: 0.2,
          fontSize: 8, bold: true, fontFace: pairing.bodyFont,
          color: 'FFFFFF', charSpacing: 4, align: 'center', transparency: 20,
        })
      }
      pSlide.addText(slide.headline, {
        x: PAD, y: centerY - 0.55, w: CONTENT_W, h: 0.8,
        fontSize: 28, bold: true, fontFace: pairing.headlineFont,
        color: headlineColor, align: 'center', lineSpacingMultiple: 1.15, wrap: true,
      })
      pSlide.addText(slide.tagline, {
        x: PAD, y: centerY + 0.25, w: CONTENT_W, h: 0.5,
        fontSize: 13, fontFace: pairing.bodyFont,
        color: bodyColor, align: 'center', lineSpacingMultiple: 1.4, wrap: true,
      })
      // CTA pill
      const ctaY = centerY + 0.85
      pSlide.addShape('roundRect', {
        x: LAYOUT_W / 2 - 1, y: ctaY, w: 2, h: 0.45,
        fill: { color: 'FFFFFF' },
        line: { type: 'none' } as never,
        rectRadius: 0.22,
      })
      pSlide.addText(slide.ctaText, {
        x: LAYOUT_W / 2 - 1, y: ctaY, w: 2, h: 0.45,
        fontSize: 12, bold: true, fontFace: pairing.bodyFont,
        color: hex(palette.brandPrimary), align: 'center', valign: 'middle',
      })
      break
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
