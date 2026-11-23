export type ThemeKey = 'dark' | 'clay';

export type Theme = {
  bg: string; face: string; shelf: string; hot: string; edge: string; accent: string;
  lit: boolean; // true = lit materials + shadows (clay); false = unlit line art (dark)
};

export const THEMES: Record<ThemeKey, Theme> = {
  dark: { bg: '#0e0e0e', face: '#0e0e0e', shelf: '#0e0e0e', hot: '#242424', edge: '#e9e9e9', accent: '#ffffff', lit: false },
  clay: { bg: '#efe9df', face: '#fbf8f3', shelf: '#f4eee5', hot: '#fbf8f3', edge: '#3a332c', accent: '#e4572e', lit: true },
};

export const THEME_STORAGE_KEY = 'theme';
