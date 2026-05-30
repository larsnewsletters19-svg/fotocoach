import type { AnalysisTone, TechnicalLevel } from './analysis';

export type AppSettings = {
  anthropicApiKey: string;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
};

export const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  analysisTone: 'Balanserad',
  technicalLevel: 'Normal',
};

// ─── Photo walk kit (v0.3) ───────────────────────────────────────────────────

export type PhotoWalkSettings = {
  activeLensIds: string[];     // objektiv du har med dig
  mountedLensId: string;       // objektiv som sitter på kameran just nu
  hasTriPod: boolean;
  hasFilters: boolean;
  avoidLensSwap: boolean;
  notes: string;               // fri notering, t.ex. "stadsvandring", "naturreservat"
};

export const DEFAULT_PHOTO_WALK: PhotoWalkSettings = {
  activeLensIds: [],
  mountedLensId: '',
  hasTriPod: false,
  hasFilters: false,
  avoidLensSwap: false,
  notes: '',
};
