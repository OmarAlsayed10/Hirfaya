import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';

const grammarCheckHeader = {
  root: {
    mb: 4,
  },
  backButton: {
    color: COLORS.textSecondary,
    mb: 2,
    textTransform: 'none',
    fontWeight: 'bold',
    p: 0,
    '&:hover': { color: COLORS.primary, bgcolor: 'transparent' },
  },
  title: {
    fontSize: { xs: '2rem', md: '3rem' },
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontSerif,
    fontWeight: 'bold',
    mb: 1,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: COLORS.textSecondary,
    maxWidth: 600,
  },
} as const;

export default grammarCheckHeader;
