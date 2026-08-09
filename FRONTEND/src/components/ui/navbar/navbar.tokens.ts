import { COLORS } from '../../../theme/tokens';

const navbar = {
  appBar: {
    backgroundColor: COLORS.bgWhite,
    borderBottom: `1px solid ${COLORS.borderLight}`,
    height: '56px',
    justifyContent: 'center',
  },
  logoDesktop: {
    mr: 2,
    display: { xs: 'none', md: 'flex' },
    color: COLORS.textPrimary,
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '20px',
    cursor: 'pointer',
    fontFamily: '"DM Serif Display", serif',
  },
  logoMobile: {
    ml: 2,
    display: 'flex',
    flexGrow: 1,
    color: COLORS.textPrimary,
    textDecoration: 'none',
    cursor: 'pointer',
    alignItems: 'center',
    fontFamily: '"DM Serif Display", serif',
  },
  mobileMenuBox: { flexGrow: 1, display: { xs: 'flex', md: 'none' } },
  menuIcon: { color: COLORS.textPrimary },
  brandIcon: { color: COLORS.primary, mr: 1, fontSize: '30px' },
  brandIconSmall: { color: COLORS.primary, mr: 1 },
} as const;

export default navbar;
