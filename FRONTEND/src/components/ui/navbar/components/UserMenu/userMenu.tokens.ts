import { COLORS, RADIUS, SHADOWS } from '../../../../../theme/tokens';

const userMenu = {
  trigger: { p: 0.5, marginInlineEnd: 1 },
  triggerAvatar: {
    width: 38,
    height: 38,
    fontWeight: 600,
    border: '2px solid #fff',
    boxShadow: SHADOWS.sm,
    cursor: 'pointer',
  },
  paper: {
    mt: 1.5,
    width: 260,
    borderRadius: RADIUS.xl,
    boxShadow: SHADOWS.md,
    overflow: 'hidden',
    border: `1px solid ${COLORS.borderLight}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    p: 2,
    bgcolor: COLORS.bgLight,
  },
  avatar: { width: 44, height: 44, fontWeight: 600 },
  userName: { fontSize: 14, fontWeight: 700, color: COLORS.textPrimary },
  planChip: { height: 18, fontSize: 10, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } },
  userEmail: { fontSize: 12, color: COLORS.textSecondary },
  itemIcon: { minWidth: 30, color: COLORS.textMedium },
  itemLabel: { fontSize: 13.5, fontWeight: 500, color: COLORS.textMedium },
  logoutIcon: { minWidth: 30, color: 'error.main' },
  logoutLabel: { fontSize: 13.5, fontWeight: 500, color: 'error.main' },
  langRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2,
    py: 1,
    color: COLORS.textMedium,
  },
} as const;

export default userMenu;
