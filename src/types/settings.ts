import type { AnalysisTone, TechnicalLevel } from './analysis';

export type ThemePreference = 'auto' | 'dark' | 'light';

export type CameraType = 'sony-a6700' | 'iphone-16' | 'samsung-s25';

export type AppSettings = {
  anthropicApiKey: string;
  analysisTone: AnalysisTone;
  technicalLevel: TechnicalLevel;
  theme: ThemePreference;
};

export const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  analysisTone: 'Balanserad',
  technicalLevel: 'Normal',
  theme: 'auto',
};

// ─── Photo walk kit (v0.3+) ──────────────────────────────────────────────────

export type PhotoWalkSettings = {
  cameraType: CameraType;          // v0.6 – which camera is in the bag
  activeLensIds: string[];         // objektiv du har med dig (Sony only)
  mountedLensId: string;           // objektiv som sitter på kameran just nu
  hasTriPod: boolean;
  hasFilters: boolean;
  avoidLensSwap: boolean;
  notes: string;
};

export const DEFAULT_PHOTO_WALK: PhotoWalkSettings = {
  cameraType: 'sony-a6700',
  activeLensIds: [],
  mountedLensId: '',
  hasTriPod: false,
  hasFilters: false,
  avoidLensSwap: false,
  notes: '',
};
