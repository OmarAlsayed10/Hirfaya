import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';

const getStartHeader = {
  root: {
    textAlign: 'center',
    mb: 8,
    px: 2,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontSerif,
    mb: 2,
    fontSize: { xs: '2.5rem', md: '3.5rem' },
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: '1.1rem',
    maxWidth: '600px',
    mx: 'auto',
  },
} as const;

export default getStartHeader;
