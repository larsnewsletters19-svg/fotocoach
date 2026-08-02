import type { MotiveType, StylePreference, AnalysisTone, TechnicalLevel, AnalysisResult, RetakeComparison, QuickAnalysis } from '../types/analysis';
import type { PhotoWalkSettings, CameraType } from '../types/settings';
import { resizeImage, getBase64FromDataUrl } from './imageUtils';
import { parseAnalysisResult } from './jsonParser';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/photoCoachPrompt';
import { RETAKE_SYSTEM_PROMPT, buildRetakeUserPrompt } from '../prompts/retakePrompt';
import { QUICK_SYSTEM_PROMPT, buildQuickUserPrompt } from '../prompts/quickAnalysisPrompt';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Hämtar senaste tillgängliga modell automatiskt från Anthropic API.
// Faller tillbaka på en känd bra modell om API:et inte svarar.
const FALLBACK_MODEL = 'claude-sonnet-5';

async function getLatestSonnetModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    });
    if (!response.ok) return FALLBACK_MODEL;
    const data = await response.json() as { data?: Array<{ id: string }> };
    const models = data.data ?? [];

    // Prioritetsordning: sonnet-5, sonnet-4.x, sonnet-4
    const sonnetModels = models
      .map((m) => m.id)
      .filter((id) => id.toLowerCase().includes('sonnet'))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    return sonnetModels[0] ?? FALLBACK_MODEL;
  } catch {
    return FALLBACK_MODEL;
  }
}

// Cache modellen i sessionen – ett anrop per sidladdning
let cachedModel: string | null = null;

async function getModel(apiKey: string): Promise<string> {
  if (cachedModel) return cachedModel;
  cachedModel = await getLatestSonnetModel(apiKey);
  console.log('[Fotocoach] Använder modell:', cachedModel);
  return cachedModel;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function analyzePhoto(params: {
  imageDataUrl: string;
  apiKey: string;
  motiveType: MotiveType;
  stylePreference: StylePreference;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
  photoWalk: PhotoWalkSettings | null;
  cameraType: CameraType;
}): Promise<AnalysisResult> {
  if (!params.apiKey || params.apiKey.trim().length < 10) {
    throw new ApiError(
      'API-nyckel saknas. Gå till Inställningar och ange din Anthropic API-nyckel.',
      'MISSING_API_KEY'
    );
  }

  if (!params.apiKey.startsWith('sk-')) {
    throw new ApiError(
      'API-nyckeln verkar vara ogiltig. Den ska börja med "sk-". Kontrollera i Inställningar.',
      'INVALID_API_KEY_FORMAT'
    );
  }

  const model = await getModel(params.apiKey);

  let processedImage: string;
  try {
    processedImage = await resizeImage(params.imageDataUrl);
  } catch {
    throw new ApiError('Kunde inte bearbeta bilden. Försök med en annan bild.');
  }

  const base64Image = getBase64FromDataUrl(processedImage);
  const userPrompt = buildUserPrompt({
    motiveType: params.motiveType,
    stylePreference: params.stylePreference,
    analysisTone: params.analysisTone,
    technicalLevel: params.technicalLevel,
    photoWalk: params.photoWalk,
    cameraType: params.cameraType,
  });

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': params.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: userPrompt,
              },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Okänt fel';
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      throw new ApiError(
        'Nätverksfel. Kontrollera din internetanslutning och försök igen.',
        'NETWORK_ERROR'
      );
    }
    throw new ApiError(`Nätverksfel: ${message}`, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    let errorBody: Record<string, unknown> = {};
    try { errorBody = await response.json(); } catch { /* ignore */ }

    if (response.status === 401) {
      throw new ApiError('Ogiltig API-nyckel. Kontrollera din nyckel i Inställningar.', 'INVALID_API_KEY', 401);
    }
    if (response.status === 429) {
      throw new ApiError('För många förfrågningar. Vänta en stund och försök igen.', 'RATE_LIMIT', 429);
    }
    if (response.status === 413) {
      throw new ApiError('Bilden är för stor. Testa med en mindre bild.', 'IMAGE_TOO_LARGE', 413);
    }
    const errMsg = (errorBody?.error as Record<string, unknown>)?.message as string | undefined;
    throw new ApiError(errMsg ?? `API-fel (${response.status}). Försök igen.`, 'API_ERROR', response.status);
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Kunde inte läsa API-svaret. Försök igen.', 'PARSE_ERROR');
  }

  // claude-sonnet-5+ använder adaptive thinking – hoppa över thinking-block, hitta text-block
  const content = data.content as Array<{ type: string; text?: string }> | undefined;
  if (!content || content.length === 0) {
    throw new ApiError('Tomt svar från AI. Försök igen.', 'EMPTY_RESPONSE');
  }

  const textBlock = content.find((b) => b.type === 'text' && typeof b.text === 'string');
  if (!textBlock?.text) {
    throw new ApiError('Inget textsvar från AI. Försök igen.', 'NO_TEXT_RESPONSE');
  }

  return parseAnalysisResult(textBlock.text);
}

// ─── Retake comparison ───────────────────────────────────────────────────────

export async function retakePhoto(params: {
  originalImageDataUrl: string;
  retakeImageDataUrl: string;
  apiKey: string;
  originalResult: AnalysisResult;
}): Promise<RetakeComparison> {
  if (!params.apiKey || params.apiKey.trim().length < 10) {
    throw new ApiError('API-nyckel saknas.', 'MISSING_API_KEY');
  }

  const model = await getModel(params.apiKey);

  let originalImg: string;
  let retakeImg: string;
  try {
    [originalImg, retakeImg] = await Promise.all([
      resizeImage(params.originalImageDataUrl),
      resizeImage(params.retakeImageDataUrl),
    ]);
  } catch {
    throw new ApiError('Kunde inte bearbeta bilderna. Försök igen.');
  }

  const userPrompt = buildRetakeUserPrompt(params.originalResult);

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': params.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: RETAKE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: getBase64FromDataUrl(originalImg) },
              },
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: getBase64FromDataUrl(retakeImg) },
              },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Okänt fel';
    throw new ApiError(`Nätverksfel: ${message}`, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    if (response.status === 401) throw new ApiError('Ogiltig API-nyckel.', 'INVALID_API_KEY', 401);
    if (response.status === 429) throw new ApiError('För många förfrågningar. Vänta och försök igen.', 'RATE_LIMIT', 429);
    throw new ApiError(`API-fel (${response.status}).`, 'API_ERROR', response.status);
  }

  const data = await response.json() as Record<string, unknown>;
  const content = data.content as Array<{ type: string; text?: string }> | undefined;
  const textBlock = content?.find((b) => b.type === 'text' && typeof b.text === 'string');
  if (!textBlock?.text) throw new ApiError('Tomt svar från AI.', 'EMPTY_RESPONSE');

  try {
    const raw = textBlock.text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : raw;
    return JSON.parse(jsonStr) as RetakeComparison;
  } catch {
    throw new ApiError('Kunde inte tolka jämförelsesvaret. Försök igen.', 'PARSE_ERROR');
  }
}
// ─── Quick analysis (v0.7) ───────────────────────────────────────────────────

export async function quickAnalyzePhoto(params: {
  imageDataUrl: string;
  apiKey: string;
  motiveType: MotiveType;
  stylePreference: StylePreference;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
  photoWalk: PhotoWalkSettings | null;
  cameraType: CameraType;
}): Promise<QuickAnalysis> {
  if (!params.apiKey || params.apiKey.trim().length < 10) {
    throw new ApiError('API-nyckel saknas.', 'MISSING_API_KEY');
  }

  const model = await getModel(params.apiKey);

  let processedImage: string;
  try {
    processedImage = await resizeImage(params.imageDataUrl);
  } catch {
    throw new ApiError('Kunde inte bearbeta bilden.');
  }

  const userPrompt = buildQuickUserPrompt({
    motiveType: params.motiveType,
    stylePreference: params.stylePreference,
    analysisTone: params.analysisTone,
    technicalLevel: params.technicalLevel,
    photoWalk: params.photoWalk,
    cameraType: params.cameraType,
  });

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': params.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: QUICK_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: getBase64FromDataUrl(processedImage),
                },
              },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Okänt fel';
    throw new ApiError(`Nätverksfel: ${message}`, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    if (response.status === 401) throw new ApiError('Ogiltig API-nyckel.', 'INVALID_API_KEY', 401);
    if (response.status === 429) throw new ApiError('För många förfrågningar. Vänta och försök igen.', 'RATE_LIMIT', 429);
    throw new ApiError(`API-fel (${response.status}).`, 'API_ERROR', response.status);
  }

  const data = await response.json() as Record<string, unknown>;
  const content = data.content as Array<{ type: string; text?: string }> | undefined;
  const textBlock = content?.find((b) => b.type === 'text' && typeof b.text === 'string');
  if (!textBlock?.text) throw new ApiError('Tomt svar från AI.', 'EMPTY_RESPONSE');

  try {
    const raw = textBlock.text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : raw;
    return JSON.parse(jsonStr) as QuickAnalysis;
  } catch {
    throw new ApiError('Kunde inte tolka snabbanalysen. Försök igen.', 'PARSE_ERROR');
  }
}
