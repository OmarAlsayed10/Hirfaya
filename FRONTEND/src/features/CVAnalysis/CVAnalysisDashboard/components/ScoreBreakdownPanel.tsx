import { Box, Card, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';
import type { ScoreCategory } from '../CVAnalysisDashboard.types';

interface ScoreBreakdownPanelProps {
  categories: ScoreCategory[];
}

function categoryColor(earned: number, max: number): string {
  const pct = earned / max;
  if (pct === 1) return COLORS.primary;
  if (pct >= 0.6) return '#c25b1a';
  return '#b71c1c';
}

const ScoreBreakdownPanel = ({ categories }: ScoreBreakdownPanelProps) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={0}
      sx={{ p: 4, mb: 4, borderRadius: '24px', border: `1px solid ${COLORS.borderLight}` }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 'bold', mb: 3, fontFamily: TYPOGRAPHY.fontSerif }}
      >
        {t('Score Breakdown')}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 2.5, md: '20px 48px' },
        }}
      >
        {categories.map((cat) => {
          const color = categoryColor(cat.earned, cat.max);
          const pct = (cat.earned / cat.max) * 100;
          const perfect = cat.earned === cat.max;

          return (
            <Box key={cat.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {perfect ? (
                    <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                  ) : (
                    <ErrorOutlineIcon sx={{ fontSize: 16, color }} />
                  )}
                  <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: COLORS.textPrimary }}>
                    {t(cat.name)}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color, fontVariantNumeric: 'tabular-nums' }}>
                  {cat.earned}/{cat.max}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                }}
              />

              {cat.tip && (
                <Typography
                  sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, mt: 0.5, lineHeight: 1.4 }}
                >
                  {cat.tip}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

export default ScoreBreakdownPanel;
