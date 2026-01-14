export type Theme = 'light' | 'grey' | 'dark';

export const themeTokens = {
  light: {
    bg: {
      primary: '#0F172A',
      secondary: '#0F172A',
      elevated: '#0F172A',
      active: '#1E293B',
      sidebar: '#0F172A',
      input: '#0F172A',
      card: '#0F172A',
      modal: '#0F172A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    border: {
      subtle: 'rgba(148, 163, 184, 0.3)',
      default: 'rgba(148, 163, 184, 0.2)',
    },
  },

  grey: {
    bg: {
      primary: '#1A1A1E',
      secondary: '#1A1A1E',
      elevated: '#1A1A1E',
      active: '#2A2A2E',
      sidebar: '#1A1A1E',
      input: '#1A1A1E',
      card: '#1A1A1E',
      modal: '#1A1A1E',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    border: {
      subtle: '#2f2f2f',
      default: 'rgba(75, 85, 99, 0.2)',
    },
  },

  dark: {
    bg: {
      primary: '#000000',
      secondary: '#000000',
      elevated: '#000000',
      active: '#0f0f13',
      sidebar: '#000000',
      input: '#000000',
      card: '#000000',
      modal: '#000000',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    border: {
      subtle: '#1a1a1a',
      default: 'rgba(75, 85, 99, 0.2)',
    },
  },
} as const;

export type ThemeTokens = typeof themeTokens[Theme];

export function applyThemeToDOM(theme: Theme): void {
  const tokens = themeTokens[theme];

  Object.entries(tokens).forEach(([group, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--${group}-${key}`,
        value as string
      );
    });
  });

  // Also set theme attribute for potential CSS selectors
  document.documentElement.setAttribute('data-theme', theme);
}

export function getThemeValue(theme: Theme, group: keyof ThemeTokens, key: string): string {
  return (themeTokens[theme] as any)[group]?.[key] ?? '';
}
