import { TYPOGRAPHY, RADIUS } from '../../../../theme/tokens';

const planTab = {
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontSerif,
    fontSize: '22px',
    mb: 3,
  },
  planBox: {
    bgcolor: 'grey.50',
    borderRadius: RADIUS.md,
    p: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    mt: 1,
    borderRadius: RADIUS.md,
    height: 5,
    width: 200,
  },
} as const;

export default planTab;
