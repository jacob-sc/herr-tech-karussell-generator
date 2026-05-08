'use client'

/**
 * Carousel Generator — Standalone-Version (kein Auth, kein Credit-System).
 *
 * 4:5 format (420×525 preview → 1080×1350 export)
 * 7-slide narrative arc with typed slides (hero/problem/solution/features/details/how-to/cta)
 * Single primary color → full brand palette via deriveBrandPalette()
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SLIDES,
  DEFAULT_FONT_PAIRING,
  FONT_PAIRINGS,
  type FontPairing,
  type Slide,
} from '@/lib/carousel/slides'
import {
  deriveBrandPalette,
  extractPrimaryColorFromImage,
} from '@/lib/carousel/palette'
import { SlideFrame, SLIDE_WIDTH, SLIDE_HEIGHT } from '@/components/carousel/SlideFrame'
import { downloadCarouselPngZip } from '@/lib/carousel/export-png'
import { exportCarouselAsPptx } from '@/lib/carousel/export-pptx'

// ─── Style Presets ──────────────────────────────────────────────────────────

interface StylePreset {
  id: string
  name: string
  emoji: string
  primaryColor: string
  fontPairingId: string
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'herrtech',  name: 'Herr Tech Lila', emoji: '💜', primaryColor: '#B598E2', fontPairingId: 'modern' },
  { id: 'editorial', name: 'Editorial',       emoji: '📖', primaryColor: '#8B5E3C', fontPairingId: 'editorial' },
  { id: 'tech',      name: 'Tech Blue',       emoji: '⚡', primaryColor: '#2563EB', fontPairingId: 'technical' },
  { id: 'warm',      name: 'Warm Coral',      emoji: '☕', primaryColor: '#E07A5F', fontPairingId: 'warm' },
  { id: 'bold',      name: 'Bold Red',        emoji: '💥', primaryColor: '#DC2626', fontPairingId: 'bold' },
  { id: 'classic',   name: 'Classic Navy',    emoji: '🏛️', primaryColor: '#1E3A8A', fontPairingId: 'classic' },
  { id: 'rounded',   name: 'Rounded Mint',    emoji: '🎨', primaryColor: '#14B8A6', fontPairingId: 'rounded' },
]

function useGoogleFont(query: string) {
  useEffect(() => {
    if (!query) return
    const id = 'carousel-gfont'
    document.getElementById(id)?.remove()
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`
    document.head.appendChild(link)
  }, [query])
}

function StylePresetTile({
  preset,
  selected,
  onClick,
}: {
  preset: StylePreset
  selected: boolean
  onClick: () => void
}) {
  const palette = useMemo(() => deriveBrandPalette(preset.primaryColor), [preset.primaryColor])
  const pairing = FONT_PAIRINGS.find(p => p.id === preset.fontPairingId) ?? DEFAULT_FONT_PAIRING
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
        selected ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'
      }`}
      style={{ background: palette.lightBg }}
    >
      <div style={{ height: 6, background: palette.brandPrimary, width: '100%' }} />
      <div style={{ padding: '10px 12px 4px' }}>
        <div style={{ height: 8, width: '60%', background: palette.brandPrimary, borderRadius: 3, marginBottom: 6, opacity: 0.9 }} />
        <div style={{ height: 5, width: '85%', background: '#000', borderRadius: 2, marginBottom: 4, opacity: 0.15 }} />
        <div style={{ height: 5, width: '70%', background: '#000', borderRadius: 2, opacity: 0.12 }} />
        <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
          {[palette.brandPrimary, palette.brandLight, palette.brandDark].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
          ))}
        </div>
      </div>
      <div className="px-3 pb-2.5">
        <p className="text-xs font-semibold" style={{ color: '#1a1a1a', opacity: 0.85 }}>
          {preset.emoji} {preset.name}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: '#1a1a1a', opacity: 0.45 }}>
          {pairing.emoji} {pairing.name}
        </p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </button>
  )
}

type CIMode = 'preset' | 'url' | 'manual' | 'text'

interface CISettings {
  primaryColor: string
  fontPairingId: string
  brandName: string
  handle: string
  slideCount: number
  logoUrl: string | null
}

function CISection({
  ci,
  setCi,
}: {
  ci: CISettings
  setCi: React.Dispatch<React.SetStateAction<CISettings>>
}) {
  const [mode, setMode] = useState<CIMode>('preset')
  const [selectedPresetId, setSelectedPresetId] = useState<string>(STYLE_PRESETS[0].id)
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [ciText, setCiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const applyPreset = useCallback((preset: StylePreset) => {
    setSelectedPresetId(preset.id)
    setCi((p) => ({ ...p, primaryColor: preset.primaryColor, fontPairingId: preset.fontPairingId }))
  }, [setCi])

  const extractFromUrl = useCallback(async () => {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError('')
    try {
      let url = urlInput.trim()
      if (!url.startsWith('http')) url = 'https://' + url
      const res = await fetch('/api/carousel/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) { setUrlError(data.error); return }
      setCi((p) => ({
        ...p,
        primaryColor: data.primaryColor ?? p.primaryColor,
        fontPairingId: data.fontPairingId ?? p.fontPairingId,
      }))
    } catch {
      setUrlError('URL konnte nicht geladen werden.')
    } finally {
      setUrlLoading(false)
    }
  }, [urlInput, setCi])

  const applyAiCI = useCallback(async () => {
    if (!ciText.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/carousel/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: ciText }),
      })
      const data = await res.json()
      setCi((p) => ({
        ...p,
        primaryColor: data.primaryColor ?? p.primaryColor,
        fontPairingId: data.fontPairingId ?? p.fontPairingId,
      }))
    } finally {
      setAiLoading(false)
    }
  }, [ciText, setCi])

  const handleLogoUpload = useCallback(async (file: File) => {
    const logoUrl = URL.createObjectURL(file)
    const color = await extractPrimaryColorFromImage(file)
    setCi((p) => ({ ...p, logoUrl, primaryColor: color }))
  }, [setCi])

  const tabs = [
    { id: 'preset' as CIMode, label: 'Stil wählen', icon: '✨' },
    { id: 'url' as CIMode, label: 'Website / Logo', icon: '🔗' },
    { id: 'manual' as CIMode, label: 'Manuell', icon: '🎨' },
    { id: 'text' as CIMode, label: 'CI-Text', icon: '✍️' },
  ]

  return (
    <div className="mb-6 border border-border rounded-xl overflow-hidden bg-surface-secondary">
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold text-foreground mb-3">Design & Corporate Identity</h3>
        <div className="flex gap-1 mb-4 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                mode === t.id ? 'bg-primary text-white' : 'text-muted hover:bg-surface hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        {mode === 'preset' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STYLE_PRESETS.map((p) => (
                <StylePresetTile
                  key={p.id}
                  preset={p}
                  selected={selectedPresetId === p.id}
                  onClick={() => applyPreset(p)}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <span className="text-xs text-muted shrink-0">Primärfarbe überschreiben:</span>
              <input
                type="color"
                value={ci.primaryColor}
                onChange={(e) => setCi((p) => ({ ...p, primaryColor: e.target.value }))}
                className="w-8 h-8 rounded-lg border border-border cursor-pointer shrink-0"
              />
              <span className="text-xs text-muted font-mono">{ci.primaryColor}</span>
            </div>
          </div>
        )}

        {mode === 'url' && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              Website-URL eingeben — Primärfarbe und Font-Pairing werden automatisch erkannt.
              Oder Logo hochladen für Farb-Extraktion.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && extractFromUrl()}
                placeholder="https://deine-website.de"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={extractFromUrl}
                disabled={urlLoading || !urlInput.trim()}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
              >
                {urlLoading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : '→'}
                Extrahieren
              </button>
            </div>
            {urlError && <p className="text-xs text-red-500">{urlError}</p>}
            <div className="border-t border-border pt-3">
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleLogoUpload(f)
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-border rounded-lg py-3 text-xs text-muted hover:border-primary/40 hover:bg-surface transition flex items-center justify-center gap-2"
              >
                {ci.logoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ci.logoUrl} className="h-6 object-contain rounded" alt="Logo" />
                    Anderes Logo wählen
                  </>
                ) : (
                  <>🖼️ Logo hochladen (wird auf Hero + CTA gezeigt)</>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted pt-1">
              <span>Aktuell:</span>
              <div
                className="w-5 h-5 rounded border border-black/10"
                style={{ background: ci.primaryColor }}
                title={ci.primaryColor}
              />
              <span className="font-mono">{ci.primaryColor}</span>
              <span>·</span>
              <span>{FONT_PAIRINGS.find((p) => p.id === ci.fontPairingId)?.name ?? 'Modern'}</span>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Primärfarbe (einziger Input — Palette wird abgeleitet)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={ci.primaryColor}
                  onChange={(e) => setCi((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="w-11 h-11 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={ci.primaryColor}
                  onChange={(e) => setCi((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-mono bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <PalettePreview primary={ci.primaryColor} />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Font-Pairing</label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_PAIRINGS.map((pair) => (
                  <button
                    key={pair.id}
                    onClick={() => setCi((p) => ({ ...p, fontPairingId: pair.id }))}
                    className={`text-left px-3 py-2 rounded-lg border transition ${
                      ci.fontPairingId === pair.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-surface'
                    }`}
                  >
                    <div className="text-xs font-semibold text-foreground">
                      {pair.emoji} {pair.name}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">{pair.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-3">
            <textarea
              value={ciText}
              onChange={(e) => setCiText(e.target.value)}
              placeholder={'Farben:\nPrimär: #B598E2 (Lila)\n\nStil:\nModern, clean, tech-forward\n\nFonts:\nSans-Serif, geometric'}
              rows={7}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono"
            />
            <button
              onClick={applyAiCI}
              disabled={aiLoading || !ciText.trim()}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  CI wird analysiert...
                </>
              ) : '✨ CI automatisch anwenden'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PalettePreview({ primary }: { primary: string }) {
  const palette = useMemo(() => deriveBrandPalette(primary), [primary])
  const tokens = [
    { color: palette.brandPrimary, label: 'Primary' },
    { color: palette.brandLight, label: 'Light' },
    { color: palette.brandDark, label: 'Dark' },
    { color: palette.lightBg, label: 'Light BG' },
    { color: palette.darkBg, label: 'Dark BG' },
  ]
  return (
    <div className="mt-3 flex items-center gap-2">
      {tokens.map((t) => (
        <div key={t.label} className="flex flex-col items-center gap-1">
          <div
            className="w-7 h-7 rounded-md border border-black/10"
            style={{ background: t.color }}
            title={`${t.label} · ${t.color}`}
          />
          <span className="text-[9px] text-muted">{t.label}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-14 h-7 rounded-md border border-black/10"
          style={{ background: palette.gradient }}
          title="Brand Gradient"
        />
        <span className="text-[9px] text-muted">Gradient</span>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function CarouselWorkflow() {
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [blogPost, setBlogPost] = useState('')
  const [ci, setCi] = useState<CISettings>({
    primaryColor: '#B598E2',
    fontPairingId: 'modern',
    brandName: '',
    handle: '',
    slideCount: 7,
    logoUrl: null,
  })
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES)
  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [refineHistory, setRefineHistory] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState('')
  const [activeSlide, setActiveSlide] = useState(0)
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const refineInputRef = useRef<HTMLTextAreaElement>(null)

  const pairing: FontPairing = useMemo(
    () => FONT_PAIRINGS.find((p) => p.id === ci.fontPairingId) ?? DEFAULT_FONT_PAIRING,
    [ci.fontPairingId],
  )
  const palette = useMemo(() => deriveBrandPalette(ci.primaryColor), [ci.primaryColor])

  useGoogleFont(pairing.googleFontsQuery)

  const generate = useCallback(async () => {
    if (!blogPost.trim()) return
    setLoading(true)
    setProgress('KI analysiert deinen Text...')
    try {
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogPost,
          slideCount: ci.slideCount,
          handle: ci.handle,
        }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Fehler: ${data.error}`)
        return
      }
      if (data.slides && Array.isArray(data.slides)) {
        setSlides(data.slides)
        setActiveSlide(0)
        setStep('preview')
      } else {
        alert('Fehler: Unerwartete Antwort der KI.')
      }
    } catch {
      alert('Fehler beim Generieren.')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }, [blogPost, ci.slideCount, ci.handle])

  const updateSlide = useCallback((i: number, updated: Slide) => {
    setSlides((s) => s.map((sl, idx) => (idx === i ? updated : sl)))
  }, [])

  const refineSlides = useCallback(async () => {
    if (!refineInput.trim() || refining) return
    const prompt = refineInput.trim()
    setRefining(true)
    setRefineInput('')
    try {
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refinePrompt: prompt,
          currentSlides: slides,
          currentPalette: { brandPrimary: ci.primaryColor },
        }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Fehler: ${data.error}`)
        return
      }
      if (data.slides) setSlides(data.slides)
      if (data.primaryColor) setCi((p) => ({ ...p, primaryColor: data.primaryColor }))
      setRefineHistory((h) => [...h, prompt])
      setActiveSlide(0)
    } catch {
      alert('Fehler beim Überarbeiten.')
    } finally {
      setRefining(false)
    }
  }, [refineInput, slides, ci.primaryColor, refining])

  const exportPng = useCallback(async () => {
    if (!slides.length) return
    setExporting(true)
    try {
      const container = slidesContainerRef.current
      if (!container) return
      await downloadCarouselPngZip({
        container,
        onProgress: (done, total) => setProgress(`Slide ${done} von ${total}...`),
      })
    } catch (err) {
      console.error(err)
      alert('Export fehlgeschlagen.')
    } finally {
      setExporting(false)
      setProgress('')
    }
  }, [slides])

  const exportPptxFn = useCallback(async () => {
    if (!slides.length) return
    setExporting(true)
    try {
      setProgress('PowerPoint erstellen...')
      await exportCarouselAsPptx({
        slides,
        palette,
        pairing,
        brandName: ci.brandName,
        handle: ci.handle,
      })
    } catch (err) {
      console.error(err)
      alert('Export fehlgeschlagen.')
    } finally {
      setExporting(false)
      setProgress('')
    }
  }, [slides, palette, pairing, ci.brandName, ci.handle])

  // ─── Input Step ────────────────────────────────────────────────────────────
  if (step === 'input') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">🎠 Karussell-Generator</h1>
          <p className="text-muted text-sm">
            Text rein — fertige 4:5 Instagram-Slides raus (Hero → Problem → Lösung → Features → CTA)
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Dein Text / Blogpost</label>
          <textarea
            value={blogPost}
            onChange={(e) => setBlogPost(e.target.value)}
            placeholder="Füge hier deinen Blogpost, LinkedIn-Artikel oder Text ein..."
            rows={10}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <CISection ci={ci} setCi={setCi} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs text-muted mb-1.5">Brand-Name (Logo)</label>
            <input
              type="text"
              value={ci.brandName}
              onChange={(e) => setCi((p) => ({ ...p, brandName: e.target.value }))}
              placeholder="Herr Tech"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">IG Handle (optional)</label>
            <input
              type="text"
              value={ci.handle}
              onChange={(e) => setCi((p) => ({ ...p, handle: e.target.value.replace('@', '') }))}
              placeholder="deinname"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Anzahl Slides: {ci.slideCount}</label>
            <input
              type="range"
              min={5}
              max={10}
              value={ci.slideCount}
              onChange={(e) => setCi((p) => ({ ...p, slideCount: Number(e.target.value) }))}
              className="w-full mt-2 accent-primary"
            />
            <div className="flex justify-between text-xs text-muted mt-0.5">
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !blogPost.trim()}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {progress}
            </>
          ) : (
            <>🎠 Karussell generieren</>
          )}
        </button>
      </div>
    )
  }

  // ─── Preview Step ──────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 pt-8 pb-24 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vorschau & Bearbeitung</h1>
          <p className="text-sm text-muted">
            {slides.length} Slides · Text anklicken zum Bearbeiten · Format 4:5 (1080×1350)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStep('input')}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-secondary transition"
          >
            ← Zurück
          </button>
          <button
            onClick={exportPptxFn}
            disabled={exporting}
            className="px-4 py-2 border border-border bg-surface text-sm font-medium rounded-lg hover:bg-surface-secondary transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting && progress.includes('Power') ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {progress}
              </>
            ) : '📊 Als .pptx'}
          </button>
          <button
            onClick={exportPng}
            disabled={exporting}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting && !progress.includes('Power') ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {progress}
              </>
            ) : '⬇ PNG ZIP'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-72 lg:shrink-0 lg:h-[585px] flex flex-col border border-border rounded-xl bg-surface overflow-hidden max-h-80 lg:max-h-none">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-xs font-semibold text-foreground">✏️ Slides anpassen</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {refineHistory.length === 0 ? (
              <div className="flex flex-col gap-1.5 mt-2">
                {[
                  '"Headlines kürzer machen"',
                  '"Auf Englisch übersetzen"',
                  '"CTA direkter machen"',
                  '"Primärfarbe zu Grün"',
                  '"Problem-Slide raus"',
                ].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setRefineInput(ex.replace(/"/g, ''))}
                    className="text-left text-xs text-muted px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:text-foreground hover:bg-surface-secondary transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            ) : (
              refineHistory.map((h, i) => (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-primary text-white text-xs leading-relaxed">
                    {h}
                  </div>
                </div>
              ))
            )}
            {refining && (
              <div className="flex items-center gap-2 text-xs text-muted px-1">
                <svg className="animate-spin w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Slides werden angepasst...
              </div>
            )}
          </div>
          <div className="px-3 py-3 border-t border-border shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={refineInputRef}
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    refineSlides()
                  }
                }}
                placeholder="Anpassung beschreiben..."
                rows={2}
                disabled={refining}
                className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted disabled:opacity-50"
              />
              <button
                onClick={refineSlides}
                disabled={refining || !refineInput.trim()}
                className="shrink-0 w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-center gap-3 w-full overflow-x-auto">
          <div
            className="rounded-2xl overflow-hidden shadow-xl border border-border mx-auto"
            style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
          >
            {slides[activeSlide] && (
              <SlideFrame
                slide={slides[activeSlide]}
                index={activeSlide}
                total={slides.length}
                palette={palette}
                headlineFont={pairing.headlineFont}
                bodyFont={pairing.bodyFont}
                headlineWeight={pairing.headlineWeight}
                bodyWeight={pairing.bodyWeight}
                brandName={ci.brandName}
                logoUrl={ci.logoUrl}
                handle={ci.handle}
                onEdit={(updated) => updateSlide(activeSlide, updated)}
              />
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-center w-full max-w-full">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                title={s.type}
                className={`w-11 h-11 rounded-xl border-2 text-[10px] font-semibold transition flex flex-col items-center justify-center ${
                  i === activeSlide
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-border text-muted hover:border-primary/40'
                }`}
              >
                <span>{i + 1}</span>
                <span className="text-[8px] opacity-60 leading-none mt-0.5">{s.type.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }} aria-hidden="true">
        <div ref={slidesContainerRef} style={{ display: 'flex', flexDirection: 'column' }}>
          {slides.map((slide, i) => (
            <SlideFrame
              key={i}
              slide={slide}
              index={i}
              total={slides.length}
              palette={palette}
              headlineFont={pairing.headlineFont}
              bodyFont={pairing.bodyFont}
              headlineWeight={pairing.headlineWeight}
              bodyWeight={pairing.bodyWeight}
              brandName={ci.brandName}
              logoUrl={ci.logoUrl}
              handle={ci.handle}
              isExport
            />
          ))}
        </div>
      </div>
    </div>
  )
}
