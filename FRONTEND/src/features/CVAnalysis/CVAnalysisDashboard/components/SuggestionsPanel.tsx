import { Box, Card, Divider, Typography } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import cvAnalysisDashboard from '../cvAnalysisDashboard.tokens';
import type { SectionImprovement } from '../CVAnalysisDashboard.types';

interface SuggestionsPanelProps {
  sectionsToImprove: SectionImprovement[];
}

const SuggestionsPanel = ({ sectionsToImprove }: SuggestionsPanelProps) => {
  const { t } = useTranslation();

  return (
    <Card elevation={0} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${COLORS.borderLight}` }}>
      <Typography variant="h5" sx={cvAnalysisDashboard.feedbackTitle}>
        {t('Actionable Suggestions')}
      </Typography>
      {sectionsToImprove.length > 0 ? (
        sectionsToImprove.map((sugg, i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 'bold', color: COLORS.textPrimary, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightbulbOutlinedIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
              {sugg.section}
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, ml: 3.5 }}>{sugg.suggestion}</Typography>
            {sugg.evidence && (
              <Box sx={{ ml: 3.5, mt: 1.5, p: 2, borderRadius: '12px', bgcolor: COLORS.primaryAlpha12 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: COLORS.primary, mb: 0.75 }}>
                  {t('Evidence')}
                </Typography>
                {sugg.evidence.cvExcerpt && (
                  <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.5 }}>
                    <strong>{t('CV excerpt')}:</strong> “{sugg.evidence.cvExcerpt}”
                  </Typography>
                )}
                {sugg.evidence.jobRequirement && (
                  <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mb: 0.5 }}>
                    <strong>{t('Job requirement')}:</strong> “{sugg.evidence.jobRequirement}”
                  </Typography>
                )}
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
                  <strong>{t('Why it matters')}:</strong> {sugg.evidence.rationale}
                </Typography>
              </Box>
            )}
            {i < sectionsToImprove.length - 1 && <Divider sx={{ mt: 3, opacity: 0.5 }} />}
          </Box>
        ))
      ) : (
        <Typography sx={{ color: COLORS.textSecondary }}>{t('No specific section improvements suggested.')}</Typography>
      )}
    </Card>
  );
};

export default SuggestionsPanel;
