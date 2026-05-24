import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';

const personal = {
  root: {
    width: '100%',
    margin: '0 auto',
    padding: '12px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: '16px',
    color: COLORS.textDark,
    textAlign: 'start',
    fontSize: TYPOGRAPHY.sizeMd,
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  halfWidth: {
    width: '50%',
  },
} as const;

export default personal;
