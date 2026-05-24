import { Box, Button, Typography, Container, Link, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link as RouterLink } from 'react-router-dom';
import { AUTH_ENDPOINTS } from '../../../constants/endpoints';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import registerPage from './registerPage.tokens';

const RegisterPage = () => {
  const { t } = useTranslation();
  const currentLang = i18n.language;

  const handleGoogleRegister = () => {
    window.location.href = AUTH_ENDPOINTS.google;
  };

  return (
    <Container maxWidth={false} sx={registerPage.root}>
      <Box sx={registerPage.homeLink}>
        <Link component={RouterLink} to="/" sx={registerPage.homeLinkColor}>
          <HomeIcon sx={{ fontSize: 32 }} />
        </Link>
      </Box>

      <Paper elevation={0} sx={registerPage.paper}>
        <Typography variant="h4" sx={registerPage.title}>
          {t('Register New Account')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleGoogleRegister}
          startIcon={currentLang === 'en' ? <GoogleIcon /> : <></>}
          endIcon={currentLang === 'ar' ? <GoogleIcon sx={{ mx: 1 }} /> : <></>}
          sx={registerPage.button}
        >
          {t('Register with Google')}
        </Button>

        <Typography sx={registerPage.helperText}>
          {t('Already a member?')}{' '}
          <Link component={RouterLink} to="/login" sx={registerPage.link}>
            {t('Login')}
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
