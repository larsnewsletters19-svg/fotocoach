import { useEffect, useCallback } from 'react';
import type { ThemePreference } from '../types/settings';

export type ResolvedTheme = 'dark' | 'light';

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'auto') return getSystemTheme();
  return pref;
}

export function useTheme(pref: ThemePreference) {
  const apply = useCallback((p: ThemePreference) => {
    const resolved = resolveTheme(p);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  useEffect(() => {
    apply(pref);

    if (pref === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply('auto');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [pref, apply]);
}
