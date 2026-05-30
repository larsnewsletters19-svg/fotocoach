export type Verdict = 'TA_INTE' | 'JUSTERA_FORST' | 'TA_NU';

export type MotiveType =
  | 'Auto'
  | 'Resa'
  | 'Gatufoto'
  | 'Porträtt'
  | 'Mat'
  | 'Landskap'
  | 'Arkitektur'
  | 'Detalj';

export type StylePreference =
  | 'Naturlig'
  | 'Filmisk'
  | 'Dramatisk'
  | 'Minimalistisk'
  | 'Dokumentär';

export type AnalysisTone = 'Uppmuntrande' | 'Balanserad' | 'Rak';

export type TechnicalLevel = 'Enkel' | 'Normal' | 'Avancerad';

export type ImpactLevel = 'high' | 'medium' | 'low';
export type EffortLevel = 'low' | 'medium' | 'high';
export type TimingType = 'now' | 'wait' | 'optional';

export type PriorityAction = {
  rank: number;
  action: string;
  why: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  timing: TimingType;
};

// ─── Camera advice (v0.2) ────────────────────────────────────────────────────

export type CameraAdvice = {
  recommendedLens: string;          // e.g. "Sony 35mm f/1.8"
  focalLengthReason: string;        // why this focal length
  aperture: string;                 // e.g. "f/2.8"
  apertureReason: string;
  shutterSpeed: string;             // e.g. "1/500s"
  shutterReason: string;
  iso: string;                      // e.g. "ISO 400"
  isoReason: string;
  focusMode: string;                // e.g. "AF-C med Wide Tracking"
  focusArea: string;                // e.g. "Tracking: Expand Spot"
  focusModeReason: string;
  driveMode: string;                // e.g. "Kontinuerlig – Hi+"
  whiteBalance: string;             // e.g. "Auto eller Daylight"
  fileFormat: string;               // e.g. "RAW + JPEG Fine"
  extraTip: string;                 // one Sony a6700-specific tip
};

export type AnalysisResult = {
  verdict: Verdict;
  confidence: number;
  oneSentenceReason: string;
  sceneType: string;
  mainSubject: string;
  priorityActions: PriorityAction[];
  composition: {
    overallScore: number;
    ruleOfThirds: string;
    leadingLines: string;
    foregroundMiddleBackground: string;
    backgroundCleanliness: string;
    negativeSpace: string;
    edgesAndDistractions: string;
    cropSuggestion: string;
  };
  light: {
    overallScore: number;
    direction: string;
    quality: string;
    contrast: string;
    exposureRisk: string;
    whiteBalance: string;
    bestLightAction: string;
  };
  backgroundAndDistractions: string;
  whatAlreadyWorks: string[];
  learningPoint: string;
  nextShotChecklist: string[];
  cameraAdvice?: CameraAdvice;      // v0.2 – optional for backward compat
  overlays?: ImageOverlays;         // v0.5 – optional for backward compat
};

// ─── Image overlays (v0.5) ───────────────────────────────────────────────────
// All coordinates are 0.0–1.0 relative to image width/height

export type BoundingBox = {
  x: number;      // left edge, 0.0–1.0
  y: number;      // top edge, 0.0–1.0
  w: number;      // width, 0.0–1.0
  h: number;      // height, 0.0–1.0
};

export type OverlayPoint = {
  x: number;      // 0.0–1.0
  y: number;      // 0.0–1.0
  label: string;
};

export type ImageOverlays = {
  subjectBox?: BoundingBox;           // main subject bounding box
  distractionPoints?: OverlayPoint[]; // up to 3 distraction markers
  cropBox?: BoundingBox;              // suggested crop rectangle
  horizonY?: number;                  // 0.0–1.0, estimated horizon line
};

// ─── Retake comparison (v0.4) ────────────────────────────────────────────────

export type RetakeVerdict = 'BÄTTRE' | 'SÄMRE' | 'LIKNANDE' | 'TA_NU';

export type RetakeComparison = {
  retakeVerdict: RetakeVerdict;
  overallImprovement: number;        // -10 to +10
  oneSentenceSummary: string;
  improvedAspects: string[];
  remainingIssues: string[];
  readyToShoot: boolean;
  finalRecommendation: string;
  compositionDelta: number;          // -10 to +10
  lightDelta: number;
  backgroundDelta: number;
};

// ─── Camera & lens profiles (v0.2+) ─────────────────────────────────────────

export type LensProfile = {
  id: string;
  name: string;
  focalLengthMm: number | string;   // e.g. 35 or "16-55"
  maxAperture: string;              // e.g. "f/1.8"
  mount: string;                    // e.g. "Sony E"
  stabilized: boolean;
  strengths: string[];
  weaknesses: string[];
  bestUseCases: string[];
  avoidUseCases: string[];
  sweetSpotAperture: string;        // e.g. "f/2.8–f/4"
  autofocusNotes: string;
  bokehCharacter: string;
  userNotes: string;
};

export type CameraProfile = {
  id: string;
  brand: string;
  model: string;
  sensorSizeMm: string;            // e.g. "APS-C (23.5 × 15.6 mm)"
  megapixels: number;
  nativeIsoRange: string;          // e.g. "ISO 100–32000"
  expandedIsoRange: string;        // e.g. "ISO 50–102400"
  cleanIsoLimit: string;           // e.g. "ISO 3200"
  focusSystems: string[];          // e.g. ["Phase detect", "759 poäng", "AI-tracking"]
  burstRateFps: number;
  videoCapabilities: string;
  stabilization: string;           // e.g. "5-axlig IBIS, 5 steg"
  screenType: string;
  bodyWeightGrams: number;
  notes: string;
  lenses: LensProfile[];
};

export type PhotoWalkKit = {
  camera: CameraProfile;
  activeLensId: string;
  hasTriPod: boolean;
  hasFilters: boolean;
  avoidLensSwap: boolean;
  extraNotes: string;
};
