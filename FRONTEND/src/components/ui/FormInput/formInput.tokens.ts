import { COLORS, RADIUS, SHADOWS } from '../../../theme/tokens';
import { formFieldTokens } from '../shared/formField.tokens';

const formInput = {
  wrapper: { marginBottom: '20px' },
  label: {
    fontWeight: 'bold',
    marginBottom: '2px',
    textAlign: 'start' as const,
    fontSize: '0.85rem',
  },
  row: { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  iconWrapper: { mt: 0.5 },
  iconWrapperMultiline: { mt: 1.5 },
  icon: { color: COLORS.textMuted, fontSize: '1rem' },
  fieldStandard: formFieldTokens.standardTextField,
  fieldMultiline: {
    '& .MuiOutlinedInput-root': {
      padding: '6px',
      borderRadius: RADIUS.sm,
      '& fieldset': { borderColor: COLORS.borderMedium },
      '&:hover fieldset': { borderColor: COLORS.borderDark },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: '1px' },
      '&.Mui-focused': { boxShadow: SHADOWS.focus },
      '& textarea': { padding: '4px', fontSize: '0.85rem', minHeight: '60px' },
    },
  },
} as const;

export default formInput;
