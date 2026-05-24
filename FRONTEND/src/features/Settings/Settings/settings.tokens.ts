import { RADIUS } from '../../../theme/tokens';

const settings = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4,
    px: 2,
    height: '80vh',
    pb: 4,
  },
  paper: {
    display: 'flex',
    width: '100%',
    maxWidth: 1200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    height: '100%',
  },
  sidebar: {
    width: 160,
    borderRight: '1px solid',
    borderColor: 'divider',
    py: 2,
    flexShrink: 0,
  },
  navItem: (isActive: boolean, isDanger: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 2,
    py: 1,
    fontSize: 13,
    cursor: 'pointer',
    borderLeft: '2px solid',
    borderLeftColor: isActive ? 'primary.main' : 'transparent',
    bgcolor: isActive ? 'primary.50' : 'transparent',
    color: isDanger ? 'error.main' : isActive ? 'primary.main' : 'text.secondary',
    '&:hover': { bgcolor: 'action.hover' },
  }),
  content: {
    flex: 1,
    p: 3,
    overflowY: 'auto',
  },
} as const;

export default settings;
