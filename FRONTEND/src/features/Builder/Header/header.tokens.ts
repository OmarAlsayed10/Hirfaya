import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../../../theme/tokens';

const header = {
  appBar: {
    bgcolor: 'white',
    boxShadow: SHADOWS.sm,
    color: 'white',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontSerif,
    cursor: 'pointer',
  },
  subtitle: {
    color: 'text.secondary',
    fontSize: TYPOGRAPHY.sizeBase,
    mt: 0.5,
  },
  updateButton: {
    borderColor: COLORS.borderMedium,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.sm,
    '&:hover': { borderColor: COLORS.primary },
  },
  saveButton: {
    borderColor: COLORS.borderMedium,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.sm,
    '&:hover': { borderColor: COLORS.primary },
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
    color: 'white',
    boxShadow: 'none',
    borderRadius: RADIUS.sm,
    '&:hover': { backgroundColor: COLORS.primaryDark, boxShadow: 'none' },
  },
} as const;

export default header;
