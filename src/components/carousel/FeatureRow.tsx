/**
 * FeatureRow — a single icon + label + description row used on features slides.
 */

import type { CSSProperties } from 'react'

export function FeatureRow({
  icon,
  label,
  description,
  isDark = false,
  headlineFont,
  bodyFont,
  style,
}: {
  icon: string
  label: string
  description: string
  isDark?: boolean
  headlineFont: string
  bodyFont: string
  style?: CSSProperties
}) {
  const labelColor = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'
  const descColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, ...style }}>
      <div
        style={{
          flexShrink: 0,
          fontSize: 22,
          lineHeight: 1,
          width: 32,
          textAlign: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: headlineFont,
            fontWeight: 600,
            fontSize: 15,
            color: labelColor,
            marginBottom: 2,
            lineHeight: 1.25,
          }}
        >
          {label}
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
