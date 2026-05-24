import { COLORS } from '../../../theme/tokens';
import { formFieldTokens } from '../shared/formField.tokens';

const locationInput = {
  wrapper: { marginBottom: '20px' },
  label: {
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'start' as const,
    fontSize: '0.85rem',
  },
  sublabel: { fontSize: '0.75rem', color: COLORS.textMuted, mb: '2px' },
  fieldRow: { marginBottom: '8px' },
  autocomplete: formFieldTokens.autocomplete,
  textField: formFieldTokens.standardTextField,
} as const;

export default locationInput;
