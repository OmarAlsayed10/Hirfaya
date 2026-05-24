import { Box, Typography, Button, Paper } from '@mui/material';
import { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import {
  BILLING_CYCLES,
  BillingCycle,
  PRO_PRICE_MAP,
  FREE_PLAN_FEATURES,
  PRO_PLAN_FEATURES,
} from '../../../constants/pricingData';
import { PlanCardProps } from './PlanCard.types';
import planCard from './planCard.tokens';

const PlanCard = ({
  variant,
  buttonLabel,
  onButtonClick,
  disabled = false,
}: PlanCardProps) => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Quarterly');
  const proPriceInfo = PRO_PRICE_MAP[billingCycle];

  if (variant === 'free') {
    return (
      <Paper elevation={0} sx={planCard.paperFree}>
        <Typography sx={planCard.planTitle}>{t('Free Plan')}</Typography>
        <Typography sx={planCard.priceFree}>$0</Typography>
        <Typography sx={planCard.validText}>{t('Valid for 7 days')}</Typography>

        <Box sx={planCard.featuresList}>
          {FREE_PLAN_FEATURES.map((feature) => (
            <Box key={feature} sx={planCard.featureRow}>
              <CheckCircleIcon sx={planCard.featureIconFree} />
              <Typography sx={planCard.featureTextFree}>{t(feature)}</Typography>
            </Box>
          ))}
        </Box>

        <Button
          variant="outlined"
          fullWidth
          disabled={disabled}
          onClick={onButtonClick}
          sx={planCard.btnFree}
        >
          {buttonLabel}
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={planCard.paperPro}>
      <Box sx={planCard.popularBadge}>{t('POPULAR')}</Box>

      <Typography sx={planCard.planTitle}>{t('Pro Plan')}</Typography>

      <Box sx={planCard.priceRow}>
        <Typography sx={planCard.pricePro}>{proPriceInfo.monthly}</Typography>
        <Typography sx={planCard.priceUnit}>/{t('mo')}</Typography>
      </Box>
      <Typography sx={planCard.pricePeriod}>{t(proPriceInfo.total)}</Typography>

      <Box sx={planCard.billingToggle}>
        {BILLING_CYCLES.map((cycle) => (
          <Box
            key={cycle}
            onClick={() => setBillingCycle(cycle)}
            sx={billingCycle === cycle ? planCard.cycleActive : planCard.cycleInactive}
          >
            {t(cycle)}
          </Box>
        ))}
      </Box>

      <Box sx={planCard.featuresList}>
        {PRO_PLAN_FEATURES.map((feature) => (
          <Box key={feature} sx={planCard.featureRow}>
            <CheckCircleIcon sx={planCard.featureIconPro} />
            <Typography sx={planCard.featureTextPro}>{t(feature)}</Typography>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        fullWidth
        disabled={disabled}
        onClick={onButtonClick}
        sx={planCard.btnPro}
      >
        {buttonLabel}
      </Button>
    </Paper>
  );
};

export default PlanCard;
