export const Colors = {
  // Brand — energetic orange
  accent: '#FF6B2C',
  accentLight: '#FF8C5A',
  accentDark: '#E5521A',

  // Dark theme
  dark: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceElevated: '#242424',
    border: '#2E2E2E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',
    error: '#FF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  },

  // Light theme
  light: {
    background: '#F8F8F8',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F0F0',
    border: '#E0E0E0',
    text: '#111111',
    textSecondary: '#555555',
    textMuted: '#999999',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
  },

  // Always the same
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;
