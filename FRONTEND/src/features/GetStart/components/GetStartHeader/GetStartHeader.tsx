import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import getStartHeader from './getStartHeader.tokens';

export const GetStartHeader = () => {
  const { t } = useTranslation();

  return (
    <Box sx={getStartHeader.root}>
      <Typography variant="h1" sx={getStartHeader.title}>
        {t("Let's Create Your Perfect CV!")}
      </Typography>
      <Typography variant="body1" sx={getStartHeader.subtitle}>
        {t('getstarted.subtitle', 'Choose an option below to start your journey towards a professional resume.')}
      </Typography>
    </Box>
  );
};
