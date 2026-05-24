import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from '../Header';
import { FormWorkspace } from '../components/FormWorkspace';
import { LivePreviewPane } from '../components/LivePreviewPane';
import { usePreview } from '../../../hooks/usePreview';
import builder from './builder.tokens';

const Builder = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { goToPreview } = usePreview();

  return (
    <Box sx={builder.root}>
      <Header />

      <Box sx={builder.contentRow}>
        <Box sx={{
          width: isMobile ? (goToPreview ? '0%' : '100%') : '50%',
          display: goToPreview && isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.5s',
          pb: 8,
        }}>
          <FormWorkspace />
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'none' }} />
        )}
        <Box sx={{
          width: isMobile ? (goToPreview ? '100%' : '0%') : '50%',
          display: !goToPreview && isMobile ? 'none' : 'flex',
          ...builder.previewPane,
        }}>
          <LivePreviewPane />
        </Box>
      </Box>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default Builder;
