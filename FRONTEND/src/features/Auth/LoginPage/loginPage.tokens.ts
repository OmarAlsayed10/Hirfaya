import { COLORS, TYPOGRAPHY, RADIUS } from '../../../theme/tokens';

const loginPage = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: COLORS.bgLight,
    padding: { xs: 2, md: 4 },
    position: 'relative',
  },
  homeLink: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  homeLinkColor: {
    color: COLORS.primary,
  },
  paper: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: COLORS.bgWhite,
    borderRadius: RADIUS.lg,
    border: `1px solid ${COLORS.borderLight}`,
    padding: { xs: 3, sm: 4 },
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  title: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontSerif,
    fontSize: { xs: '1.5rem', sm: '2rem' },
  },
  button: {
    padding: '12px 16px',
    fontWeight: 500,
    fontSize: '1rem',
    backgroundColor: COLORS.primarySurface,
    color: COLORS.onAccent,
    boxShadow: 'none',
    borderRadius: RADIUS.sm,
    '&:hover': {
      backgroundColor: COLORS.primarySurfaceDark,
      boxShadow: 'none',
    },
  },
  helperText: {
    textAlign: 'center',
    fontSize: '14px',
    color: COLORS.textSecondary,
  },
  link: {
    color: COLORS.primary,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
} as const;

export default loginPage;
