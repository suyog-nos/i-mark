import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getTheme = () => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#3b82f6' : '#2563eb',
        light: darkMode ? '#60a5fa' : '#3b82f6',
        dark: darkMode ? '#2563eb' : '#1d4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: darkMode ? '#fbbf24' : '#f59e0b',
        light: darkMode ? '#fcd34d' : '#fbbf24',
        dark: darkMode ? '#f59e0b' : '#d97706',
        contrastText: darkMode ? '#000000' : '#ffffff',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f1f5f9' : '#1e293b',
        secondary: darkMode ? '#94a3b8' : '#64748b',
      },
      success: {
        main: darkMode ? '#34d399' : '#10b981',
        light: darkMode ? '#6ee7b7' : '#34d399',
        dark: darkMode ? '#10b981' : '#059669',
      },
      error: {
        main: darkMode ? '#f87171' : '#ef4444',
        light: darkMode ? '#fca5a5' : '#f87171',
        dark: darkMode ? '#ef4444' : '#dc2626',
      },
      warning: {
        main: darkMode ? '#fbbf24' : '#f59e0b',
        light: darkMode ? '#fcd34d' : '#fbbf24',
        dark: darkMode ? '#f59e0b' : '#d97706',
      },
      info: {
        main: darkMode ? '#22d3ee' : '#06b6d4',
        light: darkMode ? '#67e8f9' : '#22d3ee',
        dark: darkMode ? '#06b6d4' : '#0891b2',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '3.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2.8rem',
        lineHeight: 1.3,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '2.2rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.8rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.3rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1.15rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        fontSize: '1rem',
        textTransform: 'none',
        borderRadius: '10px',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode
                ? '0 4px 12px rgba(59, 130, 246, 0.25)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease-in-out',
            },
          },
          contained: {
            background: darkMode
              ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            '&:hover': {
              background: darkMode
                ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: darkMode
              ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
              : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              boxShadow: darkMode
                ? '0 10px 25px rgba(0, 0, 0, 0.4)'
                : '0 10px 25px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: darkMode
              ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)'
              : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: darkMode
                ? 'rgba(59, 130, 246, 0.08)'
                : 'rgba(37, 99, 235, 0.04)',
              '&:hover fieldset': {
                borderColor: darkMode ? '#60a5fa' : '#3b82f6',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#3b82f6' : '#2563eb',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            boxShadow: darkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(37, 99, 235, 0.2)',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: '64px',
            '@media (min-width: 600px)': {
              minHeight: '64px',
            },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingTop: '16px',
            paddingBottom: '24px',
          },
          maxWidthLg: {
            maxWidth: '1440px',
          },
          maxWidthXl: {
            maxWidth: '1800px',
          },
        },
      },
    },
  });

  const value = {
    darkMode,
    toggleDarkMode,
    theme: getTheme(),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
