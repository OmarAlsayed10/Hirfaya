import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PlanCard from '../../../components/ui/PlanCard';
import ContentBlock from '../../../components/ui/ContentBlock';
import pricingSection from './pricingSection.tokens';

function PricingSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isPro = user?.role === 'pro user';
  const navigate = useNavigate();

  return (
    <Box sx={pricingSection.root}>
      <Box sx={pricingSection.header}>
        <ContentBlock
          size="section"
          headline={t('Choose Your Plan')}
          text={t('Flexible options to match your CV needs')}
          textMaxWidth="800px"
        />
      </Box>

      <Grid container spacing={4} justifyContent="center" sx={pricingSection.grid}>
        <Grid sx={{ width: { xs: '100%', md: '41.66%', lg: '33.33%' } }}>
          <PlanCard
            variant="free"
            buttonLabel={t('Get Started Free')}
            onButtonClick={() => navigate('/getStart')}
            disabled={isPro}
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%', md: '50%', lg: '41.66%' } }}>
          <PlanCard
            variant="pro"
            buttonLabel={isPro ? t('already upgraded') : t('Upgrade to Pro')}
            onButtonClick={() => navigate('/payment-check')}
            disabled={isPro}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default PricingSection;
