import { useState } from 'react';
import {
  Box, Card, LinearProgress, Typography, Button, Dialog, DialogTitle, DialogContent, IconButton, Chip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';
import type { ScoreDimension } from '../CVAnalysisDashboard.types';

interface DimensionsPanelProps {
  dimensions: ScoreDimension[];
  detailsLocked: boolean;
}

function scoreColor(score: number): string {
  if (score >= 80) return COLORS.primary;
  if (score >= 50) return '#c25b1a';
  return '#b71c1c';
}

const DimensionsPanel = ({ dimensions, detailsLocked }: DimensionsPanelProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Card elevation={0} sx={{ p: 4, mb: 4, borderRadius: '24px', border: `1px solid ${COLORS.borderLight}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: TYPOGRAPHY.fontSerif }}>
          {t('Score Breakdown')}
        </Typography>
        {detailsLocked ? (
          <Button
            variant="contained" size="small" startIcon={<LockIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/pricing')}
            sx={{ bgcolor: COLORS.primary, borderRadius: '10px', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: COLORS.primaryDark } }}
          >
            {t('Unlock details with Pro')}
          </Button>
        ) : (
          <Button
            variant="outlined" size="small" startIcon={<TipsAndUpdatesOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => setOpen(true)}
            sx={{ color: COLORS.primary, borderColor: COLORS.primary, borderRadius: '10px', textTransform: 'none', fontWeight: 'bold', '&:hover': { borderColor: COLORS.primaryDark, bgcolor: COLORS.primaryAlpha12 } }}
          >
            {t('How to improve')}
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2.5, md: '20px 48px' } }}>
        {dimensions.map((dim) => {
          const color = scoreColor(dim.score);
          return (
            <Box key={dim.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: COLORS.textPrimary }}>{t(dim.name)}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color, fontVariantNumeric: 'tabular-nums' }}>{dim.score}</Typography>
              </Box>
              <LinearProgress
                variant="determinate" value={dim.score}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
              />
            </Box>
          );
        })}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '24px', maxHeight: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: `1px solid ${COLORS.borderLight}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TipsAndUpdatesOutlinedIcon sx={{ color: COLORS.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t('How to reach a higher score')}</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {[...dimensions].sort((a, b) => a.score - b.score).map((dim) => {
            const color = scoreColor(dim.score);
            const perfect = dim.score >= 100;
            return (
              <Box key={dim.name} sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${COLORS.borderLight}`, borderLeft: `4px solid ${color}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary }}>{t(dim.name)}</Typography>
                  <Chip label={dim.score} size="small" sx={{ bgcolor: color, color: 'white', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }} />
                </Box>
                <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {dim.details.map((d, i) => (
                    <Box component="li" key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      {perfect
                        ? <CheckCircleOutlineIcon sx={{ fontSize: 18, color: COLORS.primary, mt: 0.2, flexShrink: 0 }} />
                        : <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, mt: 0.9, flexShrink: 0 }} />}
                      <Typography sx={{ fontSize: '0.92rem', color: COLORS.textSecondary, lineHeight: 1.6 }}>{d}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DimensionsPanel;
