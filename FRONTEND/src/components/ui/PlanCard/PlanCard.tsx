import { Box, Typography, Button, Paper } from '@mui/material';
import { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { BILLING_CYCLES, BillingCycle, PLAN_TIERS } from '../../../constants/pricingData';
import { PlanCardProps } from './PlanCard.types';
import planCard from './planCard.tokens';

const PlanCard = ({
  variant,
  buttonLabel,
  onButtonClick,
  disabled = false,
}: PlanCardProps) => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly');
  const tier = PLAN_TIERS[variant];

  if (!tier.prices) {
    return (
      <Paper elevation={0} sx={planCard.paperFree}>
        <Typography sx={planCard.planTitle}>{t(tier.title)}</Typography>
        <Typography sx={planCard.priceFree}>{tier.freePrice}</Typography>
        <Typography sx={planCard.validText}>{t(tier.freeValidText!)}</Typography>

        <Box sx={planCard.featuresList}>
          {tier.features.map((feature) => (
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

  const priceInfo = tier.prices![billingCycle];

  return (
    <Paper elevation={0} sx={planCard.paperPro}>
      {tier.badge && <Box sx={planCard.popularBadge}>{t(tier.badge)}</Box>}

      <Typography sx={planCard.planTitle}>{t(tier.title)}</Typography>

      <Box sx={planCard.priceRow}>
        <Typography sx={planCard.pricePro}>{priceInfo.monthly}</Typography>
        <Typography sx={planCard.priceUnit}>/{t('mo')}</Typography>
      </Box>
      <Typography sx={planCard.pricePeriod}>{t(priceInfo.total)}</Typography>

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
        {tier.features.map((feature) => (
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
