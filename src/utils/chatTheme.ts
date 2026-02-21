// Centralized theme colors for chat components
// This eliminates hardcoded color values scattered across components

export type BackgroundTheme = 'light' | 'grey' | 'dark' | 'rose' | 'white';

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
  rose: {
    background: '#120810',
    backgroundSecondary: '#1C1018',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: 'rgba(120, 60, 100, 0.25)',
    borderLight: 'rgba(120, 60, 100, 0.12)',
    messageBubbleOwn: '#F8FAFC',
    messageBubbleOwnText: '#111111',
    messageBubbleOther: '#2E1A28',
    messageBubbleOtherText: '#F8FAFC',
    inputBackground: '#1C1018',
    inputBorder: 'rgba(120, 60, 100, 0.25)',
    skeletonPrimary: 'rgba(28, 16, 24, 0.8)',
    skeletonSecondary: 'rgba(28, 16, 24, 0.6)',
    skeletonLight: 'rgba(28, 16, 24, 0.4)',
  },
  white: {
    background: '#FFFFFF',
    backgroundSecondary: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: 'rgba(15, 23, 42, 0.12)',
    borderLight: 'rgba(15, 23, 42, 0.06)',
    messageBubbleOwn: '#0F172A',
    messageBubbleOwnText: '#FFFFFF',
    messageBubbleOther: '#E2E8F0',
    messageBubbleOtherText: '#0F172A',
    inputBackground: '#F1F5F9',
    inputBorder: 'rgba(15, 23, 42, 0.12)',
    skeletonPrimary: 'rgba(15, 23, 42, 0.08)',
    skeletonSecondary: 'rgba(15, 23, 42, 0.05)',
    skeletonLight: 'rgba(15, 23, 42, 0.03)',
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
