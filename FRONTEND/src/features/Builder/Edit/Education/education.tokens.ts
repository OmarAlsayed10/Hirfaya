import { COLORS, RADIUS } from '../../../../theme/tokens';

const education = {
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
    fontSize: '0.85rem',
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
  },
  deleteButton: {
    color: '#ff4444',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  halfWidth: {
    flex: 1,
    minWidth: 0,
  },
  quarterWidth: {
    flex: 0.5,
    minWidth: 0,
  },
} as const;

export default education;
