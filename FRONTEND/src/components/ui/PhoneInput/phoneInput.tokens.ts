import { formFieldTokens } from '../shared/formField.tokens';

const phoneInput = {
  wrapper: { marginBottom: '20px' },
  label: {
    fontWeight: 'bold',
    marginBottom: '2px',
    textAlign: 'start' as const,
    fontSize: '0.85rem',
  },
  row: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  codeBox: { width: '48%' },
  numberBox: { flex: 1 },
  autocomplete: formFieldTokens.autocomplete,
  textField: formFieldTokens.standardTextField,
} as const;

export default phoneInput;
