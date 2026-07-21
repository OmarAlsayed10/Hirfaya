import { Box, Card, Chip, CircularProgress, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import { roundScore } from '../../../../utils/scoreDisplay';
import cvAnalysisDashboard from '../cvAnalysisDashboard.tokens';

interface ScoreCardProps {
  score: number;
  matchJobTitle?: string;
}

function getScoreStyle(score: number): { color: string; label: string } {
  if (score === 100) return { color: COLORS.primary, label: 'Perfect' };
  if (score >= 75) return { color: COLORS.primary, label: 'Excellent' };
  if (score >= 50) return { color: '#c25b1a', label: 'Average' };
  return { color: '#e65100', label: 'Needs Work' };
}

const ScoreCard = ({ score, matchJobTitle }: ScoreCardProps) => {
  const { t } = useTranslation();
  const isPerfect = score === 100;
  const { color, label } = getScoreStyle(score);

  return (
    <Card elevation={0} sx={cvAnalysisDashboard.scoreCard}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={100} size={150} thickness={4} sx={{ color: 'rgba(0,0,0,0.05)' }} />
        <CircularProgress variant="determinate" value={score} size={150} thickness={4} sx={{ color, position: 'absolute', left: 0 }} />
        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPerfect ? (
            <EmojiEventsIcon sx={{ fontSize: 56, color: COLORS.primary }} />
          ) : (
            <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>{roundScore(score)}</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        <Chip
          label={t(label)}
          sx={{ bgcolor: `${color}22`, color, fontWeight: 'bold', px: 2, py: 2, fontSize: '1.1rem', borderRadius: '12px', mb: 2 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: COLORS.textPrimary }}>
          {isPerfect ? t('Your CV is Perfect!') : t('CV Quality Score')}
        </Typography>
        <Typography sx={{ color: COLORS.textSecondary, maxWidth: 500, fontSize: '1.05rem' }}>
          {isPerfect
            ? t("Congratulations! Your CV scores 100/100 and is fully optimized. You're ready to apply. Let's prepare you for the interview.")
            : t('This rates how well your CV is written and optimized — content, keywords, formatting, grammar and impact. It measures the document, not your skills. How well you match your chosen level is shown separately below. Aim for 75+.')}
        </Typography>
        {matchJobTitle && (
          <Chip
            label={matchJobTitle}
            variant="outlined"
            sx={{ mt: 2, borderColor: COLORS.primary, color: COLORS.primary, fontWeight: 600 }}
          />
        )}
      </Box>
    </Card>
  );
};

export default ScoreCard;
