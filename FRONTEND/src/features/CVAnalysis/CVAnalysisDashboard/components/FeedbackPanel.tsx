import { Box, Card, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import cvAnalysisDashboard from '../cvAnalysisDashboard.tokens';

interface FeedbackPanelProps {
  positiveFeedback: string[];
  negativeFeedback: string[];
  neutralFeedback: string[];
  atsCheckerNotes: string[];
}

const FeedbackPanel = ({ positiveFeedback, negativeFeedback, neutralFeedback, atsCheckerNotes }: FeedbackPanelProps) => {
  const { t } = useTranslation();

  return (
    <Card elevation={0} sx={cvAnalysisDashboard.feedbackCard}>
      <Typography variant="h5" sx={cvAnalysisDashboard.feedbackTitle}>
        {t('Detailed Feedback')}
      </Typography>

      {positiveFeedback.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={cvAnalysisDashboard.positiveFeedbackLabel}>
            <CheckCircleOutlineIcon /> {t('Strengths')}
          </Typography>
          {positiveFeedback.map((item, i) => (
            <Box key={i} sx={cvAnalysisDashboard.positiveFeedbackItem}>
              <Typography sx={{ color: COLORS.textPrimary }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {negativeFeedback.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={cvAnalysisDashboard.negativeFeedbackLabel}>
            <ErrorOutlineIcon /> {t('Critical Issues')}
          </Typography>
          {negativeFeedback.map((item, i) => (
            <Box key={i} sx={{ p: 2, mb: 1.5, bgcolor: 'rgba(183,28,28,0.05)', borderLeft: '4px solid #b71c1c', borderRadius: '4px 8px 8px 4px' }}>
              <Typography sx={{ color: COLORS.textPrimary }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {neutralFeedback.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={cvAnalysisDashboard.neutralFeedbackLabel}>
            <InfoOutlinedIcon /> {t('Warnings & Tips')}
          </Typography>
          {neutralFeedback.map((item, i) => (
            <Box key={i} sx={{ p: 2, mb: 1.5, bgcolor: 'rgba(194,91,26,0.05)', borderLeft: '4px solid #c25b1a', borderRadius: '4px 8px 8px 4px' }}>
              <Typography sx={{ color: COLORS.textPrimary }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {atsCheckerNotes.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 'bold', color: COLORS.textSecondary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutorenewIcon /> {t('ATS Technical Notes')}
          </Typography>
          {atsCheckerNotes.map((note, i) => (
            <Box key={i} sx={{ p: 2, mb: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderLeft: '4px solid #9e9e9e', borderRadius: '4px 8px 8px 4px' }}>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.95rem' }}>{note}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
};

export default FeedbackPanel;
