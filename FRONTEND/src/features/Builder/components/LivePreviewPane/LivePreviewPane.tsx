import { Box } from '@mui/material';
import Preview from '../../Preview';
import livePreviewPane from './livePreviewPane.tokens';

export const LivePreviewPane = () => {
  return (
    <Box sx={livePreviewPane.root}>
      <Box sx={livePreviewPane.inner}>
        <Preview />
      </Box>
    </Box>
  );
};
