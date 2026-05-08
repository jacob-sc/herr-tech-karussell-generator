/**
 * Pill — rounded-rectangle tag component for slide decorations.
 * Used in problem-slides (strikethrough), details-slides (tags), etc.
 */

import type { CSSProperties } from 'react'

export function Pill({
  children,
  strikethrough = false,
  isDark = false,
  brandPrimary,
  style,
}: {
  children: React.ReactNode
  strikethrough?: boolean
  isDark?: boolean
  brandPrimary?: string
  style?: CSSProperties
}) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'}`,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
    position: 'relative',
    lineHeight: 1.2,
    ...style,
  }

  if (strikethrough) {
    return (
      <span style={baseStyle}>
        <span
          style={{
            textDecoration: 'line-through',
            textDecorationColor: brandPrimary ?? '#ef4444',
            textDecorationThickness: 2,
            opacity: 0.7,
          }}
        >
          {children}
        </span>
      </span>
    )
  }

  return <span style={baseStyle}>{children}</span>
}
