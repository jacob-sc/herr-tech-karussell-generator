/**
 * TagLabel — uppercase mini-label above the headline on every slide.
 * Color adapts to background: brandPrimary on light, brandLight on dark,
 * rgba-white on gradient.
 */

import type { CSSProperties } from 'react'
import type { SlideBackground } from '@/lib/carousel/slides'

export function TagLabel({
  children,
  bg,
  brandPrimary,
  brandLight,
  fontFamily,
  style,
}: {
  children: React.ReactNode
  bg: SlideBackground
  brandPrimary: string
  brandLight: string
  fontFamily: string
  style?: CSSProperties
}) {
  let color: string
  if (bg === 'light') color = brandPrimary
  else if (bg === 'dark') color = brandLight
  else color = 'rgba(255,255,255,0.85)'

  return (
    <span
      style={{
        display: 'inline-block',
        textTransform: 'uppercase',
        fontSize: 10,
        letterSpacing: '0.2em',
        fontWeight: 600,
        fontFamily,
        color,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
