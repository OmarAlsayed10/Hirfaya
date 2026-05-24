import { COLORS, TYPOGRAPHY, RADIUS } from '../../../../theme/tokens';

const grammarCheckResults = {
  paper: {
    p: 3,
    borderRadius: '24px',
    border: `1px solid ${COLORS.borderLight}`,
    display: 'flex',
    flexDirection: 'column',
    bgcolor: COLORS.bgWhite,
    minHeight: '500px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    fontFamily: TYPOGRAPHY.fontSerif,
    mb: 2,
  },
  tabs: {
    minHeight: '40px',
    mb: 3,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    '& .MuiTabs-indicator': { backgroundColor: COLORS.primary, height: '3px', borderRadius: '3px 3px 0 0' },
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 'bold',
      color: COLORS.textSecondary,
      minHeight: '40px',
      fontSize: '1rem',
      '&.Mui-selected': { color: COLORS.primary },
    },
  },
  issueCard: {
    mb: 2,
    backgroundColor: '#fdfbf7',
    border: '1px solid rgba(26,26,24,0.08)',
    borderRadius: '16px',
    transition: '0.2s',
    '&:hover': { borderColor: `${COLORS.primaryAlpha35}` },
  },
  fixButton: {
    fontSize: '0.8rem',
    px: 1.5,
    py: 0.5,
    borderRadius: RADIUS.md,
    color: COLORS.primary,
    borderColor: `${COLORS.primaryAlpha35}`,
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': { bgcolor: COLORS.primaryAlpha12, borderColor: COLORS.primary },
  },
} as const;

export default grammarCheckResults;
