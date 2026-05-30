import type { AppSettings } from '../types/settings';
import type { HistoryItem } from '../types/history';
import { DEFAULT_SETTINGS } from '../types/settings';
import { MAX_HISTORY_ITEMS } from '../types/history';

const KEYS = {
  SETTINGS: 'fotocoach_settings',
  HISTORY: 'fotocoach_history',
} as const;

// Settings
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// History
export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export function addHistoryItem(item: HistoryItem): HistoryItem[] {
  const history = loadHistory();
  const updated = [item, ...history].slice(0, MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
