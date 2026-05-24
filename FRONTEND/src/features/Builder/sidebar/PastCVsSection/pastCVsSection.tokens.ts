import { COLORS, RADIUS } from '../../../../theme/tokens';

const pastCVsSection = {
  root: {
    py: 2,
    px: 2,
    bgcolor: 'white',
    borderRadius: 2,
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    gap: 2,
  },
  cvItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 1,
    cursor: 'pointer',
    '&:hover': { bgcolor: '#f5f5f5' },
  },
  cvItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
} as const;

export default pastCVsSection;
