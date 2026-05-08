/**
 * ProgressBar — bottom-edge progress indicator embedded in every slide.
 * 3px high track + filled portion reflecting (index+1)/total.
 * Plus a small "N / M" counter on the right side.
 */

import type { CSSProperties } from 'react'
import type { SlideBackground } from '@/lib/carousel/slides'

export function ProgressBar({
  index,
  total,
  bg,
  brandPrimary,
  fontFamily,
  style,
}: {
  index: number
  total: number
  bg: SlideBackground
  brandPrimary: string
  fontFamily: string
  style?: CSSProperties
}) {
  const pct = Math.min(100, Math.max(0, ((index + 1) / total) * 100))

  // Track + fill colors adapt to background
  const isLight = bg === 'light'
  const onGradient = bg === 'gradient'
  const trackColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'
  const fillColor = isLight ? brandPrimary : onGradient ? 'rgba(255,255,255,0.95)' : '#ffffff'
  const counterColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 3,
          background: trackColor,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: fillColor,
            transition: 'width 0.25s ease',
          }}
        />
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 9,
          fontWeight: 500,
          color: counterColor,
          letterSpacing: '0.1em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  )
}
