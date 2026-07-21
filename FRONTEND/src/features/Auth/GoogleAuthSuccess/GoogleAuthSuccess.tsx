import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { CircularProgress, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import googleAuthSuccess from './googleAuthSuccess.tokens';

const GoogleAuthSuccess = () => {
  const { fetchingAndFrefreshUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const user = await fetchingAndFrefreshUser();
        if (!user) throw new Error('Authentication refresh failed.');
        navigate(user.onboarded ? '/' : '/onboarding', { replace: true });
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/login', {
          replace: true,
          state: { error: 'Authentication failed. Please try again.' },
        });
      }
    };

    processAuth();
  }, []);

  return (
    <Box sx={googleAuthSuccess.root}>
      <CircularProgress />
      <Typography variant="h6" mt={2}>
        {t('Processing authentication...')}
      </Typography>
    </Box>
  );
};

export default GoogleAuthSuccess;
