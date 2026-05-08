/**
 * StepRow — numbered step (01, 02, …) with title + description.
 * Used on how-to slides.
 */

import type { CSSProperties } from 'react'

export function StepRow({
  index,
  title,
  description,
  isDark = false,
  brandPrimary,
  brandLight,
  headlineFont,
  bodyFont,
  style,
}: {
  index: number  // zero-based; displayed as 01, 02, ...
  title: string
  description: string
  isDark?: boolean
  brandPrimary: string
  brandLight: string
  headlineFont: string
  bodyFont: string
  style?: CSSProperties
}) {
  const numColor = isDark ? brandLight : brandPrimary
  const titleColor = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'
  const descColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, ...style }}>
      <div
        style={{
          flexShrink: 0,
          fontFamily: headlineFont,
          fontWeight: 700,
          fontSize: 26,
          color: numColor,
          lineHeight: 1,
          minWidth: 36,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
        <div
          style={{
            fontFamily: headlineFont,
            fontWeight: 600,
            fontSize: 15,
            color: titleColor,
            marginBottom: 3,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: 12.5,
            color: descColor,
            lineHeight: 1.45,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  )
}
