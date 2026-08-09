import { COLORS, RADIUS } from '../../../../theme/tokens';

const experience = {
  root: {
    width: '100%',
    margin: '0 auto',
    padding: '12px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.textDark,
    fontSize: '1.1rem',
    textAlign: 'start',
  },
  addButton: {
    border: '1px dashed rgba(26,26,24,0.3)',
    borderColor: 'rgba(26,26,24,0.3)',
    color: COLORS.textPrimary,
    '&:hover': {
      borderColor: COLORS.primary,
      color: COLORS.primary,
      backgroundColor: COLORS.primaryAlpha12,
    },
    fontSize: COLORS.textSecondary,
    padding: '6px 12px',
    boxShadow: 'none',
  },
  entriesBox: {
    border: `1px solid ${COLORS.disabled}`,
    borderRadius: RADIUS.md,
    p: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'start',
  },
  deleteButton: {
    color: COLORS.danger,
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  halfWidth: {
    flex: 1,
    minWidth: 0,
  },
  fullWidth: {
    flex: 1,
    minWidth: 0,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'start',
  },
} as const;

export default experience;
