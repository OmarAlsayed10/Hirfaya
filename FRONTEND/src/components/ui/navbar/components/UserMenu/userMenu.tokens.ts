import { COLORS } from '../../../../../theme/tokens';

const userMenu = {
  trigger: { p: 0, marginInlineEnd: 2 },
  popover: { mt: 1.5 },
  menuBox: { p: 2, minWidth: 200 },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    pb: 1.5,
    mb: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  avatar: { width: 40, height: 40 },
  userName: { fontSize: 14, fontWeight: 600 },
  userEmail: { fontSize: 12, color: COLORS.textSecondary },
  langBox: { display: 'flex', alignItems: 'center', width: '100%' },
  langLabel: { fontSize: '14px', mx: 1 },
} as const;

export default userMenu;
