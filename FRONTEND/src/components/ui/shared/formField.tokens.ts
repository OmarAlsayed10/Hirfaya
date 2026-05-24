import { COLORS, RADIUS, SHADOWS } from '../../../theme/tokens';

export const formFieldTokens = {
  autocomplete: {
    '& .MuiOutlinedInput-root': {
      padding: '0 8px',
      fontSize: '0.85rem',
      borderRadius: RADIUS.sm,
      '& fieldset': { borderColor: COLORS.borderMedium },
      '&:hover fieldset': { borderColor: COLORS.borderDark },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: '1px' },
      '&.Mui-focused': { boxShadow: SHADOWS.focus },
    },
  },
  standardTextField: {
    '& .MuiInput-input': {
      border: `1px solid ${COLORS.borderMedium}`,
      height: '26px',
      padding: '4px 8px',
      borderRadius: RADIUS.sm,
      fontSize: '0.85rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:focus': { borderColor: COLORS.primary, boxShadow: SHADOWS.focus },
    },
  },
} as const;
