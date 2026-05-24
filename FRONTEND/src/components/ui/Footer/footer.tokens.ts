import { COLORS } from '../../../theme/tokens';

const footer = {
  root: {
    backgroundColor: COLORS.bgDark,
    color: COLORS.primaryPale,
    pt: { xs: 8, md: 10 },
    pb: 4,
    position: 'relative' as const,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${COLORS.primary} 40%, ${COLORS.primaryLight} 60%, transparent)`,
    },
  },
  bgGlow: {
    position: 'absolute' as const,
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${COLORS.primaryAlpha12} 0%, transparent 70%)`,
    pointerEvents: 'none' as const,
  },
  inner: { maxWidth: 'lg', mx: 'auto', px: { xs: 2, md: 6 } },
  grid: { overflow: 'hidden' },
} as const;

export default footer;
