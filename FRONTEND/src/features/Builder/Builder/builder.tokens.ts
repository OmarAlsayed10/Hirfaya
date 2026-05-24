import { COLORS, RADIUS } from '../../../theme/tokens';

const builder = {
  root: {
    minHeight: '100vh',
    bgcolor: COLORS.bgLight,
    display: 'flex',
    flexDirection: 'column',
  },
  contentRow: {
    flexGrow: 1,
    p: { xs: 2, md: 4 },
    display: 'flex',
    gap: 4,
    maxWidth: '1800px',
    mx: 'auto',
    width: '100%',
  },
  previewPane: {
    flexGrow: 1,
    bgcolor: 'white',
    borderRadius: 4,
    border: `1px solid ${COLORS.primaryAlpha12}`,
    animation: 'fadeIn 0.5s',
  },
} as const;

export default builder;
