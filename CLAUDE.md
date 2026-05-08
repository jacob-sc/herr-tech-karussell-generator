# Karussell-Generator — Anweisung an Claude

> **Du bist hier, weil ein User dir den Repo-Link geteilt und gesagt hat: „Setz das lokal bei mir auf."**
> Diese Datei sagt dir, **wie du ihn Schritt für Schritt durchführst** — Beginner-Modus, jeder Klick erklärt.

## 0. Vor allem anderen: Claude-Code-Check

**Bist du gerade in Claude Code Desktop?**
- Wenn der User in **Claude Chat** (claude.ai) oder **Cowork** ist → STOPP. Sag ihm:
  > *„Für lokales Setup brauchst du Claude Code Desktop — nur dort kann ich Dateien auf deinem Rechner anfassen, Dependencies installieren und einen Dev-Server starten. Lade das hier runter: https://claude.ai/download. Wenn du installiert hast: Claude Code öffnen → **Code** → **Lokal** → wähl `~/claude/` aus. Wirf den Repo-Link dann nochmal hier rein."*
- Wenn er Claude Code Desktop noch nicht installiert hat → führ ihn durch die Installation, bevor du irgendwas anderes machst.

**Hat der User Node.js 18+ installiert?**
- Check: `node --version`
- Wenn < 18: führ ihn durch `nvm install 20` oder Download von [nodejs.org](https://nodejs.org)

**Hat der User ein globales `~/.claude/CLAUDE.md`?**
- Frag kurz, biete an es vorher anzulegen falls nicht.

## 1. Was wir hier tun — kurz erklären

> *„Wir setzen jetzt den Karussell-Generator lokal bei dir auf. Du wirfst später einen Text rein → das Tool baut dir 5–10 Instagram-Slides in deinem Branding. Setup dauert ~15 Minuten, davon 5 Min für API-Key holen.
>
> Kosten: Pro generiertes Karussell zahlst du ~5 Cent für die Anthropic-API. Sehr günstig — wir setzen aber trotzdem ein Monatslimit."*

## 2. Repo klonen

```bash
cd ~/claude
git clone <REPO-URL> karussell-generator
cd karussell-generator
```

Sag: *„Repo ist geklont. Jetzt holen wir den API-Key."*

## 3. Anthropic API Key holen — Schritt für Schritt

**Wichtig: Niemals raten oder Beispiel-Keys eintragen. Der User holt den Key selbst.**

Sag dem User:

> *„Folge diesen Schritten — ich warte hier:
>
> 1. Öffne https://console.anthropic.com (mit deinem Claude-Pro-Account einloggen)
> 2. Links unten: **Settings** → **API Keys** → **Create Key**
> 3. Name: `karussell-generator` → **Create**
> 4. Key kopieren — er beginnt mit `sk-ant-api03-...` und wird **nur einmal** angezeigt
> 5. Direkt danach: **Settings** → **Limits** → **Monthly spend limit** → z.B. **$10** setzen
>
> Sag mir Bescheid wenn du den Key hast."*

Warte. Wenn der User Probleme hat (Login, kein Pro-Account, Key wird nicht angezeigt), hilf ihm einzeln.

### Key eintragen

Wenn der User den Key in den Chat schickt:

```bash
cat > .env.local <<'EOF'
ANTHROPIC_API_KEY=<KEY-VOM-USER>
EOF
```

**Erkläre:** *„Die `.env.local` ist gitignored — dein Key bleibt auf deinem Rechner. Wenn du das Repo später teilst, gib niemals deine `.env.local` mit."*

## 4. Dependencies installieren

```bash
npm install
```

Erkläre: *„Lädt jetzt alle Code-Pakete runter (Next.js, React, Anthropic SDK, html2canvas, jszip, pptxgenjs für die Exports). Dauert 1–2 Minuten beim ersten Mal."*

## 5. Dev-Server starten

```bash
npm run dev
```

Sag: *„Dev-Server läuft jetzt auf Port 3000. Öffne im Browser: http://localhost:3000"*

## 6. Erste Nutzung mit dem User durchgehen

> *„Du siehst jetzt das Karussell-Tool. So gehst du durch:
>
> 1. **Text rein:** Wirf einen längeren Text rein — Blogpost, LinkedIn-Artikel, was du grad zu deinem Thema hast. Je mehr Substanz, desto besser die Slides.
> 2. **Stil wählen:** Im Design-Panel hast du 4 Tabs:
>    - **Stil wählen** — 7 vorgefertigte Presets (am schnellsten)
>    - **Website / Logo** — eigene Website-URL → Tool zieht sich Farbe + Font automatisch raus, oder Logo hochladen
>    - **Manuell** — Color-Picker + Font-Pairing selber wählen
>    - **CI-Text** — beschreib deine CI als Text, KI wählt
> 3. **Brand-Name + Handle** — werden auf Hero und CTA-Slide gezeigt
> 4. **Anzahl Slides:** 5–10 (default 7)
> 5. **„🎠 Karussell generieren"** — Generierung dauert 5–10 Sekunden
>
> Sag mir Bescheid wenn die Slides da sind oder was schiefgeht."*

## 7. Refinement-Loop erklären

Wenn die Slides da sind:

> *„Erste Version ist selten perfekt. Im Chat-Panel rechts kannst du anpassen — z.B. *‚Headlines kürzer machen'*, *‚CTA direkter'*, *‚auf Englisch übersetzen'*, *‚Primärfarbe Grün'*. Iterier 3–5×, dann sind die Slides scharf."*

## 8. Export

Wenn die Slides geschärft sind:

> *„Zwei Export-Optionen:
> - **PNG-ZIP** — alle Slides als 1080×1350 PNGs, direkt für Instagram
> - **.pptx** — PowerPoint, falls du noch in PowerPoint nachbearbeitest"*

## 9. Wenn alles läuft

Glückwunsch sagen. Drei Hinweise:

> *„Tool läuft. Drei Sachen zum Mitnehmen:
>
> 1. **Globales CLAUDE.md updaten:** Falls du dein Branding (Farben, Logo, Tonalität) noch nicht in deinem globalen `~/.claude/CLAUDE.md` hast, lass uns das jetzt nachziehen. Dann generiert das Tool beim nächsten Mal direkt in deinem Look — ohne dass du jedes Mal die CI manuell wählen musst.
> 2. **API-Key sichern:** Schreib den Key irgendwo hin (1Password, Notion). Wenn du den verlierst, musst du in der Anthropic-Console einen neuen erstellen.
> 3. **Custom-Erweiterungen:** Wenn du eigene Slide-Templates willst (z.B. ein „Quote"-Slide-Typ), sag mir — wir bauen das in `src/lib/carousel/slides.ts` ein."*

## Häufige Probleme + Lösungen

| Symptom | Ursache | Fix |
|---|---|---|
| `ANTHROPIC_API_KEY fehlt` | `.env.local` falsch oder nicht im Root | `cat .env.local` checken, Key reinschreiben |
| `Parse error` bei Generierung | Claude-Output war kein valides JSON | Nochmal versuchen, ggf. Input kürzen |
| Export hängt | Browser-Canvas blockt | Tab schließen, neu laden, nochmal versuchen |
| Schriften sehen falsch aus | Google Fonts blockiert | Internet-Verbindung prüfen |
| Slides leer / kaputt | Slide-Typ-Schema gebrochen | `console.log(slides)` und an User Screenshot anfordern |
| 401 von Anthropic | API-Key ungültig oder Spend-Cap erreicht | Console → API Keys / Limits prüfen |

## Architektur (für Power-User-Anpassungen)

- **`src/app/api/carousel/route.ts`** — Generate + Refine Endpoint, ruft Claude
- **`src/app/api/carousel/colors/route.ts`** — CI-Text → Primärfarbe + Font-Pairing
- **`src/app/api/carousel/extract-url/route.ts`** — Website-URL scrapen → Brand-Farbe extrahieren
- **`src/lib/carousel/slides.ts`** — Slide-Typen-Schema (hero/problem/solution/...) + Default-Slides
- **`src/lib/carousel/palette.ts`** — Primärfarbe → komplette Brand-Palette ableiten
- **`src/lib/carousel/export-png.ts`** — html2canvas + jszip
- **`src/lib/carousel/export-pptx.ts`** — pptxgenjs
- **`src/components/carousel/SlideFrame.tsx`** — die zentrale Slide-Render-Komponente

Wenn der User Slide-Typen anpassen will (z.B. neue Sektion einfügen, anderes Layout), führ ihn durch `slides.ts` (Schema) → API-Route (Prompt updaten) → `SlideFrame.tsx` (Render-Logik).

---

## 🎨 Branding-Frage — am Ende des Setups stellen

**Wichtig: Sobald das erste Karussell generiert ist, frag aktiv:**

> *„Das Tool hat aktuell Herr-Tech-Branding im UI:
> - Logo oben links + ‚/ karussell-generator' Subtext
> - Footer: ‚© herr.tech · Karussell-Generator · Built with Herr Tech Starter Tools'
> - Default-Style-Preset ‚Herr Tech Lila' (`#B598E2`) — kann auf jeden Slide neu gewählt werden
>
> Willst du das UI-Branding so behalten oder durch dein eigenes ersetzen?
>
> (Davon getrennt: das **Karussell-Output** wird ja eh in deinem Branding generiert — das ist über das CI-Panel im Tool steuerbar.)"*

### Wenn der User UI-Branding ändern will

Frag nach:
- **Brand-Name** (für Top-Bar-Text + Footer)
- **Primärfarbe** als Hex (z.B. `#FF3D7F`) — ersetzt das Lavendel im UI
- **Logo-Datei** (PNG/SVG, am besten transparenter Hintergrund, Höhe ~36px gut)
- **Domain** für Footer (z.B. `frau.tech` statt `herr.tech`)

### Was du touchen musst

- **`public/herr-tech-logo.png`** → durch User-Logo ersetzen (oder neues File anlegen + Pfad in `layout.tsx` updaten)
- **`src/app/layout.tsx`** → Top-Bar-Subtext + Footer-Text anpassen, Logo-Pfad evtl. ändern
- **`src/app/globals.css`** → CSS-Variable `--primary` (aktuell `#B598E2`) auf User-Primärfarbe setzen
- **`src/app/CarouselWorkflow.tsx`** → wenn der User auch das Default-Preset austauschen will: `STYLE_PRESETS[0]` anpassen oder eigenes Preset oben in die Liste setzen
- **`src/app/layout.tsx` Metadata `title`** → z.B. „Karussell-Generator — Frau Tech"

### Standard-Default behalten

Wenn der User „passt schon" sagt: nichts ändern. Das Branding ist dezent (kleines Logo + Footer-Zeile) und der Karussell-Output selbst ist immer in seinem CI dank des Style-Pickers.
