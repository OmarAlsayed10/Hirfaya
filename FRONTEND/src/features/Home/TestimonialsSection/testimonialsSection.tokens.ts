import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../../../theme/tokens';

const testimonialsSection = {
  root: {
    py: { xs: 10, md: 14 },
    backgroundColor: COLORS.bgWhite,
    position: 'relative',
    overflow: 'hidden',
  },
  statsRow: {
    maxWidth: '1100px',
    mx: 'auto',
    px: { xs: 2, md: 6 },
    mb: { xs: 10, md: 12 },
  },
  statValue: {
    fontSize: { xs: '2.2rem', md: '3rem' },
    fontWeight: 800,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontSerif,
    lineHeight: 1,
    mb: 0.75,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizeBase,
    fontWeight: 500,
  },
  sectionHeader: {
    textAlign: 'center',
    mb: { xs: 6, md: 8 },
    px: 2,
  },
  chip: {
    mb: 2,
    backgroundColor: COLORS.bgIconTinted,
    color: COLORS.primary,
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontSerif,
    color: COLORS.textPrimary,
    fontSize: { xs: '2rem', md: '2.8rem' },
    lineHeight: 1.15,
  },
  grid: {
    maxWidth: '1100px',
    mx: 'auto',
    px: { xs: 2, sm: 4, md: 6 },
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  card: {
    p: 3.5,
    borderRadius: '14px',
    border: '1px solid rgba(26,26,24,0.08)',
    backgroundColor: COLORS.surfaceSubtle,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
    transition: 'box-shadow 0.25s ease',
    '&:hover': {
      boxShadow: '0 16px 40px -10px rgba(42,92,69,0.1)',
    },
  },
  quoteIcon: {
    color: COLORS.bgIconTinted,
    fontSize: '2.5rem',
    alignSelf: 'flex-start',
  },
  quoteText: {
    color: COLORS.textMedium,
    lineHeight: 1.75,
    fontSize: '0.92rem',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.primarySurface,
    fontSize: '1rem',
    fontWeight: 700,
  },
  authorName: {
    fontWeight: 700,
    fontSize: TYPOGRAPHY.sizeBase,
    color: COLORS.textPrimary,
  },
  authorRole: {
    fontSize: '0.78rem',
    color: COLORS.textSecondary,
  },
} as const;

export default testimonialsSection;
