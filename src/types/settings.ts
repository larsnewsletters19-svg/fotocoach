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
