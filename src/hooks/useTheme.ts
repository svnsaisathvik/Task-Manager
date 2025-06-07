import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('theme', 'light');
  const [theme, setTheme] = useState<Theme>(storedTheme);

  useEffect(() => {
    // Check system preference on first load
    if (storedTheme === 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      setStoredTheme('dark');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    setStoredTheme(theme);
  }, [theme, setStoredTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}