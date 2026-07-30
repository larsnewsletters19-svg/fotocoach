import type { AnalysisResult } from '../types/analysis';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function parseAnalysisResult(raw: string): AnalysisResult {
  // Rensa markdown-kodblock som modellen kan lägga till
  const cleaned = raw
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/```\s*$/im, '')
    .trim();

  // Försök 1: direkt parse
  try {
    return validateAnalysisResult(JSON.parse(cleaned));
  } catch { /* fortsätt */ }

  // Försök 2: hitta första { och sista } i texten
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return validateAnalysisResult(JSON.parse(cleaned.slice(start, end + 1)));
    } catch { /* fortsätt */ }
  }

  // Försök 3: regex-match
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return validateAnalysisResult(JSON.parse(match[0]));
    } catch { /* fortsätt */ }
  }

  throw new ParseError('Kunde inte tolka AI-svaret. Försök igen.');
}

function validateAnalysisResult(obj: unknown): AnalysisResult {
  if (typeof obj !== 'object' || obj === null) {
    throw new ParseError('Svaret är inte ett JSON-objekt');
  }

  const result = obj as Record<string, unknown>;

  const requiredFields = [
    'verdict', 'confidence', 'oneSentenceReason', 'sceneType',
    'mainSubject', 'priorityActions', 'composition', 'light',
    'backgroundAndDistractions', 'whatAlreadyWorks',
    'learningPoint', 'nextShotChecklist',
  ];

  for (const field of requiredFields) {
    if (!(field in result)) {
      throw new ParseError(`Saknat fält i AI-svar: ${field}`);
    }
  }

  const validVerdicts = ['TA_INTE', 'JUSTERA_FORST', 'TA_NU'];
  if (!validVerdicts.includes(result.verdict as string)) {
    throw new ParseError(`Ogiltigt verdict: ${result.verdict}`);
  }

  // cameraAdvice och overlays är valfria – kasta ej fel om de saknas
  return result as unknown as AnalysisResult;
}
