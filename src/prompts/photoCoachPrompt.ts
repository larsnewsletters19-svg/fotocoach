import type { MotiveType, StylePreference, AnalysisTone, TechnicalLevel } from '../types/analysis';
import type { PhotoWalkSettings, CameraType } from '../types/settings';
import { getCameraContext, getLensContext, SONY_LENSES } from '../data/cameraData';
import { getMobileCamera, getMobileCameraContext, getMobileLensContext } from '../data/mobileCameraData';

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

VIKTIGT för lightroomAdjustments:
- Ge konkreta, hjälpsamma efterbearbetningsförslag anpassade efter vad du ser i just denna bild
- whiteBalanceTemp: uppskatta rätt färgtemperatur i Kelvin (2000–50000) utifrån bildens nuvarande ljus
- whiteBalanceTint: grön/magenta-balans, oftast nära 0 om inget uppenbart färgfel finns
- exposure: föreslå EV-justering om bilden är över- eller underexponerad (annars 0)
- highlights/shadows/whites/blacks: motverka clipping och förstärk dynamik baserat på histogrammet du kan bedöma visuellt
- clarity: positiv för att förstärka textur/struktur, negativ för mjukare känsla (porträtt)
- dehaze: positiv om bilden har dis/dimma att skära igenom, annars 0
- vibrance/saturation: små justeringar för att förstärka färg utan att göra bilden onaturlig
- reasoning: en kort mening på svenska som förklarar huvudtanken bakom justeringarna
- Alla numeriska värden ska vara rimliga och matcha vad bilden faktiskt behöver – inte alltid samma standardvärden

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
  },
  "lightroomAdjustments": {
    "whiteBalanceTemp": 5500,
    "whiteBalanceTint": 0,
    "exposure": 0.3,
    "contrast": 10,
    "highlights": -40,
    "shadows": 20,
    "whites": -10,
    "blacks": 5,
    "clarity": 5,
    "dehaze": 0,
    "vibrance": 10,
    "saturation": 0,
    "reasoning": "..."
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

function buildMobileWalkContext(walk: PhotoWalkSettings | null): string {
  if (!walk) return '';
  const lines: string[] = ['─── AKTUELL FOTOTUR ────────────────────────────────'];
  if (walk.hasTriPod) lines.push('Stativ: ja (bra för lång exponering och nattbilder)');
  if (walk.hasFilters) lines.push('Filter: ja');
  if (walk.notes?.trim()) lines.push(`Turnotering: ${walk.notes}`);
  lines.push('────────────────────────────────────────────────────');
  return lines.join('\n');
}

function buildCameraSection(cameraType: CameraType, walk: PhotoWalkSettings | null): string {
  if (cameraType === 'sony-a6700') {
    const cameraCtx = getCameraContext();
    const lensCtx = getLensContext();
    const walkCtx = walk && walk.activeLensIds.length > 0 ? '\n' + buildPhotoWalkContext(walk) : '';
    return `─── KAMERA ─────────────────────────────────────────
${cameraCtx}

─── ALLA TILLGÄNGLIGA OBJEKTIV ────────────────────
${lensCtx}
────────────────────────────────────────────────────${walkCtx}

För cameraAdvice: ge råd specifika för Sony a6700 med dess objektiv. fileFormat ska alltid vara "RAW".`;
  }

  const mobile = getMobileCamera(cameraType);
  if (!mobile) return '';
  const cameraCtx = getMobileCameraContext(mobile);
  const lensCtx = getMobileLensContext(mobile);
  const walkCtx = walk ? '\n' + buildMobileWalkContext(walk) : '';

  return `─── KAMERA ─────────────────────────────────────────
${cameraCtx}

─── TILLGÄNGLIGA LINSER ───────────────────────────
${lensCtx}
────────────────────────────────────────────────────${walkCtx}

För cameraAdvice med mobil:
- recommendedLens: ange vilken lins/zoom som passar scenen bäst
- aperture: ange mobilkamerans fasta bländare för vald lins
- shutterSpeed: ge rekommendation (t.ex. "Auto eller 1/500s i Pro-läge")
- iso: ge rekommendation (t.ex. "Auto, max ISO 800")
- focusMode: t.ex. "AE/AF-lock på motivet" eller "Kontinuerlig AF"
- focusArea: t.ex. "Tryck på motivet för att låsa fokus"
- driveMode: t.ex. "Volymknappen som slutare" eller "Självutlösare 2s"
- whiteBalance: t.ex. "Auto" eller "Skugga"
- fileFormat: "${mobile.id === 'iphone-16' ? 'ProRAW' : 'RAW (DNG) via Pro-läge'}"
- extraTip: ge ett specifikt tips för ${mobile.brand} ${mobile.model}
- Om mobilkameran passar scenen bättre än en systemkamera, säg det tydligt i oneSentenceReason`;
}

export function buildUserPrompt(params: {
  motiveType: MotiveType;
  stylePreference: StylePreference;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
  photoWalk: PhotoWalkSettings | null;
  cameraType: CameraType;
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

  const cameraSection = buildCameraSection(params.cameraType, params.photoWalk);

  const hardLightContext = params.motiveType === 'Hårt ljus' ? `
─── HÅRT LJUS – FOTOGRAFERINGSFILOSOFI ────────────────
Fotografen fotograferar medvetet i hårt mittdagsljus. Tillämpa dessa principer i analysen:

1. SOLENS RIKTNING: Solen ska vara framför fotografen (180°-regeln) – aldrig i ryggen. Djupa skuggor i scenen är ett tecken på rätt position. Saknas skuggor är scenen platt.

2. SOLEN UTANFÖR BILDEN: Solen ska inte synas i bilden (om inte bakom tjockt dis/moln). Men den ska vara framför och skapa skuggor.

3. KONTRAST SOM VERKTYG: Djupa skuggor utan detalj är okej – de skapar fokus och mystik. Uppmana inte fotografen att fylla på skuggorna. Kontrasten är en styrka.

4. RYMD OCH NEGATIVT UTRYMME: Hårt ljus fungerar bäst med enkla, luftiga kompositioner. Ljus himmel utan detaljer är ett plus – den drar uppmärksamheten mot motivet.

5. ENKLA KOMPOSITIONER (KISS): Undvik komplexa bakgrunder – röriga skuggor förstör bilden snabbt. Rekommendera enkla, centrerade kompositioner om bakgrunden är komplex.

6. HELA SKUGGOR: Om scenen har skuggor ska de inkluderas helt i bilden – avklippta skuggor ser aldrig bra ut.

7. SPEGLINGAR: Vid kust/vatten med högt stående sol kan vattnet vara lika ljust som himlen – det tillåter extremt ljus exponering.

Bedöm bilden utifrån dessa principer. Ge råd som hjälper fotografen att utnyttja det hårda ljuset – inte undvika det.
────────────────────────────────────────────────────────` : '';

  return `Analysera den bifogade scoutingbilden.

Motivtyp: ${params.motiveType}
Önskad bildstil: ${params.stylePreference}
Ton: ${toneMap[params.analysisTone]}
Teknisk nivå: ${levelMap[params.technicalLevel]}
${hardLightContext}
${cameraSection}

Returnera din analys som JSON enligt exakt det schema du fick i systeminstruktionen.
Inkludera alltid ett fullständigt cameraAdvice-objekt med konkreta inställningar för vald kamera.
Ingen annan text utanför JSON.`;
}

