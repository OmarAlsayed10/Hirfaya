import { COLORS, RADIUS } from '../../../../theme/tokens';

const creditCardForm = {
  submitButton: {
    py: 1.5,
    fontWeight: 'bold',
    borderRadius: RADIUS.md,
    bgcolor: COLORS.primary,
    color: COLORS.bgWhite,
    transition: '0.3s',
    boxShadow: 'none',
    ':hover': {
      bgcolor: COLORS.primaryDark,
      boxShadow: 'none',
    },
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: RADIUS.md,
    },
  },
} as const;

export default creditCardForm;
