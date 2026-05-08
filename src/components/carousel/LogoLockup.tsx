/**
 * LogoLockup — brand mark + name pairing.
 * Shows either an uploaded logo image OR a circular initial-badge in brand color.
 * Used on hero + cta slides.
 */

import type { CSSProperties } from 'react'
import type { SlideBackground } from '@/lib/carousel/slides'

export function LogoLockup({
  brandName,
  initial,
  iconUrl,
  bg,
  brandPrimary,
  brandLight,
  fontFamily,
  style,
}: {
  brandName: string
  initial?: string
  iconUrl?: string | null
  bg: SlideBackground
  brandPrimary: string
  brandLight: string
  fontFamily: string
  style?: CSSProperties
}) {
  const isLight = bg === 'light'
  const onGradient = bg === 'gradient'
  const displayInitial = (initial ?? brandName.charAt(0)).toUpperCase()
  const textColor = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)'
  const badgeBg = isLight ? brandPrimary : onGradient ? 'rgba(255,255,255,0.2)' : brandLight
  const badgeText = isLight ? '#ffffff' : onGradient ? '#ffffff' : brandPrimary

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconUrl}
          alt={brandName}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            objectFit: 'contain',
            flexShrink: 0,
            background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.12)',
          }}
        />
      ) : (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: badgeBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: onGradient ? '1px solid rgba(255,255,255,0.3)' : 'none',
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 16,
              fontWeight: 700,
              color: badgeText,
              lineHeight: 1,
            }}
          >
            {displayInitial}
          </span>
        </div>
      )}
      <span
        style={{
          fontFamily,
          fontSize: 15,
          fontWeight: 600,
          color: textColor,
          lineHeight: 1,
        }}
      >
        {brandName}
      </span>
    </div>
  )
}
