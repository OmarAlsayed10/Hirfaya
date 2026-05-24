import { COLORS } from '../../../../../theme/tokens';

const chooseTemplate = {
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeIcon: {
    cursor: 'pointer',
    color: COLORS.textMuted,
    marginRight: '10px',
  },
  grid: {
    padding: 2,
    justifyContent: 'center',
  },
} as const;

export default chooseTemplate;
