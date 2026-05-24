import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import planSummaryCards from './planSummaryCards.tokens';

const PLAN_FEATURES: string[] = [
  '150 resumes and cover letters',
  'All resume templates',
  'Real-time content suggestions',
  'ATS check (Applicant Tracking System)',
  'Pro resume sections',
  'No branding',
  'Unlimited section items',
  'Thousands of design options',
];

export const PlanSummaryCards = () => {
  const { t } = useTranslation();

  return (
    <Box sx={planSummaryCards.root}>
      <Typography variant="h5" gutterBottom sx={planSummaryCards.title}>
        {t('Pro Plan')}
      </Typography>
      <Typography variant="body1" sx={planSummaryCards.subtitle}>
        {t('Feature packed resume builder for serious job seekers')}
      </Typography>

      <Box sx={planSummaryCards.featureList}>
        {PLAN_FEATURES.map((feature, index) => (
          <Box key={index} sx={planSummaryCards.featureItem}>
            <CheckCircleIcon sx={planSummaryCards.featureIcon} />
            <Typography>{t(feature)}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
