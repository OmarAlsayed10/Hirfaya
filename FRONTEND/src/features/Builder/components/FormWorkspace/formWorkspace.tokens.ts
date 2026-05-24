import { COLORS, RADIUS } from '../../../../theme/tokens';

const formWorkspace = {
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  stepperPaper: {
    bgcolor: 'white',
    borderRadius: 4,
    border: `1px solid ${COLORS.borderLight}`,
  },
  contentPaper: {
    bgcolor: 'white',
    borderRadius: 4,
    border: `1px solid ${COLORS.borderLight}`,
  },
  stepContent: {
    minHeight: '400px',
  },
  navigationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 4,
    pt: 3,
    borderTop: '1px solid rgba(0,0,0,0.05)',
  },
  backButton: {
    px: 4,
    borderRadius: 2,
    color: COLORS.textSecondary,
    borderColor: COLORS.disabled,
  },
  nextButton: {
    bgcolor: COLORS.primary,
    px: 5,
    borderRadius: 2,
    '&:hover': { bgcolor: '#1a3c2d' },
    boxShadow: 'none',
  },
} as const;

export default formWorkspace;
