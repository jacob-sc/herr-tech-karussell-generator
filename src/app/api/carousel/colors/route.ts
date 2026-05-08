/**
 * Parse a freeform CI description into:
 * { primaryColor: "#hex", fontPairingId: "modern" | ... }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

const PAIRING_IDS = ['editorial', 'modern', 'warm', 'technical', 'bold', 'classic', 'rounded'] as const

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY fehlt in .env.local — siehe README.' },
      { status: 500 },
    )
  }

  const { description } = await req.json()
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    messages: [{
      role: 'user',
      content: `Du bist ein Branding-Experte. Analysiere diese CI-Beschreibung und wähle eine Primärfarbe + passendes Font-Pairing für ein Instagram-Karussell-Tool.

CI-BESCHREIBUNG:
"""
${description}
"""

REGELN:
- primaryColor: Die markanteste/auffälligste Markenfarbe als Hex (z.B. #B598E2). Ignoriere Hintergrund-Weißtöne, Grau-Töne — wir brauchen die ECHTE Marken-Akzentfarbe.
- fontPairingId: Wähle das passendste Pairing aus:
    "editorial"   — Playfair Display + DM Sans (Serifen-Magazin-Look)
    "modern"      — Plus Jakarta Sans (clean, geometrisch, tech)
    "warm"        — Lora + Nunito Sans (einladend, soft, human)
    "technical"   — Space Grotesk (Developer-vibe, Mono-Flair)
    "bold"        — Fraunces + Outfit (expressive, maximale Präsenz)
    "classic"     — Libre Baskerville + Work Sans (zeitlos, seriös)
    "rounded"     — Bricolage Grotesque (playful, kreativ)

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
      primaryColor: parsed.primaryColor ?? '#B598E2',
      fontPairingId: pairingId,
    })
  } catch {
    return NextResponse.json({
      primaryColor: '#B598E2',
      fontPairingId: 'modern',
    })
  }
}
