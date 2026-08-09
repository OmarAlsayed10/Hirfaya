import { createTheme } from '@mui/material/styles';
import { PALETTES } from '../theme/palettes';

export const buildTheme = (mode: 'light' | 'dark') => {
  const c = PALETTES[mode];
  const p = {
    primary: c['primary-surface'],
    primaryDark: c['primary-surface-dark'],
    accent: c.primary,
    bgDefault: c['bg-light'],
    bgPaper: c['bg-white'],
    textPrimary: c['text-primary'],
    textSecondary: c['text-secondary'],
    danger: c.danger,
    border: c['border-light'],
    borderStrong: c['border-dark'],
    hover: c['bg-hover'],
    onAccent: c['on-accent'],
  };

  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, dark: p.primaryDark },
      error: { main: p.danger },
      background: { default: p.bgDefault, paper: p.bgPaper },
      text: { primary: p.textPrimary, secondary: p.textSecondary },
      divider: p.border,
    },
    typography: {
      fontFamily: '"DM Sans", sans-serif',
      h1: { fontFamily: '"DM Serif Display", serif', fontWeight: 400 },
      h2: { fontFamily: '"DM Serif Display", serif', fontWeight: 400 },
      h3: { fontFamily: '"DM Serif Display", serif', fontWeight: 400 },
      h4: { fontFamily: '"DM Serif Display", serif', fontWeight: 400 },
      h5: { fontFamily: '"DM Serif Display", serif', fontWeight: 400 },
      h6: { fontFamily: '"DM Serif Display", serif', fontWeight: 400 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '6px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            backgroundColor: p.primary,
            color: p.onAccent,
            '&:hover': { backgroundColor: p.primaryDark },
          },
          outlined: {
            borderColor: p.border,
            color: p.textPrimary,
            '&:hover': { backgroundColor: p.hover, borderColor: p.borderStrong },
          },
        },
        defaultProps: { disableElevation: true },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              '&.Mui-focused fieldset': { borderColor: p.primary },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            boxShadow: 'none',
            border: `1px solid ${p.border}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCircularProgress: {
        styleOverrides: { root: { color: p.primary } },
      },
    },
  });
};

export const theme = buildTheme('light');
