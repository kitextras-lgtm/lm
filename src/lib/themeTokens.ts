export type Theme = 'light' | 'grey' | 'dark' | 'rose' | 'white';

export const themeTokens = {
  light: {
    bg: {
      primary: '#192231',
      secondary: '#192231',
      elevated: '#192231',
      active: '#1e2838',
      sidebar: '#192231',
      input: '#17202f',
      card: '#17202f',
      modal: '#17202f',
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
      primary: '#222226',
      secondary: '#222226',
      elevated: '#222226',
      active: '#272729',
      sidebar: '#222226',
      input: '#202024',
      card: '#202024',
      modal: '#202024',
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
      primary: '#0a0a0a',
      secondary: '#0a0a0a',
      elevated: '#0a0a0a',
      active: '#141414',
      sidebar: '#0a0a0a',
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
  rose: {
    bg: {
      primary: '#140a12',
      secondary: '#140a12',
      elevated: '#140a12',
      active: '#1a1018',
      sidebar: '#140a12',
      input: '#120810',
      card: '#120810',
      modal: '#120810',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    border: {
      subtle: '#2E1A28',
      default: 'rgba(120, 60, 100, 0.25)',
    },
  },
  white: {
    bg: {
      primary: '#f5f5f5',
      secondary: '#f5f5f5',
      elevated: '#f5f5f5',
      active: '#ebebeb',
      sidebar: '#f5f5f5',
      input: '#ffffff',
      card: '#ffffff',
      modal: '#ffffff',
    },
    text: {
      primary: '#0F172A',
      secondary: '#374151',
      muted: '#4B5563',
    },
    border: {
      subtle: '#B8C4CE',
      default: '#9AAAB4',
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
