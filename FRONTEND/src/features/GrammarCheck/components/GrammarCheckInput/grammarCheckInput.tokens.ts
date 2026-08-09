import { COLORS, RADIUS } from '../../../../theme/tokens';

const grammarCheckInput = {
  paper: {
    p: { xs: 3, md: 4 },
    borderRadius: '24px',
    border: `1px solid ${COLORS.borderLight}`,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    bgcolor: COLORS.bgWhite,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      bgcolor: COLORS.surfaceSubtle,
      fontSize: '1.05rem',
      lineHeight: 1.6,
      '& fieldset': { borderColor: COLORS.borderLight },
      '&:hover fieldset': { borderColor: COLORS.borderLight },
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
    color: COLORS.accentOrange,
    fontWeight: 'bold',
    textTransform: 'none',
    px: 2,
    '&:hover': { bgcolor: 'rgba(194, 91, 26, 0.05)' },
  },
  checkButton: {
    py: 1.5,
    px: 4,
    borderRadius: RADIUS.xl,
    bgcolor: COLORS.primarySurface,
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '1.05rem',
    boxShadow: '0 4px 12px rgba(42,92,69,0.2)',
    '&:hover': { bgcolor: COLORS.primarySurfaceDark, boxShadow: '0 6px 16px rgba(42,92,69,0.3)' },
    '&:disabled': { bgcolor: 'rgba(42,92,69,0.5)', color: COLORS.onAccent },
  },
} as const;

export default grammarCheckInput;
