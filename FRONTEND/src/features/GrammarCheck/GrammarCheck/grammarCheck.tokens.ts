import { COLORS } from '../../../theme/tokens';

const grammarCheck = {
  root: {
    bgcolor: COLORS.bgLight,
    minHeight: '100vh',
    py: { xs: 4, md: 6 },
  },
  contentStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    mt: 4,
  },
} as const;

export default grammarCheck;
