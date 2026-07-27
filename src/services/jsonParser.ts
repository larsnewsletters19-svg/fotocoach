import type { AnalysisResult } from '../types/analysis';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function parseAnalysisResult(raw: string): AnalysisResult {
  // Rensa bort eventuell markdown (```json ... ```)
  const stripped = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Försök 1: direkt parse
  try {
    const parsed = JSON.parse(stripped);
    return validateAnalysisResult(parsed);
  } catch { /* fortsätt */ }

  // Försök 2: hitta första { ... } blocket
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      return validateAnalysisResult(parsed);
    } catch { /* fortsätt */ }
  }

  // Försök 3: hitta sista kompletta JSON-objekt
  const lastMatch = [...stripped.matchAll(/\{[\s\S]*?\}/g)].pop();
  if (lastMatch) {
    try {
      const parsed = JSON.parse(lastMatch[0]);
      return validateAnalysisResult(parsed);
    } catch { /* fortsätt */ }
  }

  throw new ParseError(
    'Kunde inte tolka AI-svaret. Försök igen — om felet kvarstår, kontakta support.'
  );
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

  return result as unknown as AnalysisResult;
}
