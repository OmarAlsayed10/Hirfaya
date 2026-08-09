// Every colour resolves through a CSS variable defined in theme/palette.css, so the
// light/dark palettes swap without any call site changing. Literal hex belongs only
// where the output must never follow the UI theme (CV previews, generated PDFs).
export const COLORS = {
  primary: 'var(--color-primary)',
  primaryDark: 'var(--color-primary-dark)',
  // Filled/button green. Darker than `primary` in dark mode so white label text
  // clears 4.5:1; `primary` stays lighter for accents sitting ON a dark page.
  primarySurface: 'var(--color-primary-surface)',
  primarySurfaceDark: 'var(--color-primary-surface-dark)',
  primaryLight: 'var(--color-primary-light)',
  primaryMuted: 'var(--color-primary-muted)',
  primaryPale: 'var(--color-primary-pale)',
  primaryAlpha12: 'var(--color-primary-a12)',
  primaryAlpha20: 'var(--color-primary-a20)',
  primaryAlpha35: 'var(--color-primary-a35)',

  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textDark: 'var(--color-text-dark)',
  textMedium: 'var(--color-text-medium)',
  textMuted: 'var(--color-text-muted)',

  bgLight: 'var(--color-bg-light)',
  bgDark: 'var(--color-bg-dark)',
  bgWhite: 'var(--color-bg-white)',
  bgIconTinted: 'var(--color-bg-icon-tinted)',
  bgHover: 'var(--color-bg-hover)',
  bgRaised: 'var(--color-bg-raised)',
  // Foreground for text/icons sitting ON primary or on a dark surface: stays
  // near-white in BOTH themes. bgWhite is a surface and must never be used here.
  onAccent: 'var(--color-on-accent)',

  borderLight: 'var(--color-border-light)',
  borderMedium: 'var(--color-border-medium)',
  borderDark: 'var(--color-border-dark)',

  disabled: 'var(--color-disabled)',
  gold: 'var(--color-gold)',
  goldLight: 'var(--color-gold-light)',

  danger: 'var(--color-danger)',
  dangerDark: 'var(--color-danger-dark)',
  dangerSoft: 'var(--color-danger-soft)',
  dangerBorder: 'var(--color-danger-border)',
  warning: 'var(--color-warning)',
  warningSoft: 'var(--color-warning-soft)',
  success: 'var(--color-success)',
  successSoft: 'var(--color-success-soft)',
  accentOrange: 'var(--color-accent-orange)',
  accentOrangeSoft: 'var(--color-accent-orange-soft)',
  surfaceSubtle: 'var(--color-surface-subtle)',
  iconIdle: 'var(--color-icon-idle)',
} as const;

// Mirror of the backend avatarColor whitelist (profileService.ts). Keep in sync.
export const AVATAR_COLORS = [
  '#2a5c45', '#3d8b65', '#c25b1a', '#2f6f83',
  '#7a4fb5', '#b5424f', '#c69214', '#4a4a48',
] as const;

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
