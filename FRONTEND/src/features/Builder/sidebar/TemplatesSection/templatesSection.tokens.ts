import { COLORS, RADIUS } from '../../../../theme/tokens';

const templatesSection = {
  root: {
    py: 2,
    px: 3,
    bgcolor: 'white',
    borderRadius: 4,
    border: `1px solid ${COLORS.borderLight}`,
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
  },
  templateButton: {
    flex: 1,
    borderRadius: 2,
    py: 1.5,
    borderColor: COLORS.disabled,
    color: COLORS.textPrimary,
  },
  aiButton: {
    flex: 1,
    borderRadius: 2,
    py: 1.5,
    bgcolor: COLORS.primary,
    boxShadow: 'none',
    '&:hover': { bgcolor: '#1a3c2d', boxShadow: 'none' },
  },
} as const;

export default templatesSection;
