import type { MotiveType, StylePreference, AnalysisResult, RetakeComparison } from './analysis';

export type HistoryItem = {
  id: string;
  createdAt: string;
  imageDataUrl: string;
  motiveType: MotiveType;
  stylePreference: StylePreference;
  result: AnalysisResult;
  // v0.4 retake
  retakeImageDataUrl?: string;
  retakeResult?: AnalysisResult;
  retakeComparison?: RetakeComparison;
};

export const MAX_HISTORY_ITEMS = 8;
