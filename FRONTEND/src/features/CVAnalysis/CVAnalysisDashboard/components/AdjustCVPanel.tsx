import { useState } from 'react';
import { Box, Card, Typography, Button, FormControlLabel, Checkbox } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import CVOptimizeModal from './CVOptimizeModal';
import type { useCVAdjust } from '../hooks/useCVAdjust';
import type { ScoreCategory } from '../CVAnalysisDashboard.types';

type AdjustCVPanelProps = ReturnType<typeof useCVAdjust> & {
  scoreBreakdown?: ScoreCategory[];
};

const AdjustCVPanel = ({
  modalOpen, openModal, closeModal,
  loading, error, adjustedCV, optimizedFormData, changes, newScore, newBreakdown, originalScore, pageCount,
  scoreBreakdown = [],
}: AdjustCVPanelProps) => {
  const { t } = useTranslation();
  const [applyJake, setApplyJake] = useState(false);

  // Points the enhancer could actually move — everything not gated behind real experience.
  const contentHeadroom = scoreBreakdown
    .filter((c) => c.earned < c.max && c.blocker !== 'experience')
    .reduce((sum, c) => sum + (c.max - c.earned), 0);
  const alreadyOptimized = scoreBreakdown.length > 0 && contentHeadroom <= 2;

  if (alreadyOptimized) {
    return (
      <Card elevation={0} sx={{ p: 4, borderRadius: '24px', border: `2px solid ${COLORS.primary}`, background: `linear-gradient(135deg, ${COLORS.primaryAlpha12} 0%, transparent 100%)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <VerifiedIcon sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary }}>
            {t('Your CV is already optimized')}
          </Typography>
        </Box>
        <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.95rem' }}>
          {t("There's nothing left for AI to rewrite — the remaining points come from real experience you build over time (more senior roles, bigger measurable results), which can't be written in.")}
        </Typography>
      </Card>
    );
  }

  return (
    <>
      <Card elevation={0} sx={{ p: 4, borderRadius: '24px', border: `2px solid ${COLORS.primary}`, background: `linear-gradient(135deg, ${COLORS.primaryAlpha12} 0%, transparent 100%)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <WorkspacePremiumIcon sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary }}>
            {t('AI-Optimize My CV')}
          </Typography>
        </Box>
        <Typography sx={{ color: COLORS.textSecondary, mb: 2, fontSize: '0.95rem' }}>
          {t('Let AI rewrite your CV to fix every issue, with a full breakdown of what changed and why — then download it instantly.')}
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={applyJake} onChange={(e) => setApplyJake(e.target.checked)} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary } }} />}
          label={
            <Typography sx={{ fontSize: '0.88rem', color: COLORS.textSecondary }}>
              {t('Also reformat into a 1-page ATS template (Jake’s Resume) — maximizes formatting points, but condenses layout')}
            </Typography>
          }
          sx={{ mb: 2, alignItems: 'flex-start' }}
        />
        <Button
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          onClick={() => openModal(applyJake)}
          sx={{ bgcolor: COLORS.primarySurface, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: COLORS.primarySurfaceDark } }}
        >
          {t('Optimize My CV')}
        </Button>
      </Card>

      <CVOptimizeModal
        open={modalOpen}
        onClose={closeModal}
        loading={loading}
        error={error}
        adjustedCV={adjustedCV}
        optimizedFormData={optimizedFormData}
        changes={changes}
        newScore={newScore}
        newBreakdown={newBreakdown}
        originalScore={originalScore}
        pageCount={pageCount}
      />
    </>
  );
};

export default AdjustCVPanel;
