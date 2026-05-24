import { COLORS, RADIUS, TYPOGRAPHY } from '../../../theme/tokens';

const payment = {
  root: {
    background: '#f5f5fa',
    minHeight: '100vh',
    py: 6,
  },
  paper: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' } as const,
    borderRadius: RADIUS.lg,
    border: `1px solid ${COLORS.borderLight}`,
    overflow: 'hidden',
  },
  formSection: {
    flex: 2,
    p: 4,
    backgroundColor: COLORS.bgWhite,
  },
  formTitle: {
    fontFamily: TYPOGRAPHY.fontSerif,
    color: COLORS.textPrimary,
  },
} as const;

export default payment;
