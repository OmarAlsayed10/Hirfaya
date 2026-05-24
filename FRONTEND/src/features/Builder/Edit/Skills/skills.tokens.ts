import { COLORS, RADIUS } from '../../../../theme/tokens';

const skills = {
  root: {
    width: '100%',
    margin: '0 auto',
    borderRadius: RADIUS.md,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.textDark,
    mb: 2,
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
    fontSize: '0.8rem',
    padding: '4px 12px',
    boxShadow: 'none',
    mt: -1,
    height: 'fit-content',
  },
  skillsAreaEmpty: {
    minHeight: '40px',
    border: `1px dashed ${COLORS.disabled}`,
    borderRadius: RADIUS.md,
    padding: '8px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  skillsAreaFilled: {
    minHeight: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  chipDeleteIcon: {
    color: '#ff4444',
  },
} as const;

export default skills;
