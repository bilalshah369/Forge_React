import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import {themes, ThemeType, ThemeNames} from './themes';

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (themeName: ThemeNames) => void;
  currentTheme: ThemeNames;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeNames>('blue');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && themes[savedTheme as ThemeNames]) {
        setCurrentTheme(savedTheme as ThemeNames);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (themeName: ThemeNames) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  };

  return (
    <ThemeContext.Provider
      value={{theme: themes[currentTheme], setTheme, currentTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
