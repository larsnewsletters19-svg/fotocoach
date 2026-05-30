import type { MotiveType, StylePreference, AnalysisResult } from './analysis';

export type HistoryItem = {
  id: string;
  createdAt: string;
  imageDataUrl: string;
  motiveType: MotiveType;
  stylePreference: StylePreference;
  result: AnalysisResult;
};

export const MAX_HISTORY_ITEMS = 8;
