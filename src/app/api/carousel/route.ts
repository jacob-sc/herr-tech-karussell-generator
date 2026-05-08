/**
 * Carousel Generator API.
 *
 * Two modes:
 *   1. generate — blog post → 5-10 typed slides (7-slide narrative arc)
 *   2. refine   — prompt + current slides → updated slides (keeps types stable)
 *
 * Slide types: hero | problem | solution | features | details | how-to | cta
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const maxDuration = 60

const SCHEMA_DOC = `
Erlaubte Slide-Typen + Felder (JSON-Schema):

1. hero (Einstieg, LIGHT_BG)
   { "type": "hero", "tagLabel": "NEU", "headline": "...", "hook": "...", "showWatermark": true }

2. problem (Status-Quo-Kritik, DARK_BG)
   { "type": "problem", "tagLabel": "DAS PROBLEM", "headline": "...", "strikethroughPills": ["...", "...", "..."] }

3. solution (Die Lösung, Brand-Gradient)
   { "type": "solution", "tagLabel": "DIE LÖSUNG", "headline": "...", "promptBox": { "label": "Beispiel", "quote": "..." } }

4. features (LIGHT_BG)
   { "type": "features", "tagLabel": "FEATURES", "headline": "...", "features": [{ "icon": "⚡", "label": "...", "description": "..." }] }

5. details (DARK_BG)
   { "type": "details", "tagLabel": "IM DETAIL", "headline": "...", "tags": ["...", "...", "..."] }

6. how-to (LIGHT_BG, nummerierte Schritte)
   { "type": "how-to", "tagLabel": "SO GEHT'S", "headline": "...", "steps": [{ "title": "...", "description": "..." }] }

7. cta (Abschluss, Brand-Gradient, KEIN Swipe-Arrow)
   { "type": "cta", "tagLabel": "JETZT STARTEN", "headline": "...", "tagline": "...", "ctaText": "Zum Tool →" }
`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY fehlt in .env.local — siehe README.' },
      { status: 500 },
    )
  }

  const { blogPost, slideCount = 7, handle = '', refinePrompt, currentSlides, currentPalette } = await req.json()

  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    if (refinePrompt && currentSlides) {
      const { text } = await generateText({
        model: anthropic('claude-sonnet-4-5-20250929'),
        messages: [{
          role: 'user',
          content: `Du bist ein Social-Media-Experte. Hier sind die aktuellen Karussell-Slides und Brand-Farbe:

AKTUELLE SLIDES:
${JSON.stringify(currentSlides, null, 2)}

AKTUELLE PRIMÄRFARBE:
${currentPalette?.brandPrimary || '#B598E2'}

Aufgabe: Überarbeite entsprechend dieser Anweisung:
"${refinePrompt}"

${SCHEMA_DOC}

Regeln:
- Behalte die gleiche Anzahl Slides und Slide-Typen (außer explizit anders verlangt)
- Ändere nur was die Anweisung verlangt
- Farb-Anweisungen (z.B. "Primärfarbe Grün", "Blauer") → aktualisiere primaryColor als Hex
- Text-Anweisungen → aktualisiere die Slides

Gib NUR valides JSON zurück:
{
  "slides": [...],
  "primaryColor": "#hex"
}`,
        }],
      })
      try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return NextResponse.json(JSON.parse(cleaned))
      } catch {
        return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
      }
    }

    const count = Math.max(5, Math.min(10, Number(slideCount) || 7))

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages: [{
        role: 'user',
        content: `Du bist ein Social-Media-Experte für Instagram-Karussells. Baue aus diesem Text einen Karussell-Narrative-Arc mit genau ${count} Slides.

TEXT:
${blogPost}

${SCHEMA_DOC}

NARRATIVE-ARC-REGELN (WICHTIG):
- Slide 1 ist IMMER "hero" mit starkem Hook
- Letzte Slide ist IMMER "cta" mit klarem Call-to-Action
- Dazwischen wähle passende Typen: Nicht jeder Post braucht "problem". Bei How-To-Content kann "how-to" + "features" reichen. Bei Tool-Reviews sind "problem" + "solution" + "features" stark.
- Hintergründe wechseln sich von selbst ab (light/dark/gradient je nach Typ) — achte darauf, dass nicht 3× hintereinander derselbe Typ kommt
- Hook-Text max. 2 Sätze
- Pills/Tags max. 3 Wörter
- Feature/Step-Descriptions max. 12 Wörter
- Jeder tagLabel uppercase, max. 3 Wörter (z.B. "DAS PROBLEM", "SO GEHT'S", "FEATURES")
- ctaText kurz und aktionsorientiert (z.B. "Jetzt testen →", "Folgen für mehr")
${handle ? `- Wenn sinnvoll, erwähne @${handle} dezent` : ''}

Gib NUR valides JSON zurück, kein Text davor oder danach:
{
  "slides": [ /* ${count} Objekte gemäß Schema */ ]
}`,
      }],
    })

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const data = JSON.parse(cleaned)
      return NextResponse.json(data)
    } catch {
      return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[carousel] Fehler:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
