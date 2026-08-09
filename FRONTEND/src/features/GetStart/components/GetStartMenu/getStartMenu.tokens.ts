import { COLORS, TYPOGRAPHY, SHADOWS } from '../../../../theme/tokens';

const getStartMenu = {
  root: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    justifyContent: 'center',
    gap: 3,
  },
  item: (isActive: boolean) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    cursor: 'pointer',
    p: 2.5,
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    bgcolor: isActive ? COLORS.bgWhite : 'transparent',
    boxShadow: isActive ? SHADOWS.md : 'none',
    border: isActive ? `1px solid ${COLORS.primaryAlpha20}` : '1px solid transparent',
    '&:hover': { bgcolor: isActive ? COLORS.bgWhite : COLORS.bgHover },
  }),
  dot: (isActive: boolean) => ({
    width: isActive ? 20 : 14,
    height: isActive ? 20 : 14,
    borderRadius: '50%',
    bgcolor: isActive ? COLORS.primary : COLORS.borderLight,
    transition: 'all 0.3s ease',
  }),
  title: (isActive: boolean) => ({
    fontFamily: TYPOGRAPHY.fontSerif,
    color: isActive ? COLORS.primary : COLORS.textPrimary,
    transition: '0.3s',
    fontSize: isActive ? '1.4rem' : '1.2rem',
  }),
} as const;

export default getStartMenu;
