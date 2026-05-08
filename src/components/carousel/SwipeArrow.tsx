/**
 * SwipeArrow — right-edge chevron signaling "swipe for more".
 * Fades out at edge via a subtle gradient behind it.
 * Omitted on the last slide (CTA).
 */

import type { CSSProperties } from 'react'
import type { SlideBackground } from '@/lib/carousel/slides'

export function SwipeArrow({
  bg,
  style,
}: {
  bg: SlideBackground
  style?: CSSProperties
}) {
  const isLight = bg === 'light'
  const color = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)'
  const fadeFrom = isLight ? 'rgba(245,240,235,0)' : 'rgba(0,0,0,0)'
  const fadeTo = isLight ? 'rgba(245,240,235,0.4)' : 'rgba(0,0,0,0.25)'

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(to right, ${fadeFrom}, ${fadeTo})`,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </div>
  )
}
