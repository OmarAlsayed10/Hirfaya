import { COLORS, RADIUS } from '../../../../theme/tokens';

const grammarCheckInput = {
  paper: {
    p: { xs: 3, md: 4 },
    borderRadius: '24px',
    border: `1px solid ${COLORS.borderLight}`,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    bgcolor: 'white',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: '#fdfbf7',
      fontSize: '1.05rem',
      lineHeight: 1.6,
      '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
      '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: '2px' },
    },
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
    mt: 3,
    pt: 3,
    borderTop: '1px solid rgba(0,0,0,0.05)',
  },
  clearButton: {
    color: '#c25b1a',
    fontWeight: 'bold',
    textTransform: 'none',
    px: 2,
    '&:hover': { bgcolor: 'rgba(194, 91, 26, 0.05)' },
  },
  checkButton: {
    py: 1.5,
    px: 4,
    borderRadius: RADIUS.xl,
    bgcolor: COLORS.primary,
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '1.05rem',
    boxShadow: '0 4px 12px rgba(42,92,69,0.2)',
    '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: '0 6px 16px rgba(42,92,69,0.3)' },
    '&:disabled': { bgcolor: 'rgba(42,92,69,0.5)', color: 'white' },
  },
} as const;

export default grammarCheckInput;
