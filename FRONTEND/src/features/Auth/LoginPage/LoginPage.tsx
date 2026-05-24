import { Box, Button, Typography, Container, Link, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link as RouterLink } from 'react-router-dom';
import { AUTH_ENDPOINTS } from '../../../constants/endpoints';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import loginPage from './loginPage.tokens';

const LoginPage = () => {
  const { t } = useTranslation();
  const currentLang = i18n.language;

  const handleGoogleLogin = () => {
    window.location.href = AUTH_ENDPOINTS.google;
  };

  return (
    <Container maxWidth={false} sx={loginPage.root}>
      <Box sx={loginPage.homeLink}>
        <Link component={RouterLink} to="/" sx={loginPage.homeLinkColor}>
          <HomeIcon sx={{ fontSize: 32 }} />
        </Link>
      </Box>

      <Paper elevation={0} sx={loginPage.paper}>
        <Typography variant="h4" sx={loginPage.title}>
          {t('Login to Your Account')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleGoogleLogin}
          startIcon={currentLang === 'en' ? <GoogleIcon /> : <></>}
          endIcon={currentLang === 'ar' ? <GoogleIcon sx={{ mx: 1 }} /> : <></>}
          sx={loginPage.button}
        >
          {t('Login with Google')}
        </Button>

        <Typography sx={loginPage.helperText}>
          {t("Don't have an account?")}{' '}
          <Link component={RouterLink} to="/register" sx={loginPage.link}>
            {t('Register')}
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
