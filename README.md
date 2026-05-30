# Fotocoach v0.1

AI-driven fotocoach som analyserar scoutingbilder och ger konkreta beslutsstöd på plats.

## Vad appen gör (v0.1)

- Ladda upp eller ta en bild direkt med mobilen
- Välj motivtyp och bildstil
- Appen skickar bilden till Anthropic (Claude) och analyserar den
- Du får ett tydligt verdict: **TA INTE** / **JUSTERA FÖRST** / **TA NU**
- Konkreta prioriterade råd direkt på plats
- Kompositionsbedömning, ljusbedömning, lärdom och checklista
- Sparar de senaste 8 analyserna lokalt i webbläsaren

---

## Kom igång lokalt

### Förutsättningar

- Node.js 18+
- En Anthropic API-nyckel (hämta på [console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
git clone https://github.com/DITT-ANVÄNDARNAMN/fotocoach.git
cd fotocoach
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i webbläsaren.

### Ange API-nyckel

Gå till **Inställningar** i appen och klistra in din Anthropic API-nyckel. Den sparas lokalt i webbläsaren och skickas bara till Anthropic vid analys.

---

## Driftsätt med Vercel

### Alternativ 1: Via Vercel-webbgränssnittet

1. Pusha projektet till GitHub
2. Gå till [vercel.com](https://vercel.com) och logga in
3. Klicka **Add New Project** → importera GitHub-repot
4. Vercel känner automatiskt igen Vite – klicka **Deploy**
5. Klart! Du får en publik URL

### Alternativ 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## Git-arbetsflöde

```bash
# Initiera git (första gången)
cd fotocoach
git init
git add .
git commit -m "feat: v0.1 - grundläggande bildanalys"

# Koppla till GitHub
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/fotocoach.git
git branch -M main
git push -u origin main
```

---

## Teknisk stack

| Del | Teknik |
|-----|--------|
| Framework | React 18 |
| Språk | TypeScript |
| Byggverktyg | Vite |
| Styling | Ren CSS (custom design system) |
| Lagring | localStorage |
| AI | Anthropic Messages API (Claude Sonnet 4) |
| Driftsättning | Vercel |

---

## Projektstruktur

```
src/
  components/
    ImagePicker.tsx        # Bildval (kamera/fil/drag-drop)
    AnalysisView.tsx       # Hela analysresultatet
    VerdictCard.tsx        # TA INTE / JUSTERA FÖRST / TA NU
    PriorityActions.tsx    # Prioriterade åtgärder
    CompositionCard.tsx    # Kompositionsbedömning
    LightCard.tsx          # Ljusbedömning
    HistoryList.tsx        # Historiklista
    SettingsPanel.tsx      # Inställningar
  services/
    anthropicClient.ts     # API-anrop till Anthropic
    imageUtils.ts          # Bildresizing och konvertering
    storage.ts             # localStorage-hantering
    jsonParser.ts          # Robust JSON-parsning
  types/
    analysis.ts            # Alla TypeScript-typer
    settings.ts            # AppSettings-typ
    history.ts             # HistoryItem-typ
  prompts/
    photoCoachPrompt.ts    # System- och användarprompt
  App.tsx                  # Huvudkomponent
  main.tsx                 # Entrypoint
  index.css                # Designsystem (CSS custom properties)
```

---

## Versionsplan

| Version | Fokus |
|---------|-------|
| **0.1** ✅ | Grundläggande bildanalys och verdict |
| 0.2 | Kameraråd för Sony a6700 |
| 0.3 | Objektiv jag äger |
| 0.4 | Aktuell fototur |
| 0.5 | Styrkor/svagheter per objektiv |
| 0.6 | Retake-läge |
| 0.7 | Visuella overlays |
| 0.8 | Gear-berikning |
| 0.9 | Personligt lärande |
| 1.0 | Stabil komplett fotocoach |

---

## Viktigt om API-nyckeln

- Nyckeln sparas **lokalt i webbläsaren** (localStorage)
- Nyckeln skickas **bara till Anthropic** vid analys
- Ingen backend — all kommunikation sker direkt från webbläsaren
- Du ansvarar själv för din nyckel och dina API-kostnader
- Det här är en MVP — lägg inte in nyckeln i en delad dator
