import { COLORS, RADIUS } from '../../../../../theme/tokens';

const footerBrand = {
  logoRow: { cursor: 'pointer', mb: 2 },
  logoIconBox: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { color: COLORS.bgWhite, fontSize: '18px' },
  logoText: { color: COLORS.bgWhite, letterSpacing: '-0.3px' },
  subtitle: {
    color: COLORS.primaryMuted,
    lineHeight: 1.8,
    maxWidth: '260px',
    mb: 3,
    fontSize: '0.9rem',
  },
  socialRow: { display: 'flex', gap: 0.5 },
  socialBtn: {
    color: COLORS.primaryMuted,
    border: `1px solid ${COLORS.primaryAlpha35}`,
    borderRadius: RADIUS.md,
    '&:hover': {
      backgroundColor: COLORS.primaryAlpha20,
      borderColor: COLORS.primary,
      color: COLORS.primaryLight,
    },
    transition: 'all 0.2s ease',
  },
} as const;

export default footerBrand;
