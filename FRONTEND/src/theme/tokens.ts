export const COLORS = {
  primary: '#2a5c45',
  primaryDark: '#1e4332',
  primaryLight: '#3d8b65',
  primaryMuted: '#7a9e8e',
  primaryPale: '#c8d9ce',
  primaryAlpha12: 'rgba(42,92,69,0.12)',
  primaryAlpha20: 'rgba(42,92,69,0.2)',
  primaryAlpha35: 'rgba(42,92,69,0.35)',

  textPrimary: '#1a1a18',
  textSecondary: '#6b6b66',
  textDark: '#222',
  textMedium: '#444',
  textMuted: '#555',

  bgLight: '#f5f4ef',
  bgDark: '#0f1f17',
  bgWhite: '#ffffff',
  bgIconTinted: '#e8f2ec',
  bgHover: 'rgba(26,26,24,0.05)',

  borderLight: 'rgba(26,26,24,0.1)',
  borderMedium: 'rgba(26,26,24,0.18)',
  borderDark: 'rgba(26,26,24,0.2)',

  disabled: '#e0e0e0',
  gold: '#FFD700',
  goldLight: '#FFF8DC',
} as const;

export const TYPOGRAPHY = {
  fontSans: '"DM Sans", sans-serif',
  fontSerif: '"DM Serif Display", serif',
  sizeXs: '0.65rem',
  sizeSm: '0.85rem',
  sizeBase: '0.9rem',
  sizeMd: '1.05rem',
  sizeLg: '1.2rem',
  sizeXl: '1.5rem',
  size2xl: '2rem',
  size3xl: '2.8rem',
  size4xl: '3rem',
} as const;

export const RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '50%',
  pill: '50px',
} as const;

export const SHADOWS = {
  sm: '0 2px 4px rgba(0,0,0,0.05)',
  md: '0 8px 24px rgba(0,0,0,0.08)',
  lg: '0 8px 24px -8px rgba(42,92,69,0.12)',
  xl: '0 20px 45px rgba(0,0,0,0.25)',
  focus: '0 0 0 3px rgba(42,92,69,0.12)',
} as const;
