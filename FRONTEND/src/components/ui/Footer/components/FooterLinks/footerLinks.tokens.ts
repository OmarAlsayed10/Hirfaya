import { COLORS } from '../../../../../theme/tokens';

const footerLinks = {
  title: {
    color: COLORS.onAccent,
    fontWeight: 700,
    letterSpacing: '1.2px',
    fontSize: '0.72rem',
    display: 'block',
    mb: 2.5,
  },
  linkList: { display: 'flex', flexDirection: 'column' as const, gap: 1.5 },
  link: {
    color: COLORS.primaryMuted,
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
    '&:hover': { color: COLORS.primaryLight },
  },
} as const;

export default footerLinks;
