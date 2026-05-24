import { COLORS } from '../../../../../theme/tokens';

const desktopNav = {
  root: {
    flexGrow: 1,
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'row reverse' as const,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '40px',
  },
  navLink: {
    color: COLORS.textSecondary,
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'color 0.2s',
    '&:hover': { color: COLORS.textPrimary },
  },
  ctaBtn: { fontSize: '12px' },
  getProBtn: {
    fontSize: '12px',
    borderColor: COLORS.primary,
    color: COLORS.primary,
    '&:hover': { borderColor: COLORS.primaryDark, backgroundColor: COLORS.primaryAlpha12 },
  },
  langBox: { display: 'flex', alignItems: 'center', width: '100%' },
  langLabel: { fontSize: '14px', mx: 1 },
} as const;

export default desktopNav;
