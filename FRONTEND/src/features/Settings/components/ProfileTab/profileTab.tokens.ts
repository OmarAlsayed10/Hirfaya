import { COLORS, RADIUS, TYPOGRAPHY } from '../../../../theme/tokens';

const profileTab = {
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontSerif,
    fontSize: '22px',
    mb: 3,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    bgcolor: 'background.paper',
    borderRadius: RADIUS.full,
    boxShadow: 1,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': { bgcolor: 'grey.100' },
  },
  removePhotoButton: {
    textTransform: 'none',
    fontSize: 11,
    p: 0,
    mt: 0.5,
    minWidth: 0,
    color: COLORS.primaryMuted,
    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: RADIUS.md,
    },
  },
  saveButton: {
    borderRadius: RADIUS.md,
  },
  dangerSection: {
    mt: 5,
    pt: 3,
    borderTop: '1px solid',
    borderColor: 'divider',
  },
  deleteButton: {
    textTransform: 'none',
    p: 0,
    fontWeight: 500,
    minWidth: 0,
    color: COLORS.accentOrange,
    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
  },
  confirmDeleteButton: {
    bgcolor: COLORS.accentOrange,
    color: COLORS.onAccent,
    '&:hover': { bgcolor: COLORS.accentOrange },
    borderRadius: RADIUS.md,
  },
} as const;

export default profileTab;
