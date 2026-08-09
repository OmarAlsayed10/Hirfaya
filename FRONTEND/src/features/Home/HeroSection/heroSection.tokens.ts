import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../../../theme/tokens';

const heroSection = {
  root: {
    overflowX: 'hidden',
    bgcolor: COLORS.bgLight,
  },
  container: {
    px: { xs: 2, md: 4 },
    py: { xs: 8, md: 12 },
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 3,
  },
  headlineBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    alignItems: 'center',
    zIndex: 1,
  },
  eyebrow: {
    fontSize: '12px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: COLORS.primary,
    fontWeight: 500,
  },
  h1: {
    fontSize: { xs: '2.5rem', md: '3.5rem' },
    fontFamily: TYPOGRAPHY.fontSerif,
    lineHeight: 1.1,
    color: COLORS.textPrimary,
  },
  accent: {
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: '17px',
    lineHeight: 1.7,
    maxWidth: '600px',
  },
  buttonRow: {
    display: 'flex',
    gap: 2,
    mt: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    px: 4,
    py: 1.5,
    borderRadius: RADIUS.sm,
    boxShadow: 'none',
    backgroundColor: COLORS.primarySurface,
    color: COLORS.onAccent,
    '&:hover': { backgroundColor: COLORS.primarySurfaceDark, boxShadow: 'none' },
  },
  outlinedButton: {
    px: 4,
    py: 1.5,
    borderRadius: RADIUS.sm,
    borderColor: COLORS.borderLight,
    color: COLORS.textPrimary,
  },
  mockupWrapper: {
    width: '100%',
    mt: { xs: 4, md: 6 },
    zIndex: 1,
  },
} as const;

export default heroSection;
