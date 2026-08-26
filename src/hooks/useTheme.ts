import { useAppStore } from '../store/useAppStore';
import { Colors } from '../constants/colors';

export function useTheme() {
  const theme = useAppStore((s) => s.settings.theme);
  const isDark = theme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  return {
    theme,
    isDark,
    colors: {
      ...palette,
      accent: Colors.accent,
      accentLight: Colors.accentLight,
      accentDark: Colors.accentDark,
    },
  };
}
