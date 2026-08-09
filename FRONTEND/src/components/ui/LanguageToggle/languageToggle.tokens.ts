import { COLORS, RADIUS } from '../../../theme/tokens';

const languageToggle = {
  group: {
    '& .MuiToggleButton-root': {
      px: 1.25,
      py: 0.25,
      minWidth: 40,
      lineHeight: 1.4,
      fontSize: '0.78rem',
      fontWeight: 700,
      textTransform: 'none',
      borderRadius: RADIUS.sm,
      borderColor: COLORS.borderMedium,
      color: COLORS.textSecondary,
      '&.Mui-selected': {
        bgcolor: COLORS.primarySurface,
        color: COLORS.onAccent,
        '&:hover': { bgcolor: COLORS.primarySurfaceDark },
      },
    },
  },
} as const;

export default languageToggle;
