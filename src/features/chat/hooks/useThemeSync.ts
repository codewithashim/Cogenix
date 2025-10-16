import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatSettings } from '../types';

/**
 * Hook to sync theme from ThemeContext with ChatSettings
 * This ensures the theme setting is consistent across the app
 */
export function useThemeSync(
  settings: ChatSettings,
  setSettings: (settings: ChatSettings) => void
) {
  const { theme } = useTheme();

  useEffect(() => {
    if (settings.theme !== theme) {
      setSettings({ ...settings, theme });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}

