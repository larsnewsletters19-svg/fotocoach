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
};

// Future expansion types (not used in v0.1)
export type CameraProfile = {
  brand: string;
  model: string;
  sensor: string;
  notes: string;
};

export type LensProfile = {
  id: string;
  name: string;
  focalLength: string;
  maxAperture: string;
  strengths: string[];
  weaknesses: string[];
  notes: string;
};

export type PhotoWalkKit = {
  camera: CameraProfile;
  lenses: LensProfile[];
  currentLens: string;
  hasTriPod: boolean;
  hasFilters: boolean;
  avoidLensSwap: boolean;
};
