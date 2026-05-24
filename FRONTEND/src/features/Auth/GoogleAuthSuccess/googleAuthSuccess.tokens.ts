import { COLORS } from '../../../theme/tokens';

const googleAuthSuccess = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  progress: {
    color: COLORS.primary,
  },
} as const;

export default googleAuthSuccess;
