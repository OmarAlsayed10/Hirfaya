import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { CircularProgress, Typography, Box } from '@mui/material';
import googleAuthSuccess from './googleAuthSuccess.tokens';

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (token && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          await login(user, token);
          navigate('/', { replace: true });
        } else {
          throw new Error('Invalid authentication data');
        }
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
        Processing authentication...
      </Typography>
    </Box>
  );
};

export default GoogleAuthSuccess;
