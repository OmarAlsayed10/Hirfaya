import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../../../theme/tokens';

const heroCVMockup = {
  floatWrapper: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
  },
  badge: {
    position: 'absolute' as const,
    top: -20,
    right: -20,
    bgcolor: COLORS.primary,
    color: COLORS.bgWhite,
    px: 2,
    py: 1,
    borderRadius: RADIUS.md,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    zIndex: 10,
    boxShadow: `0 10px 25px ${COLORS.primaryAlpha20}`,
  },
  badgeText: { fontWeight: 500, fontSize: TYPOGRAPHY.sizeSm },
  card: {
    width: '100%',
    backgroundColor: COLORS.bgWhite,
    borderRadius: RADIUS.lg,
    border: `1px solid ${COLORS.borderLight}`,
    padding: { xs: 3, md: 4 },
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 30px 60px -12px rgba(0,0,0,0.12)',
      transform: 'translateY(-4px)',
    },
  },
  profileRow: { display: 'flex', alignItems: 'center', gap: 2, mb: 1 },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.bgIconTinted,
    borderRadius: RADIUS.full,
  },
  profileLines: { display: 'flex', flexDirection: 'column' as const, gap: 1.5, flex: 1 },
  nameLine: { height: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.xs },
  roleLine: { height: 12, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.xs },
  divider: { borderBottom: `1px solid ${COLORS.bgHover}` },
  sectionRow: { display: 'flex', flexDirection: 'column' as const, gap: 1.5 },
  sectionTitle: { height: 14, backgroundColor: COLORS.disabled, borderRadius: RADIUS.xs },
  sectionLine: { height: 10, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.xs },
} as const;

export default heroCVMockup;
