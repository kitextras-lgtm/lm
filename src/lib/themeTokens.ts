export type Theme = 'light' | 'grey' | 'dark' | 'rose' | 'white';

export const themeTokens = {
  light: {
    bg: {
      primary: '#192231',
      secondary: '#192231',
      elevated: '#192231',
      active: '#212a39',
      sidebar: '#192231',
      input: '#1e2736',
      card: '#1e2736',
      modal: '#1e2736',
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
      active: '#2a2a2e',
      sidebar: '#222226',
      input: '#27272b',
      card: '#27272b',
      modal: '#27272b',
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
      active: '#121212',
      sidebar: '#0a0a0a',
      input: '#0f0f0f',
      card: '#0f0f0f',
      modal: '#0f0f0f',
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
      active: '#1c121a',
      sidebar: '#140a12',
      input: '#190f17',
      card: '#190f17',
      modal: '#190f17',
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

export function applyThemeToDOM(theme: Theme, flatBackground = false): void {
  const tokens = themeTokens[theme];

  Object.entries(tokens).forEach(([group, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--${group}-${key}`,
        value as string
      );
    });
  });

  if (flatBackground) {
    const primary = tokens.bg.primary;
    document.documentElement.style.setProperty('--bg-card', primary);
    document.documentElement.style.setProperty('--bg-input', primary);
    document.documentElement.style.setProperty('--bg-modal', primary);
    document.documentElement.style.setProperty('--bg-elevated', primary);
    document.documentElement.style.setProperty('--bg-active', primary);
  }

  // Also set theme attribute for potential CSS selectors
  document.documentElement.setAttribute('data-theme', theme);
}

export function getThemeValue(theme: Theme, group: keyof ThemeTokens, key: string): string {
  return (themeTokens[theme] as any)[group]?.[key] ?? '';
}
