// Centralized theme colors for chat components
// This eliminates hardcoded color values scattered across components

export type BackgroundTheme = 'light' | 'grey' | 'dark';

interface ThemeColors {
  // Main backgrounds
  background: string;
  backgroundSecondary: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  border: string;
  borderLight: string;

  // Message bubbles
  messageBubbleOwn: string;
  messageBubbleOwnText: string;
  messageBubbleOther: string;
  messageBubbleOtherText: string;

  // Input
  inputBackground: string;
  inputBorder: string;

  // Skeleton loading
  skeletonPrimary: string;
  skeletonSecondary: string;
  skeletonLight: string;
}

const themes: Record<BackgroundTheme, ThemeColors> = {
  light: {
    background: '#0F172A',
    backgroundSecondary: '#0F172A',
    textPrimary: '#FFFFFF',
    textSecondary: '#64748B',
    textMuted: '#64748B',
    border: 'rgba(75, 85, 99, 0.2)',
    borderLight: 'rgba(75, 85, 99, 0.1)',
    messageBubbleOwn: '#F8FAFC',
    messageBubbleOwnText: '#111111',
    messageBubbleOther: '#2D3748',
    messageBubbleOtherText: '#F8FAFC',
    inputBackground: '#1a1a1e',
    inputBorder: 'rgba(75, 85, 99, 0.2)',
    skeletonPrimary: 'rgba(30, 41, 59, 0.5)',
    skeletonSecondary: 'rgba(30, 41, 59, 0.35)',
    skeletonLight: 'rgba(30, 41, 59, 0.25)',
  },
  grey: {
    background: '#1A1A1E',
    backgroundSecondary: '#2A2A2E',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: 'rgba(75, 85, 99, 0.2)',
    borderLight: 'rgba(75, 85, 99, 0.1)',
    messageBubbleOwn: '#F8FAFC',
    messageBubbleOwnText: '#111111',
    messageBubbleOther: '#2D3748',
    messageBubbleOtherText: '#F8FAFC',
    inputBackground: '#1a1a1e',
    inputBorder: 'rgba(75, 85, 99, 0.2)',
    skeletonPrimary: 'rgba(75, 85, 99, 0.25)',
    skeletonSecondary: 'rgba(75, 85, 99, 0.18)',
    skeletonLight: 'rgba(75, 85, 99, 0.12)',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1a1a1e',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: 'rgba(75, 85, 99, 0.2)',
    borderLight: 'rgba(75, 85, 99, 0.1)',
    messageBubbleOwn: '#F8FAFC',
    messageBubbleOwnText: '#111111',
    messageBubbleOther: '#2D3748',
    messageBubbleOtherText: '#F8FAFC',
    inputBackground: '#1a1a1e',
    inputBorder: 'rgba(75, 85, 99, 0.2)',
    skeletonPrimary: 'rgba(26, 26, 30, 0.8)',
    skeletonSecondary: 'rgba(26, 26, 30, 0.6)',
    skeletonLight: 'rgba(26, 26, 30, 0.4)',
  },
};

/**
 * Get theme colors for the specified background theme
 */
export function getTheme(theme: BackgroundTheme): ThemeColors {
  return themes[theme];
}

/**
 * Get a specific background color based on theme
 * Commonly used inline: style={{ backgroundColor: getBackground(theme) }}
 */
export function getBackground(theme: BackgroundTheme): string {
  return themes[theme].background;
}

/**
 * Get secondary background color (for cards, modals, etc)
 */
export function getBackgroundSecondary(theme: BackgroundTheme): string {
  return themes[theme].backgroundSecondary;
}

/**
 * Get primary text color based on theme
 */
export function getTextPrimary(theme: BackgroundTheme): string {
  return themes[theme].textPrimary;
}

/**
 * Get secondary text color based on theme
 */
export function getTextSecondary(theme: BackgroundTheme): string {
  return themes[theme].textSecondary;
}
