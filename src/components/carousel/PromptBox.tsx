/**
 * PromptBox — highlighted quote/prompt box used on solution slides.
 * Shows a small label above a prominent quote, usually with subtle border/bg.
 */

import type { CSSProperties } from 'react'

export function PromptBox({
  label,
  quote,
  isDark = false,
  onGradient = false,
  fontFamily,
  style,
}: {
  label: string
  quote: string
  isDark?: boolean
  onGradient?: boolean
  fontFamily: string
  style?: CSSProperties
}) {
  // Gradient background gets a semi-transparent white overlay.
  // Dark background gets a subtle white overlay.
  // Light background gets a subtle black border.
  const background = onGradient
    ? 'rgba(255,255,255,0.12)'
    : isDark
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.03)'
  const border = onGradient
    ? '1px solid rgba(255,255,255,0.25)'
    : isDark
      ? '1px solid rgba(255,255,255,0.15)'
      : '1px solid rgba(0,0,0,0.08)'
  const labelColor = onGradient || isDark
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(0,0,0,0.5)'
  const quoteColor = onGradient || isDark
    ? 'rgba(255,255,255,0.95)'
    : 'rgba(0,0,0,0.85)'

  return (
    <div
      style={{
        background,
        border,
        borderRadius: 14,
        padding: '14px 18px',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontFamily,
          color: labelColor,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          fontFamily,
          color: quoteColor,
          fontStyle: 'italic',
        }}
      >
        {quote}
      </div>
    </div>
  )
}
