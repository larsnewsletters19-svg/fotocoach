import type { AnalysisResult } from '../types/analysis';

export const RETAKE_SYSTEM_PROMPT = `Du är en erfaren fotograf och fotocoach. Du ska jämföra två scoutingbilder: originalet och ett retake som tagits efter att fotografen följt råden. Svara på svenska. Returnera bara giltig JSON – ingen text före eller efter.

Bedöm om retaken är bättre, sämre eller liknande originalet i tre dimensioner:
- Komposition (compositionDelta)
- Ljus (lightDelta)  
- Bakgrund/störande element (backgroundDelta)

Varje delta är ett heltal från -10 till +10 där:
- Positiv = förbättring
- 0 = ingen förändring
- Negativ = försämring

overallImprovement är ett vägt genomsnitt av de tre deltana.

retakeVerdict väljs bland:
- TA_NU: retaken är klar att tas med riktiga kameran
- BÄTTRE: tydlig förbättring men kan fortfarande justeras
- LIKNANDE: ungefär samma kvalitet
- SÄMRE: originalet var starkare

Returnera alltid exakt denna JSON-struktur:

{
  "retakeVerdict": "BÄTTRE",
  "overallImprovement": 4,
  "oneSentenceSummary": "...",
  "improvedAspects": ["...", "..."],
  "remainingIssues": ["..."],
  "readyToShoot": false,
  "finalRecommendation": "...",
  "compositionDelta": 5,
  "lightDelta": 3,
  "backgroundDelta": 4
}`;

export function buildRetakeUserPrompt(original: AnalysisResult): string {
  const originalVerdict = original.verdict.replace('_', ' ');
  const actions = original.priorityActions
    .slice(0, 3)
    .map((a, i) => `${i + 1}. ${a.action}`)
    .join('\n');

  return `Jämför de två bifogade bilderna. Den FÖRSTA bilden är originalet, den ANDRA är retaken.

Original-analys:
- Verdict: ${originalVerdict}
- Anledning: ${original.oneSentenceReason}
- Komposition: ${original.composition.overallScore}/10
- Ljus: ${original.light.overallScore}/10
- Bakgrund/störningar: ${original.backgroundAndDistractions}

Råd fotografen fick att följa:
${actions}

Bedöm nu retaken mot originalet och returnera JSON enligt schemat.`;
}
