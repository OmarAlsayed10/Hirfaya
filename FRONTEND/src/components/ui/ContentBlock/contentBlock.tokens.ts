import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../theme/tokens';

const contentBlock = {
  root: { textAlign: 'center' as const },
  iconWrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    justifyContent: 'center',
    mb: 2,
  },
  circleTinted: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    bgcolor: COLORS.bgIconTinted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleWhite: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgWhite,
    border: `2px solid ${COLORS.primaryAlpha20}`,
    boxShadow: SHADOWS.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    position: 'absolute' as const,
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySurface,
    color: COLORS.onAccent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: TYPOGRAPHY.sizeXs,
    fontWeight: 800,
  },
  headlineSection: {
    fontFamily: TYPOGRAPHY.fontSerif,
    color: COLORS.textPrimary,
    fontSize: { xs: TYPOGRAPHY.size2xl, md: TYPOGRAPHY.size3xl },
    lineHeight: 1.15,
    mb: 2,
  },
  headlineCard: {
    fontFamily: TYPOGRAPHY.fontSerif,
    fontSize: TYPOGRAPHY.sizeXl,
    color: COLORS.textPrimary,
    mb: 2,
  },
  textSection: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizeMd,
    lineHeight: 1.75,
  },
  textCard: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizeBase,
    lineHeight: 1.75,
    maxWidth: '260px',
    mx: 'auto',
  },
} as const;

export default contentBlock;
