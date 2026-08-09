import { COLORS, RADIUS } from '../../../../../theme/tokens';

const footerNewsletter = {
  title: {
    color: COLORS.onAccent,
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
    '& input::placeholder': { color: COLORS.primaryMuted, opacity: 1 },
  },
  subscribeBtn: {
    backgroundColor: COLORS.primarySurface,
    color: COLORS.onAccent,
    borderRadius: RADIUS.md,
    py: 1,
    boxShadow: 'none',
    fontSize: '0.82rem',
    '&:hover': { backgroundColor: COLORS.primarySurfaceDark, boxShadow: 'none' },
  },
} as const;

export default footerNewsletter;
