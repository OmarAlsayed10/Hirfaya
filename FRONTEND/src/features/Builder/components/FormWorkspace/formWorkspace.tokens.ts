import { COLORS } from '../../../../theme/tokens';

const formWorkspace = {
  stepContent: { flex: '1 1 auto', minHeight: 0, overflowX: 'hidden', overflowY: 'auto' },
  navigationRow: {
    flex: '0 0 auto',
    display: 'flex',
    gap: 2,
    mt: 1,
    px: 1.5,
    pb: 1,
  },
  backButton: { textTransform: 'none', px: 3, borderRadius: 2, color: COLORS.textSecondary },
  nextButton: {
    bgcolor: COLORS.primary,
    textTransform: 'none',
    px: 4,
    borderRadius: 2,
    boxShadow: 'none',
    '&:hover': { bgcolor: COLORS.primaryDark },
  },
} as const;

export default formWorkspace;
