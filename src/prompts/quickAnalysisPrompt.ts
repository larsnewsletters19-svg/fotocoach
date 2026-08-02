import type { MotiveType, StylePreference, AnalysisTone, TechnicalLevel } from '../types/analysis';
import type { PhotoWalkSettings, CameraType } from '../types/settings';
import { getCameraContext, SONY_LENSES } from '../data/cameraData';
import { getMobileCamera, getMobileCameraContext } from '../data/mobileCameraData';

export const QUICK_SYSTEM_PROMPT = `Du är en praktisk fotocoach på plats. Du analyserar en scoutingbild snabbt och ger ett omedelbart beslutsstöd. Svara på svenska. Returnera bara giltig JSON – ingen text före eller efter.

Välj exakt ett verdict:
- TA_INTE: scenen är inte värd att fotografera just nu
- JUSTERA_FORST: scenen har potential men behöver justeras
- TA_NU: ta bilden direkt

Ge max 3 priorityActions – korta och konkreta. Varje action ska vara en enda handlingsklar mening.

Returnera exakt denna JSON och inget annat:

{
  "verdict": "JUSTERA_FORST",
  "confidence": 0.85,
  "oneSentenceReason": "...",
  "sceneType": "...",
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
  "readyToShoot": false
}`;

export function buildQuickUserPrompt(params: {
  motiveType: MotiveType;
  stylePreference: StylePreference;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
  photoWalk: PhotoWalkSettings | null;
  cameraType: CameraType;
}): string {
  const toneMap: Record<AnalysisTone, string> = {
    Uppmuntrande: 'Uppmuntrande ton.',
    Balanserad: 'Saklig ton.',
    Rak: 'Rak och direkt ton.',
  };

  // Minimal kamerakontext – bara vad som sitter på kameran
  let cameraLine = '';
  if (params.cameraType === 'sony-a6700') {
    const mounted = params.photoWalk?.mountedLensId
      ? SONY_LENSES.find(l => l.id === params.photoWalk!.mountedLensId)
      : null;
    const cam = getCameraContext().split('\n')[0];
    cameraLine = mounted
      ? `Kamera: ${cam} med ${mounted.name}`
      : `Kamera: Sony α6700`;
    if (params.photoWalk?.avoidLensSwap) cameraLine += ' (undvik objektivbyte)';
  } else {
    const mobile = getMobileCamera(params.cameraType);
    if (mobile) cameraLine = `Kamera: ${getMobileCameraContext(mobile).split('\n')[0]}`;
  }

  return `Gör en snabb bedömning av scoutingbilden.

Motivtyp: ${params.motiveType}
Stil: ${params.stylePreference}
${toneMap[params.analysisTone]}
${cameraLine}

Returnera JSON enligt schemat. Max 3 åtgärder. Var konkret och kort.`;
}
