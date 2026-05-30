import type { MotiveType, StylePreference, AnalysisTone, TechnicalLevel } from '../types/analysis';
import type { PhotoWalkSettings } from '../types/settings';
import { getCameraContext, getLensContext, SONY_LENSES } from '../data/cameraData';

export const SYSTEM_PROMPT = `Du är en erfaren fotograf, fotolärare och praktisk fotocoach. Du hjälper användaren att analysera en scoutingbild innan den riktiga bilden tas. Du ska svara på svenska. Du ska vara konkret, prioriterad och handlingsorienterad. Du ska bara returnera giltig JSON enligt angivet schema. Ingen markdown. Ingen text före eller efter JSON.

Du ska välja exakt ett verdict:
- TA_INTE: scenen är inte värd att fotografera just nu eller kräver större förändringar än enkla justeringar
- JUSTERA_FORST: scenen har potential men bör förbättras innan bilden tas
- TA_NU: scenen är tillräckligt stark och bör tas direkt

Prioritera råd som fotografen kan följa på plats:
- flytta sig
- ändra kamerahöjd
- ändra vinkel
- vänta på rörelse i scenen
- förenkla bakgrunden
- ändra utsnitt
- använda ljuset bättre
- placera motivet bättre
- vänta på bättre ögonblick
- välja annan beskärning

Undvik vaga råd. Skriv inte bara "förbättra kompositionen" eller "tänk på ljuset". Ge konkreta instruktioner.

Ge max 5 priorityActions. Varje action ska innehålla:
- action: konkret instruktion (skriv en specifik, handlingsklar mening)
- why: varför det förbättrar bilden
- impact: "high", "medium" eller "low"
- effort: "low", "medium" eller "high"
- timing: "now", "wait" eller "optional"

VIKTIGT för cameraAdvice:
- Om fotografen har angett vilket objektiv som sitter på kameran: prioritera det i första hand
- Om fotografen vill undvika objektivbyten: ge råd som fungerar med det monterade objektivet
- Om ett annat objektiv på turen vore bättre: nämn det men markera tydligt att det kräver byte
- Om inget objektivbyte finns tillgängligt: ge bästa råd med det som sitter på kameran
- Ge alltid konkreta inställningar specifika för Sony a6700

VIKTIGT för overlays:
- Alla koordinater är relativa till bildens bredd/höjd: 0.0 = vänsterkant/överkant, 1.0 = höger/nederkant
- subjectBox: markera huvudmotivet med en bounding box {x, y, w, h}
- distractionPoints: max 3 störande element, varje med {x, y, label}
- cropBox: föreslagen beskärning som bounding box {x, y, w, h} – utelämna om ingen beskärning behövs
- horizonY: estimerad horisonthöjd i bilden (0.0=topp, 1.0=botten) – utelämna om ingen klar horisont finns
- Var rimlig med koordinaterna – de ska spegla vad du faktiskt ser i bilden

Returnera alltid denna exakta JSON-struktur och ingenting annat:

{
  "verdict": "JUSTERA_FORST",
  "confidence": 0.82,
  "oneSentenceReason": "...",
  "sceneType": "...",
  "mainSubject": "...",
  "priorityActions": [
    {
      "rank": 1,
      "action": "...",
      "why": "...",
      "impact": "high",
      "effort": "low",
      "timing": "now"
    }
  ],
  "composition": {
    "overallScore": 6,
    "ruleOfThirds": "...",
    "leadingLines": "...",
    "foregroundMiddleBackground": "...",
    "backgroundCleanliness": "...",
    "negativeSpace": "...",
    "edgesAndDistractions": "...",
    "cropSuggestion": "..."
  },
  "light": {
    "overallScore": 7,
    "direction": "...",
    "quality": "...",
    "contrast": "...",
    "exposureRisk": "...",
    "whiteBalance": "...",
    "bestLightAction": "..."
  },
  "backgroundAndDistractions": "...",
  "whatAlreadyWorks": ["...", "..."],
  "learningPoint": "...",
  "nextShotChecklist": ["...", "...", "..."],
  "cameraAdvice": {
    "recommendedLens": "Tamron 70–180mm f/2.8 Di III VC VXD",
    "focalLengthReason": "...",
    "aperture": "f/2.8",
    "apertureReason": "...",
    "shutterSpeed": "1/500s",
    "shutterReason": "...",
    "iso": "ISO 400",
    "isoReason": "...",
    "focusMode": "AF-C med Real-time Tracking",
    "focusArea": "Tracking: Expand Spot",
    "focusModeReason": "...",
    "driveMode": "Enkelbild",
    "whiteBalance": "Auto",
    "fileFormat": "RAW",
    "extraTip": "..."
  },
  "overlays": {
    "subjectBox": { "x": 0.3, "y": 0.2, "w": 0.25, "h": 0.5 },
    "distractionPoints": [
      { "x": 0.85, "y": 0.3, "label": "Skylt" }
    ],
    "cropBox": { "x": 0.05, "y": 0.0, "w": 0.9, "h": 0.85 },
    "horizonY": 0.45
  }
}`;

function buildPhotoWalkContext(walk: PhotoWalkSettings | null): string {
  if (!walk || walk.activeLensIds.length === 0) return '';

  const packedLenses = SONY_LENSES.filter((l) => walk.activeLensIds.includes(l.id));
  const mountedLens = SONY_LENSES.find((l) => l.id === walk.mountedLensId);

  const lines: string[] = [];
  lines.push('─── AKTUELL FOTOTUR ────────────────────────────────');

  if (mountedLens) {
    lines.push(`Monterat objektiv (sitter på kameran nu): ${mountedLens.name} | ${mountedLens.focalLengthMm}mm | ${mountedLens.maxAperture} | Sweet spot: ${mountedLens.sweetSpotAperture}`);
  }

  if (packedLenses.length > 1) {
    const others = packedLenses.filter((l) => l.id !== walk.mountedLensId);
    lines.push(`Övriga objektiv med på turen: ${others.map((l) => l.name).join(', ')}`);
  }

  if (walk.avoidLensSwap) {
    lines.push('Fotografen vill UNDVIKA objektivbyten – prioritera råd för det monterade objektivet.');
  }
  if (walk.hasTriPod) lines.push('Stativ: ja');
  if (walk.hasFilters) lines.push('Filter: ja');
  if (walk.notes?.trim()) lines.push(`Turnotering: ${walk.notes}`);

  lines.push('────────────────────────────────────────────────────');
  return lines.join('\n');
}

export function buildUserPrompt(params: {
  motiveType: MotiveType;
  stylePreference: StylePreference;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
  photoWalk: PhotoWalkSettings | null;
}): string {
  const toneMap: Record<AnalysisTone, string> = {
    Uppmuntrande: 'Var varm och positiv i tonen men ändå tydlig och konkret med råden.',
    Balanserad: 'Var saklig och pedagogisk i tonen.',
    Rak: 'Var direkt och inte inlindad i tonen. Kom snabbt till poängen.',
  };

  const levelMap: Record<TechnicalLevel, string> = {
    Enkel: 'Undvik tekniska fototermer. Skriv som om du pratar med en nybörjare.',
    Normal: 'Använd vanliga fototermer men förklara dem kort när det behövs.',
    Avancerad: 'Använd exakt fotografiskt språk. Anta att användaren förstår fototermer.',
  };

  const cameraCtx = getCameraContext();
  const lensCtx = getLensContext();
  const walkCtx = buildPhotoWalkContext(params.photoWalk);

  return `Analysera den bifogade scoutingbilden.

Motivtyp: ${params.motiveType}
Önskad bildstil: ${params.stylePreference}
Ton: ${toneMap[params.analysisTone]}
Teknisk nivå: ${levelMap[params.technicalLevel]}

─── KAMERA ─────────────────────────────────────────
${cameraCtx}

─── ALLA TILLGÄNGLIGA OBJEKTIV ────────────────────
${lensCtx}
────────────────────────────────────────────────────
${walkCtx ? '\n' + walkCtx : ''}
Returnera din analys som JSON enligt exakt det schema du fick i systeminstruktionen.
Inkludera alltid ett fullständigt cameraAdvice-objekt med konkreta inställningar för Sony a6700.
Ingen annan text utanför JSON.`;
}

