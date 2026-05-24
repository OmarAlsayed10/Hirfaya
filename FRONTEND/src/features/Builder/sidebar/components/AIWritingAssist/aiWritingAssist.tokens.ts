import { COLORS } from '../../../../../theme/tokens';

const aiWritingAssist = {
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
  list: {
    pt: 0,
    px: 2,
    pb: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    px: 4,
    py: 3,
    gap: '30px',
  },
  generateButton: {
    width: '50%',
    mx: 'auto',
    alignSelf: 'center',
    mb: 3,
  },
  contentArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
  },
  tipsTitle: {
    fontWeight: 'bold',
    mb: 1,
  },
  tipsList: {
    marginLeft: '1.2rem',
    color: COLORS.textMuted,
    listStyleType: 'disc',
  },
} as const;

export default aiWritingAssist;
