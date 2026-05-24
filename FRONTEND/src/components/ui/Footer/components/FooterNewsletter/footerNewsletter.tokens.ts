import { COLORS, RADIUS } from '../../../../../theme/tokens';

const footerNewsletter = {
  title: {
    color: COLORS.bgWhite,
    fontWeight: 700,
    letterSpacing: '1.2px',
    fontSize: '0.72rem',
    display: 'block',
    mb: 2.5,
  },
  subtitle: { color: COLORS.primaryMuted, fontSize: '0.88rem', mb: 2, lineHeight: 1.7 },
  form: { display: 'flex', flexDirection: 'column' as const, gap: 1.5, maxWidth: '100%' },
  emailField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: RADIUS.md,
      color: COLORS.primaryPale,
      '& fieldset': { borderColor: 'rgba(42,92,69,0.4)' },
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary },
    },
    '& input::placeholder': { color: '#4d7a62', opacity: 1 },
  },
  subscribeBtn: {
    backgroundColor: COLORS.primary,
    color: COLORS.bgWhite,
    borderRadius: RADIUS.md,
    py: 1,
    boxShadow: 'none',
    fontSize: '0.82rem',
    '&:hover': { backgroundColor: COLORS.primaryDark, boxShadow: 'none' },
  },
} as const;

export default footerNewsletter;
