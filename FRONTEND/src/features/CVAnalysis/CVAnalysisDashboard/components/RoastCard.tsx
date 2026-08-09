import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Target } from '../../../../components/icons/MuiIcons';
import { COLORS } from '../../../../theme/tokens';
import type { SectionImprovement } from '../CVAnalysisDashboard.types';

interface RoastCardProps {
  score: number;
  sectionsToImprove: SectionImprovement[];
}

const roastKey = (score: number): string => {
  if (score < 50) return 'roast.low';
  if (score < 75) return 'roast.low';
  return 'roast.low';
};

export default function RoastCard({ score, sectionsToImprove }: RoastCardProps) {
  const { t, i18n } = useTranslation();

  if (!i18n.language.startsWith('ar')) return null;

  const focusAreas = sectionsToImprove.slice(0, 3).map((item) => item.section);

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        mb: 4,
        borderRadius: '20px',
        border: `1px solid ${COLORS.primaryAlpha20}`,
        bgcolor: COLORS.surfaceSubtle,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '12px',
          bgcolor: COLORS.primaryAlpha12,
          color: COLORS.primary,
          flexShrink: 0,
        }}
      >
        <Target size={22} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.05rem', md: '1.2rem' },
            color: COLORS.textPrimary,
            lineHeight: 1.4,
          }}
        >
          {t(roastKey(score))}
        </Typography>

        {focusAreas.length > 0 && (
          <>
            <Typography sx={{ mt: 1, mb: 1.5, color: COLORS.textSecondary, fontSize: '0.9rem' }}>
              {t('roast.focus')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {focusAreas.map((area) => (
                <Chip
                  key={area}
                  label={area}
                  size="small"
                  sx={{
                    bgcolor: COLORS.primaryAlpha12,
                    color: COLORS.primary,
                    fontWeight: 700,
                    direction: 'ltr',
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
