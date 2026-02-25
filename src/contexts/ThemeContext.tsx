import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themeTokens, applyThemeToDOM } from '../lib/themeTokens';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  tokens: typeof themeTokens[Theme];
  flatBackground: boolean;
  setFlatBackground: (flat: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  const [flatBackground, setFlatBackgroundState] = useState<boolean>(() => {
    return localStorage.getItem('flatBackground') === 'true';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    // Also update legacy keys for backward compatibility during migration
    localStorage.setItem('backgroundTheme', newTheme);
    localStorage.setItem('appliedTheme', newTheme);
  };

  const setFlatBackground = (flat: boolean) => {
    setFlatBackgroundState(flat);
    localStorage.setItem('flatBackground', String(flat));
  };

  useEffect(() => {
    applyThemeToDOM(theme, flatBackground);
  }, [theme, flatBackground]);

  // Apply theme on initial mount
  useEffect(() => {
    applyThemeToDOM(theme, flatBackground);
  }, []);

  const baseTokens = themeTokens[theme];
  const tokens = (flatBackground
    ? {
        ...baseTokens,
        bg: {
          ...baseTokens.bg,
          card: baseTokens.bg.primary,
          elevated: baseTokens.bg.primary,
          input: baseTokens.bg.primary,
          modal: baseTokens.bg.primary,
          active: baseTokens.bg.primary,
        },
      }
    : baseTokens) as typeof baseTokens;

  const value: ThemeContextType = {
    theme,
    setTheme,
    tokens,
    flatBackground,
    setFlatBackground,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook for backward compatibility - returns theme as backgroundTheme
export function useBackgroundTheme(): Theme {
  const { theme } = useTheme();
  return theme;
}
