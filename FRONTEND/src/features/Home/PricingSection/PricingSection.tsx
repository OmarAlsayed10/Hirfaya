import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PlanCard from '../../../components/ui/PlanCard';
import ContentBlock from '../../../components/ui/ContentBlock';
import pricingSection from './pricingSection.tokens';

function PricingSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const tier = isAdmin ? 'ultra' : user?.planTier ?? 'basic';
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 4,
          alignItems: 'stretch',
          maxWidth: 1200,
          mx: 'auto',
          ...pricingSection.grid,
        }}
      >
        <PlanCard
          variant="basic"
          buttonLabel={t('Get Started Free')}
          onButtonClick={() => navigate('/getStart')}
          disabled={tier !== 'basic'}
        />
        <PlanCard
          variant="pass"
          buttonLabel={t('Buy 7-Day Pass')}
          onButtonClick={() => navigate('/payment-check')}
          disabled={tier !== 'basic'}
        />
        <PlanCard
          variant="pro"
          buttonLabel={
            tier === 'pro'
              ? t('Current Plan')
              : tier === 'ultra'
              ? t('Included')
              : t('Upgrade to Pro')
          }
          onButtonClick={() => navigate('/payment-check')}
          disabled={tier === 'pro' || tier === 'ultra'}
        />
        <PlanCard
          variant="ultra"
          buttonLabel={tier === 'ultra' ? t('Current Plan') : t('Go Ultra')}
          onButtonClick={() => navigate('/payment-check')}
          disabled={tier === 'ultra'}
        />
      </Box>
    </Box>
  );
}

export default PricingSection;
