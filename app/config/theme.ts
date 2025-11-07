export const theme = {
  colors: {
    primary: '#6a2b9a',
    secondary: '#f9d423',
    accent: '#f1e15a',
    darkAccent: '#2c1a4a',
    lightAccent: '#c9b8e8',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  fonts: {
    primary: 'Montserrat, sans-serif',
    secondary: 'Inter, sans-serif'
  }
};

export type Theme = typeof theme;
