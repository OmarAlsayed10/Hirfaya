import { Box, Typography, Paper, Button, Skeleton, CircularProgress } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTranslation } from 'react-i18next';
import getStartVisualizer from './getStartVisualizer.tokens';
import { COLORS } from '../../../../theme/tokens';
import type { GetStartVisualizerProps } from './GetStartVisualizer.types';

export const GetStartVisualizer = ({ activeStep, activeData }: GetStartVisualizerProps) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={0} sx={getStartVisualizer.paper}>
      <Box sx={getStartVisualizer.previewArea}>
        {activeStep === 0 && (
          <Box sx={getStartVisualizer.builderPreview}>
            <Paper elevation={3} sx={{ p: 4, width: 220, height: 280, borderRadius: 2 }}>
              <Skeleton variant="rectangular" height={24} sx={{ mb: 3, borderRadius: 1 }} />
              <Skeleton variant="text" width="50%" sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Paper>
          </Box>
        )}
        {activeStep === 1 && (
          <Box sx={getStartVisualizer.grammarPreview}>
            <Paper elevation={1} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', width: '100%', maxWidth: 450 }}>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: '1.2rem', lineHeight: 1.8 }}>
                I{' '}
                <span style={{ textDecoration: 'line-through', color: COLORS.accentOrange, opacity: 0.6 }}>done</span>{' '}
                <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>completed</span>
                {' '}the project{' '}
                <span style={{ textDecoration: 'line-through', color: COLORS.accentOrange, opacity: 0.6 }}>good</span>{' '}
                <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>successfully</span>.
              </Typography>
            </Paper>
            <Box sx={getStartVisualizer.fixIconBadge}>
              <AutoFixHighIcon />
            </Box>
          </Box>
        )}
        {activeStep === 2 && (
          <Box sx={getStartVisualizer.analyzerPreview}>
            <Paper elevation={2} sx={{ p: 4, width: 280, borderRadius: 3, textAlign: 'center', border: `1px solid ${COLORS.primaryAlpha20}` }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress variant="determinate" value={85} size={90} thickness={4} sx={{ color: COLORS.primary }} />
                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h5" component="div" sx={{ color: COLORS.primary, fontWeight: 'bold' }}>85</Typography>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 'bold', mb: 1 }}>{t('Exceptional')}</Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>{t('Your resume is well-optimized for ATS systems.')}</Typography>
            </Paper>
          </Box>
        )}
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', width: '100%' }}>
        <Typography sx={{ color: COLORS.textSecondary, fontSize: '1.1rem', mb: 3, minHeight: 40 }}>
          {activeData.subtitle}
        </Typography>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={activeData.onClick}
          sx={getStartVisualizer.actionButton}
        >
          {activeData.action}
        </Button>
      </Box>
    </Paper>
  );
};
