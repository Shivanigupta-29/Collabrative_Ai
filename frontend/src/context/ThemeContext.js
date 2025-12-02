// frontend/src/context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme configuration
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
      },
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: {
        50: '#1e293b',
        100: '#334155',
        500: '#60a5fa',
        600: '#3b82f6',
        700: '#2563eb',
      },
      background: '#0f172a',
      surface: '#1e293b',
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
      },
    },
  },
  system: {
    name: 'system',
    // Will use light or dark based on system preference
  },
};

// Initial state
const initialState = {
  currentTheme: 'system',
  theme: themes.light,
  isDark: false,
  themes,
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });
  
  const [isDark, setIsDark] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (currentTheme === 'system') {
        setIsDark(e.matches);
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Initial check
    if (currentTheme === 'system') {
      setIsDark(mediaQuery.matches);
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [currentTheme]);

  // Apply theme when currentTheme changes
  useEffect(() => {
    if (currentTheme !== 'system') {
      setIsDark(currentTheme === 'dark');
      applyTheme(currentTheme);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Apply theme to document
  const applyTheme = (themeName) => {
    const root = document.documentElement;
    
    if (themeName === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeName === 'dark' ? '#0f172a' : '#ffffff');
    }
  };

  // Change theme
  const changeTheme = (newTheme) => {
    if (themes[newTheme] || newTheme === 'system') {
      setCurrentTheme(newTheme);
    }
  };

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  // Get current theme object
  const getCurrentTheme = () => {
    if (currentTheme === 'system') {
      return themes[isDark ? 'dark' : 'light'];
    }
    return themes[currentTheme] || themes.light;
  };

  const value = {
    currentTheme,
    theme: getCurrentTheme(),
    isDark,
    themes,
    changeTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;