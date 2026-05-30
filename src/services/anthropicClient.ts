import type { MotiveType, StylePreference, AnalysisTone, TechnicalLevel, AnalysisResult } from '../types/analysis';
import { resizeImage, getBase64FromDataUrl } from './imageUtils';
import { parseAnalysisResult } from './jsonParser';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/photoCoachPrompt';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

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

  // Resize image before sending
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
        model: MODEL,
        max_tokens: 2048,
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
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }

    if (response.status === 401) {
      throw new ApiError(
        'Ogiltig API-nyckel. Kontrollera din nyckel i Inställningar.',
        'INVALID_API_KEY',
        401
      );
    }
    if (response.status === 429) {
      throw new ApiError(
        'För många förfrågningar. Vänta en stund och försök igen.',
        'RATE_LIMIT',
        429
      );
    }
    if (response.status === 413) {
      throw new ApiError(
        'Bilden är för stor. Testa med en mindre bild.',
        'IMAGE_TOO_LARGE',
        413
      );
    }

    const errMsg = (errorBody?.error as Record<string, unknown>)?.message as string | undefined;
    throw new ApiError(
      errMsg ?? `API-fel (${response.status}). Försök igen.`,
      'API_ERROR',
      response.status
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Kunde inte läsa API-svaret. Försök igen.', 'PARSE_ERROR');
  }

  const content = data.content as Array<{ type: string; text?: string }> | undefined;
  if (!content || content.length === 0) {
    throw new ApiError('Tomt svar från AI. Försök igen.', 'EMPTY_RESPONSE');
  }

  const textBlock = content.find((b) => b.type === 'text');
  if (!textBlock?.text) {
    throw new ApiError('Inget textsvar från AI. Försök igen.', 'NO_TEXT_RESPONSE');
  }

  return parseAnalysisResult(textBlock.text);
}
