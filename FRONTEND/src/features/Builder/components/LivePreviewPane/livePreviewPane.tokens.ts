import { COLORS } from '../../../../theme/tokens';

const livePreviewPane = {
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'visible',
  },
  inner: {
    width: '100%',
    bgcolor: COLORS.bgWhite,
  },
} as const;

export default livePreviewPane;
