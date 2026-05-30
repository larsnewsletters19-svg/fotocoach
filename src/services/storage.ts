import type { AppSettings, PhotoWalkSettings } from '../types/settings';
import type { HistoryItem } from '../types/history';
import { DEFAULT_SETTINGS, DEFAULT_PHOTO_WALK } from '../types/settings';
import { MAX_HISTORY_ITEMS } from '../types/history';

const KEYS = {
  SETTINGS: 'fotocoach_settings',
  HISTORY: 'fotocoach_history',
  PHOTO_WALK: 'fotocoach_photowalk',
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

// Photo walk
export function loadPhotoWalk(): PhotoWalkSettings {
  try {
    const raw = localStorage.getItem(KEYS.PHOTO_WALK);
    if (!raw) return { ...DEFAULT_PHOTO_WALK };
    return { ...DEFAULT_PHOTO_WALK, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PHOTO_WALK };
  }
}

export function savePhotoWalk(walk: PhotoWalkSettings): void {
  try {
    localStorage.setItem(KEYS.PHOTO_WALK, JSON.stringify(walk));
  } catch (e) {
    console.error('Failed to save photo walk', e);
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

export function updateHistoryItem(id: string, patch: Partial<HistoryItem>): HistoryItem[] {
  const history = loadHistory();
  const updated = history.map((item) => item.id === id ? { ...item, ...patch } : item);
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update history item', e);
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
