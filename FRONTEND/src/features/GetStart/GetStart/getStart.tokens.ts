import { COLORS } from '../../../theme/tokens';

const getStart = {
  root: {
    bgcolor: COLORS.bgLight,
    minHeight: '100vh',
    py: { xs: 4, md: 6 },
  },
  contentWrapper: {
    maxWidth: '1100px',
    mx: 'auto',
    px: 2,
  },
} as const;

export default getStart;
