# 🎠 Karussell-Generator

Web-Tool, lokal auf deinem Rechner. Du wirfst einen Text rein → fertiges Instagram-Karussell raus, in deinem Branding. **90 Sekunden statt 30 Minuten Canva.**

## Was das ist

- 5–10 Slides im 4:5-Instagram-Format (1080×1350)
- Narrative-Arc: Hero → Problem → Lösung → Features → Details → How-To → CTA
- Komplette Brand-Palette wird aus **einer** Primärfarbe abgeleitet
- 7 Style-Presets oder eigene CI (Website-URL, Logo-Upload, manuelle Farbe, oder freier Text)
- Export als **PNG-ZIP** (für Instagram-Upload) oder **PowerPoint** (für eigene Edits)
- Slides nachträglich per Chat anpassen — *„Headlines kürzer machen"*, *„auf Englisch übersetzen"*, *„CTA direkter"*

## Was du brauchst

- **Claude Code Desktop** — [claude.ai/download](https://claude.ai/download)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Anthropic API Key** — siehe Setup
- 15 Minuten Zeit

## Kosten

Pro Karussell-Generierung: **~5 Cent** für die Anthropic-API. Beim Refinen: nochmal ~3 Cent. Setz dir trotzdem ein Spend-Cap, ist nie verkehrt.

---

## Setup in 5 Schritten

### 1. Repo klonen

In **Claude Code Desktop** sagst du:

> *„Setz das Karussell-Generator Tool lokal bei mir auf: https://github.com/jacob-sc/herr-tech-karussell-generator"*

Claude klont das Repo nach `~/claude/karussell-generator/` und führt dich durch die nächsten Schritte.

> ℹ️ Falls du gerade in **Claude Chat** oder **Cowork** bist: erst Claude Code Desktop öffnen.

### 2. Anthropic API Key holen

1. Geh zu [console.anthropic.com](https://console.anthropic.com)
2. Login (mit deinem Claude-Account)
3. Links unten: **Settings** → **API Keys** → **Create Key**
4. Name: `karussell-generator` → **Create**
5. Key kopieren (beginnt mit `sk-ant-api03-...`) — du siehst ihn nur einmal!
6. **Spend-Cap setzen:** Settings → Limits → Monthly Spend Cap → z.B. $10

### 3. Key eintragen

Sag Claude einfach:

> *„Mein Anthropic-Key: \[Key]"*

Claude trägt ihn in `.env.local` ein (gitignored, kommt nie auf GitHub).

### 4. Dependencies installieren

```bash
npm install
```

Dauert 1–2 Minuten beim ersten Mal.

### 5. Dev-Server starten

```bash
npm run dev
```

Browser öffnen: **http://localhost:3000**

## Erste Nutzung

1. **Text reinwerfen** — Blogpost, LinkedIn-Artikel, beliebiger Text mit Substanz
2. **Brand-Stil** wählen — Preset, eigene Website-URL, Logo hochladen, oder CI als Text beschreiben
3. **Brand-Name + Handle** eintragen (für Logo-Lockup auf den Slides)
4. **Anzahl Slides** wählen (5–10)
5. **„🎠 Karussell generieren"** klicken — dauert 5–10 Sekunden

Du siehst eine Vorschau. Du kannst:
- **Text direkt anklicken** zum Bearbeiten
- **Im Chat-Panel rechts** Anpassungen anweisen — *„Headlines kürzer"*, *„CTA-Button mit anderem Wortlaut"*
- **Als PNG-ZIP exportieren** — direkt auf Instagram hochladen
- **Als .pptx exportieren** — in PowerPoint weiterbearbeiten

## Tipps für gute Karussells

- **Text-Input matters:** Mit langem Blogpost werden die Slides besser. Knapper Tweet → generische Slides.
- **Iterativ arbeiten:** Erste Version ist nie perfekt. 3–5 Refinements im Chat-Panel sind normal.
- **Brand-Konsistenz:** Logo + Handle eintragen → werden auf Hero + CTA gezeigt.
- **Farbe entscheidet alles:** Der ganze Look hängt an der Primärfarbe. Spiel mit dem Color-Picker.

## Troubleshooting

**„ANTHROPIC_API_KEY fehlt"?**
`.env.local` checken (sollte im Projekt-Root liegen). Sag Claude: *„API-Key fehlt im Tool, leg die .env.local an."*

**Generierung schlägt fehl mit „Parse error"?**
Claude hat manchmal Probleme bei sehr langen Texten. Sag dem Tool-Claude: *„Fehler beim Generieren — versuch's nochmal mit kürzerem Input."*

**Export läuft nicht durch?**
PNG-Export braucht funktionierenden Browser-Canvas. Kein Headless-Mode. Wenn's hängt: Tab schließen, neu laden, nochmal versuchen.

**Schriften sehen anders aus als im Preset?**
Google Fonts werden über CDN geladen — funktioniert bei Internet-Verbindung. Offline → Fallback-System-Font.

---

> Teil von [Herr Tech Starter Tools](../README.md) — Modul 3 vom Claude Code Starter Paket.
