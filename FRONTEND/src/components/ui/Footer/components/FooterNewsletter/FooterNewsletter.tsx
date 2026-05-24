import { Typography, Box, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import footerNewsletter from './footerNewsletter.tokens';

const FooterNewsletter = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="overline" sx={footerNewsletter.title}>
        {t('Stay Updated')}
      </Typography>
      <Typography sx={footerNewsletter.subtitle}>
        {t('Get CV tips and product updates in your inbox.')}
      </Typography>
      <Box sx={footerNewsletter.form}>
        <TextField
          size="small"
          placeholder={t('Your email')}
          fullWidth
          sx={footerNewsletter.emailField}
        />
        <Button variant="contained" fullWidth sx={footerNewsletter.subscribeBtn}>
          {t('Subscribe')}
        </Button>
      </Box>
    </>
  );
};

export default FooterNewsletter;
