/**
 * SlideFrame — the master slide renderer.
 *
 * Takes a Slide + brand palette + fonts and renders the full 4:5 slide
 * with all embedded UI (progress bar, swipe arrow, tag label, content).
 *
 * Edit-mode: when onEdit is provided, text becomes click-to-edit.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { BrandPalette } from '@/lib/carousel/palette'
import type { Slide } from '@/lib/carousel/slides'
import { backgroundForSlide } from '@/lib/carousel/slides'
import { Pill } from './Pill'
import { TagLabel } from './TagLabel'
import { PromptBox } from './PromptBox'
import { FeatureRow } from './FeatureRow'
import { StepRow } from './StepRow'
import { ProgressBar } from './ProgressBar'
import { SwipeArrow } from './SwipeArrow'
import { LogoLockup } from './LogoLockup'

// ─── Sizing constants ────────────────────────────────────────────────────────
// Base layout is 420×525 (4:5). Preview + export both use this DOM tree —
// the PNG export scales via html2canvas scale factor, no layout reflow.
export const SLIDE_WIDTH = 420
export const SLIDE_HEIGHT = 525
export const SLIDE_PADDING = 36

// ─── Editable text helper ────────────────────────────────────────────────────

function EditableText({
  value,
  onChange,
  style,
  multiline = false,
  placeholder,
  isDark = false,
}: {
  value: string
  onChange?: (v: string) => void
  style?: CSSProperties
  multiline?: boolean
  placeholder?: string
  isDark?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) {
      if (multiline) textareaRef.current?.focus()
      else inputRef.current?.focus()
    }
  }, [editing, multiline])

  // If onChange isn't provided, we're in render-only mode (export path).
  if (!onChange) {
    return <span style={{ ...style, display: 'block', whiteSpace: 'pre-wrap' }}>{value}</span>
  }

  if (editing) {
    const editStyle: CSSProperties = {
      ...style,
      background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)',
      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)'}`,
      outline: 'none',
      borderRadius: 4,
      padding: '2px 4px',
      width: '100%',
      resize: 'none',
      fontFamily: 'inherit',
    }
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!multiline && e.key === 'Enter') setEditing(false)
      if (e.key === 'Escape') setEditing(false)
    }
    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={Math.max(2, value.split('\n').length)}
          style={editStyle}
        />
      )
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={editStyle}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Klicken zum Bearbeiten"
      style={{
        ...style,
        cursor: 'text',
        display: 'block',
        borderRadius: 4,
        padding: '2px 4px',
        transition: 'background 0.15s',
        whiteSpace: 'pre-wrap',
      }}
      className={isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}
    >
      {value || <span style={{ opacity: 0.4 }}>{placeholder}</span>}
    </span>
  )
}

// ─── Main SlideFrame ─────────────────────────────────────────────────────────

export interface SlideFrameProps {
  slide: Slide
  index: number
  total: number
  palette: BrandPalette
  headlineFont: string
  bodyFont: string
  headlineWeight?: string
  bodyWeight?: string
  brandName?: string
  logoUrl?: string | null
  handle?: string
  /** If provided, enables click-to-edit on text. Omit for static/export render. */
  onEdit?: (updated: Slide) => void
  /** True in PNG/PPTX export path — suppresses editing affordances. */
  isExport?: boolean
}

export function SlideFrame({
  slide,
  index,
  total,
  palette,
  headlineFont,
  bodyFont,
  headlineWeight = '700',
  bodyWeight = '400',
  brandName = '',
  logoUrl = null,
  handle = '',
  onEdit,
  isExport = false,
}: SlideFrameProps) {
  const bg = backgroundForSlide(slide.type)
  const isDark = bg === 'dark'
  const onGradient = bg === 'gradient'
  const isLast = index === total - 1

  // Container background per type
  let bgStyle: CSSProperties
  if (bg === 'light') {
    bgStyle = { background: palette.lightBg }
  } else if (bg === 'dark') {
    bgStyle = { background: palette.darkBg }
  } else {
    bgStyle = { background: palette.gradient }
  }

  const headlineColor = bg === 'light' ? 'rgba(0,0,0,0.92)' : '#ffffff'
  const bodyColor = bg === 'light' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)'

  const edit = !isExport ? onEdit : undefined

  const containerStyle: CSSProperties = {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: bodyFont,
    ...bgStyle,
  }

  const innerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    padding: SLIDE_PADDING,
    paddingBottom: SLIDE_PADDING + 16, // room for progress bar
    paddingRight: isLast ? SLIDE_PADDING : SLIDE_PADDING + 24, // room for swipe arrow
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }

  return (
    <div style={containerStyle} data-slide>
      {/* Content area */}
      <div style={innerStyle}>
        {renderSlideContent({
          slide,
          palette,
          bg,
          isDark,
          onGradient,
          headlineFont,
          bodyFont,
          headlineWeight,
          bodyWeight,
          headlineColor,
          bodyColor,
          brandName,
          logoUrl,
          handle,
          onEdit: edit,
        })}
      </div>

      {/* Embedded UI: progress bar */}
      <div
        style={{
          position: 'absolute',
          left: SLIDE_PADDING,
          right: SLIDE_PADDING,
          bottom: 18,
        }}
      >
        <ProgressBar
          index={index}
          total={total}
          bg={bg}
          brandPrimary={palette.brandPrimary}
          fontFamily={bodyFont}
        />
      </div>

      {/* Embedded UI: swipe arrow (not on last slide) */}
      {!isLast && <SwipeArrow bg={bg} />}
    </div>
  )
}

// ─── Per-type content renderers ──────────────────────────────────────────────

function renderSlideContent(args: {
  slide: Slide
  palette: BrandPalette
  bg: 'light' | 'dark' | 'gradient'
  isDark: boolean
  onGradient: boolean
  headlineFont: string
  bodyFont: string
  headlineWeight: string
  bodyWeight: string
  headlineColor: string
  bodyColor: string
  brandName: string
  logoUrl: string | null
  handle: string
  onEdit?: (updated: Slide) => void
}) {
  const {
    slide, palette, bg, isDark, onGradient,
    headlineFont, bodyFont, headlineWeight, bodyWeight,
    headlineColor, bodyColor, brandName, logoUrl, handle,
    onEdit,
  } = args

  const tagStyle: CSSProperties = { marginBottom: 14 }
  const h1Style: CSSProperties = {
    fontFamily: headlineFont,
    fontWeight: headlineWeight,
    fontSize: 34,
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    color: headlineColor,
    wordBreak: 'break-word',
    marginBottom: 14,
  }
  const hookStyle: CSSProperties = {
    fontFamily: bodyFont,
    fontWeight: bodyWeight,
    fontSize: 14.5,
    lineHeight: 1.55,
    color: bodyColor,
    wordBreak: 'break-word',
  }

  switch (slide.type) {
    case 'hero': {
      const s = slide
      return (
        <>
          {brandName && (
            <div style={{ marginBottom: 24 }}>
              <LogoLockup
                brandName={brandName}
                iconUrl={logoUrl}
                bg={bg}
                brandPrimary={palette.brandPrimary}
                brandLight={palette.brandLight}
                fontFamily={bodyFont}
              />
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={tagStyle}>
              <TagLabel
                bg={bg}
                brandPrimary={palette.brandPrimary}
                brandLight={palette.brandLight}
                fontFamily={bodyFont}
              >
                {onEdit ? (
                  <EditableText
                    value={s.tagLabel}
                    onChange={(v) => onEdit({ ...s, tagLabel: v })}
                    style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }}
                    isDark={isDark || onGradient}
                  />
                ) : s.tagLabel}
              </TagLabel>
            </div>
            {onEdit ? (
              <EditableText
                value={s.headline}
                onChange={(v) => onEdit({ ...s, headline: v })}
                style={h1Style}
                multiline
                isDark={isDark || onGradient}
              />
            ) : <h1 style={h1Style}>{s.headline}</h1>}
            {onEdit ? (
              <EditableText
                value={s.hook}
                onChange={(v) => onEdit({ ...s, hook: v })}
                style={hookStyle}
                multiline
                isDark={isDark || onGradient}
              />
            ) : <p style={hookStyle}>{s.hook}</p>}
          </div>
          {handle && s.showWatermark !== false && (
            <div
              style={{
                position: 'absolute',
                right: 18,
                bottom: 40,
                fontFamily: bodyFont,
                fontSize: 10,
                color: isDark || onGradient ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
              }}
            >
              @{handle}
            </div>
          )}
        </>
      )
    }

    case 'problem': {
      const s = slide
      return (
        <>
          <div style={{ marginTop: 12, marginBottom: 14 }}>
            <TagLabel bg={bg} brandPrimary={palette.brandPrimary} brandLight={palette.brandLight} fontFamily={bodyFont}>
              {onEdit ? (
                <EditableText value={s.tagLabel} onChange={(v) => onEdit({ ...s, tagLabel: v })} style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} isDark />
              ) : s.tagLabel}
            </TagLabel>
          </div>
          {onEdit ? (
            <EditableText value={s.headline} onChange={(v) => onEdit({ ...s, headline: v })} style={{ ...h1Style, fontSize: 30, marginBottom: 22 }} multiline isDark />
          ) : <h1 style={{ ...h1Style, fontSize: 30, marginBottom: 22 }}>{s.headline}</h1>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {s.strikethroughPills.map((p, i) => (
              <Pill key={i} strikethrough isDark brandPrimary={palette.brandPrimary}>
                {onEdit ? (
                  <EditableText
                    value={p}
                    onChange={(v) => {
                      const pills = [...s.strikethroughPills]
                      pills[i] = v
                      onEdit({ ...s, strikethroughPills: pills })
                    }}
                    style={{ display: 'inline-block', fontSize: 'inherit', color: 'inherit' }}
                    isDark
                  />
                ) : p}
              </Pill>
            ))}
          </div>
        </>
      )
    }

    case 'solution': {
      const s = slide
      return (
        <>
          <div style={{ marginTop: 12, marginBottom: 14 }}>
            <TagLabel bg={bg} brandPrimary={palette.brandPrimary} brandLight={palette.brandLight} fontFamily={bodyFont}>
              {onEdit ? (
                <EditableText value={s.tagLabel} onChange={(v) => onEdit({ ...s, tagLabel: v })} style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} isDark={onGradient} />
              ) : s.tagLabel}
            </TagLabel>
          </div>
          {onEdit ? (
            <EditableText value={s.headline} onChange={(v) => onEdit({ ...s, headline: v })} style={{ ...h1Style, marginBottom: 20 }} multiline isDark={onGradient} />
          ) : <h1 style={{ ...h1Style, marginBottom: 20 }}>{s.headline}</h1>}
          {s.promptBox && (
            <PromptBox
              label={s.promptBox.label}
              quote={s.promptBox.quote}
              onGradient={onGradient}
              isDark={isDark}
              fontFamily={bodyFont}
            />
          )}
        </>
      )
    }

    case 'features': {
      const s = slide
      return (
        <>
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <TagLabel bg={bg} brandPrimary={palette.brandPrimary} brandLight={palette.brandLight} fontFamily={bodyFont}>
              {onEdit ? (
                <EditableText value={s.tagLabel} onChange={(v) => onEdit({ ...s, tagLabel: v })} style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} />
              ) : s.tagLabel}
            </TagLabel>
          </div>
          {onEdit ? (
            <EditableText value={s.headline} onChange={(v) => onEdit({ ...s, headline: v })} style={{ ...h1Style, fontSize: 28, marginBottom: 22 }} multiline />
          ) : <h1 style={{ ...h1Style, fontSize: 28, marginBottom: 22 }}>{s.headline}</h1>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {s.features.map((f, i) => (
              <FeatureRow
                key={i}
                icon={f.icon}
                label={f.label}
                description={f.description}
                headlineFont={headlineFont}
                bodyFont={bodyFont}
              />
            ))}
          </div>
        </>
      )
    }

    case 'details': {
      const s = slide
      return (
        <>
          <div style={{ marginTop: 12, marginBottom: 14 }}>
            <TagLabel bg={bg} brandPrimary={palette.brandPrimary} brandLight={palette.brandLight} fontFamily={bodyFont}>
              {onEdit ? (
                <EditableText value={s.tagLabel} onChange={(v) => onEdit({ ...s, tagLabel: v })} style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} isDark />
              ) : s.tagLabel}
            </TagLabel>
          </div>
          {onEdit ? (
            <EditableText value={s.headline} onChange={(v) => onEdit({ ...s, headline: v })} style={{ ...h1Style, fontSize: 30, marginBottom: 22 }} multiline isDark />
          ) : <h1 style={{ ...h1Style, fontSize: 30, marginBottom: 22 }}>{s.headline}</h1>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {s.tags.map((t, i) => (
              <Pill key={i} isDark>
                {onEdit ? (
                  <EditableText
                    value={t}
                    onChange={(v) => {
                      const tags = [...s.tags]
                      tags[i] = v
                      onEdit({ ...s, tags })
                    }}
                    style={{ display: 'inline-block', fontSize: 'inherit', color: 'inherit' }}
                    isDark
                  />
                ) : t}
              </Pill>
            ))}
          </div>
        </>
      )
    }

    case 'how-to': {
      const s = slide
      return (
        <>
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <TagLabel bg={bg} brandPrimary={palette.brandPrimary} brandLight={palette.brandLight} fontFamily={bodyFont}>
              {onEdit ? (
                <EditableText value={s.tagLabel} onChange={(v) => onEdit({ ...s, tagLabel: v })} style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} />
              ) : s.tagLabel}
            </TagLabel>
          </div>
          {onEdit ? (
            <EditableText value={s.headline} onChange={(v) => onEdit({ ...s, headline: v })} style={{ ...h1Style, fontSize: 28, marginBottom: 22 }} multiline />
          ) : <h1 style={{ ...h1Style, fontSize: 28, marginBottom: 22 }}>{s.headline}</h1>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {s.steps.map((st, i) => (
              <StepRow
                key={i}
                index={i}
                title={st.title}
                description={st.description}
                brandPrimary={palette.brandPrimary}
                brandLight={palette.brandLight}
                headlineFont={headlineFont}
                bodyFont={bodyFont}
              />
            ))}
          </div>
        </>
      )
    }

    case 'cta': {
      const s = slide
      return (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            {brandName && (
              <div style={{ marginBottom: 24 }}>
                <LogoLockup
                  brandName={brandName}
                  iconUrl={logoUrl}
                  bg={bg}
                  brandPrimary={palette.brandPrimary}
                  brandLight={palette.brandLight}
                  fontFamily={bodyFont}
                />
              </div>
            )}
            {s.tagLabel && (
              <div style={{ marginBottom: 12 }}>
                <TagLabel bg={bg} brandPrimary={palette.brandPrimary} brandLight={palette.brandLight} fontFamily={bodyFont}>
                  {onEdit ? (
                    <EditableText value={s.tagLabel} onChange={(v) => onEdit({ ...s, tagLabel: v })} style={{ fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} isDark />
                  ) : s.tagLabel}
                </TagLabel>
              </div>
            )}
            {onEdit ? (
              <EditableText value={s.headline} onChange={(v) => onEdit({ ...s, headline: v })} style={{ ...h1Style, textAlign: 'center', marginBottom: 10 }} multiline isDark />
            ) : <h1 style={{ ...h1Style, textAlign: 'center', marginBottom: 10 }}>{s.headline}</h1>}
            {onEdit ? (
              <EditableText value={s.tagline} onChange={(v) => onEdit({ ...s, tagline: v })} style={{ ...hookStyle, textAlign: 'center', marginBottom: 24 }} multiline isDark />
            ) : <p style={{ ...hookStyle, textAlign: 'center', marginBottom: 24 }}>{s.tagline}</p>}
            <div
              style={{
                display: 'inline-block',
                padding: '11px 26px',
                borderRadius: 999,
                background: '#ffffff',
                color: palette.brandPrimary,
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 14,
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              }}
            >
              {onEdit ? (
                <EditableText value={s.ctaText} onChange={(v) => onEdit({ ...s, ctaText: v })} style={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', display: 'inline-block' }} />
              ) : s.ctaText}
            </div>
          </div>
        </>
      )
    }
  }
}
