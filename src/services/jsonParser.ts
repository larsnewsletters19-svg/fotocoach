import type { AnalysisResult } from '../types/analysis';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function parseAnalysisResult(raw: string): AnalysisResult {
  // Attempt 1: direct parse
  try {
    const parsed = JSON.parse(raw);
    return validateAnalysisResult(parsed);
  } catch {
    // continue to extraction
  }

  // Attempt 2: extract first JSON object
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      return validateAnalysisResult(parsed);
    } catch {
      // continue to error
    }
  }

  throw new ParseError(
    'Kunde inte tolka AI-svaret. Modellen returnerade ogiltig JSON. Försök igen.'
  );
}

function validateAnalysisResult(obj: unknown): AnalysisResult {
  if (typeof obj !== 'object' || obj === null) {
    throw new ParseError('Svaret är inte ett JSON-objekt');
  }

  const result = obj as Record<string, unknown>;

  const requiredFields = [
    'verdict',
    'confidence',
    'oneSentenceReason',
    'sceneType',
    'mainSubject',
    'priorityActions',
    'composition',
    'light',
    'backgroundAndDistractions',
    'whatAlreadyWorks',
    'learningPoint',
    'nextShotChecklist',
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
