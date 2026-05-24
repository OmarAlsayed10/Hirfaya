import { COLORS, RADIUS, SHADOWS } from '../../../theme/tokens';

const proWarning = {
  paper: {
    borderRadius: 5,
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(16px)',
    boxShadow: SHADOWS.xl,
    px: 3,
    py: 2,
  },
  iconWrapper: {
    background: `radial-gradient(circle, ${COLORS.goldLight} 40%, transparent 70%)`,
    borderRadius: RADIUS.full,
    p: 1,
  },
  icon: {
    fontSize: 60,
    color: COLORS.gold,
    filter: `drop-shadow(0 0 8px ${COLORS.gold})`,
  },
  title: {
    textAlign: 'center' as const,
    fontWeight: 800,
    fontSize: 24,
    color: COLORS.textDark,
    mt: 1,
  },
  content: { textAlign: 'center' as const },
  bodyText: {
    color: COLORS.textMedium,
    fontSize: 16,
    lineHeight: 1.6,
    mt: 1,
  },
  divider: { my: 2 },
  actions: { justifyContent: 'center', pb: 2 },
  btnCancel: {
    borderRadius: 3,
    textTransform: 'none' as const,
    fontWeight: 500,
    px: 3,
    py: 1,
    borderColor: '#ccc',
    '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#bbb' },
  },
  btnUpgrade: {
    backgroundColor: COLORS.primary,
    color: COLORS.bgWhite,
    fontWeight: 'bold',
    borderRadius: 3,
    textTransform: 'none' as const,
    px: 4,
    py: 1.25,
    ml: 2,
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      backgroundColor: COLORS.primaryDark,
      boxShadow: 'none',
    },
  },
} as const;

export default proWarning;
