import { COLORS, RADIUS, SHADOWS } from '../../../theme/tokens';

const confirmDialog = {
  paper: {
    borderRadius: RADIUS.xl,
    boxShadow: SHADOWS.md,
    border: `1px solid ${COLORS.borderLight}`,
    maxWidth: 420,
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 3,
    pt: 3,
    pb: 1,
  },
  iconCircle: (destructive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: '50%',
    bgcolor: destructive ? 'error.light' : COLORS.primaryAlpha12,
    color: destructive ? 'error.main' : COLORS.primary,
  }),
  title: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  content: { px: 3, pb: 1 },
  message: {
    fontSize: '0.9rem',
    color: COLORS.textSecondary,
    lineHeight: 1.6,
  },
  actions: { px: 3, pb: 3, pt: 1, gap: 1 },
  cancelButton: {
    textTransform: 'none',
    borderRadius: RADIUS.md,
    px: 2.5,
    color: COLORS.textSecondary,
  },
  confirmButton: (destructive: boolean) => ({
    textTransform: 'none',
    borderRadius: RADIUS.md,
    px: 2.5,
    boxShadow: 'none',
    ...(destructive
      ? {}
      : { bgcolor: COLORS.primarySurface, '&:hover': { bgcolor: COLORS.primarySurfaceDark } }),
  }),
} as const;

export default confirmDialog;
