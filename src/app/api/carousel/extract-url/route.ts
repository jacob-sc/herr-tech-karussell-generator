/**
 * Extract brand primary color + font suggestion from a website URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const maxDuration = 30

const PAIRING_IDS = ['editorial', 'modern', 'warm', 'technical', 'bold', 'classic', 'rounded'] as const

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY fehlt in .env.local — siehe README.' },
      { status: 500 },
    )
  }

  const { url } = await req.json()

  let html = ''
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CarouselBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'URL konnte nicht geladen werden' }, { status: 400 })
  }

  const hexMatches = [...html.matchAll(/#([0-9a-fA-F]{6})\b/g)].map(m => m[0])
  const colorFreq: Record<string, number> = {}
  for (const c of hexMatches) {
    const lower = c.toLowerCase()
    const r = parseInt(lower.slice(1, 3), 16)
    const g = parseInt(lower.slice(3, 5), 16)
    const b = parseInt(lower.slice(5, 7), 16)
    if (r > 240 && g > 240 && b > 240) continue
    if (r < 20 && g < 20 && b < 20) continue
    const isGray = Math.max(r, g, b) - Math.min(r, g, b) < 20
    if (isGray) continue
    colorFreq[lower] = (colorFreq[lower] || 0) + 1
  }

  const topColors = Object.entries(colorFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([color]) => color)

  if (topColors.length === 0) {
    return NextResponse.json({ error: 'Keine Farben gefunden' }, { status: 400 })
  }

  const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i)
  const title = titleMatch?.[1] ?? ''
  const desc = descMatch?.[1] ?? ''

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    messages: [{
      role: 'user',
      content: `Du bist ein Branding-Experte. Analysiere die Website "${url}":

TITLE: ${title}
BESCHREIBUNG: ${desc}

Gefundene Farben (sortiert nach Häufigkeit):
${topColors.join(', ')}

Wähle:
1. primaryColor — die markanteste Markenfarbe aus der Liste (nicht Weiß/Grau)
2. fontPairingId — das passendste Font-Pairing:
    "editorial"   — Serifen-Magazin-Look
    "modern"      — clean, tech, geometrisch (DEFAULT für SaaS/Tech)
    "warm"        — einladend, Coaching, Human
    "technical"   — Developer/Tech
    "bold"        — expressive, laut, auffällig
    "classic"     — seriös, zeitlos (Recht, Finanzen)
    "rounded"     — playful, kreativ, Agentur

Gib NUR valides JSON zurück:
{ "primaryColor": "#hex", "fontPairingId": "modern" }`,
    }],
  })

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as { primaryColor?: string; fontPairingId?: string }
    const pairingId = PAIRING_IDS.includes(parsed.fontPairingId as typeof PAIRING_IDS[number])
      ? parsed.fontPairingId
      : 'modern'
    return NextResponse.json({
      primaryColor: parsed.primaryColor ?? topColors[0],
      fontPairingId: pairingId,
    })
  } catch {
    return NextResponse.json({
      primaryColor: topColors[0],
      fontPairingId: 'modern',
    })
  }
}
