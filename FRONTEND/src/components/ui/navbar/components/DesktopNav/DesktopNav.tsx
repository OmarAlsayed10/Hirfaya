import { Box, Typography, Button, MenuItem, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../i18n';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../UserMenu';
import { DesktopNavProps } from './DesktopNav.types';
import desktopNav from './desktopNav.tokens';

const DesktopNav = ({ pages, isAuthenticated, user, onLogout }: DesktopNavProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === 'en' ? 'ar' : 'en');
  };

  const isProExpired =
    user?.role === 'pro user' &&
    !!user?.proExpiresAt &&
    new Date(user.proExpiresAt) < new Date();
  const isActivePro = user?.role === 'pro user' && !isProExpired;

  return (
    <Box sx={desktopNav.root}>
      {pages.map((page) => (
        <Typography
          key={page.label}
          onClick={() => navigate(page.href)}
          sx={desktopNav.navLink}
        >
          {page.label}
        </Typography>
      ))}

      {!isAuthenticated && (
        <Button variant="contained" onClick={() => navigate('/login')} sx={desktopNav.ctaBtn}>
          {t('LogIn')}
        </Button>
      )}

      {!isAuthenticated && (
        <MenuItem>
          <Box sx={desktopNav.langBox}>
            <Typography sx={desktopNav.langLabel}>
              {currentLang === 'ar' ? 'ع' : 'En'}
            </Typography>
            <Switch checked={currentLang === 'ar'} onChange={toggleLanguage} color="primary" />
          </Box>
        </MenuItem>
      )}

      {isActivePro && (
        <Button
          variant="contained"
          onClick={() => navigate('/settings?tab=plan')}
          sx={desktopNav.ctaBtn}
        >
          {t('Pro')}
        </Button>
      )}

      {isAuthenticated && !isActivePro && (
        <Button
          variant="outlined"
          onClick={() => navigate('/payment-check')}
          sx={desktopNav.getProBtn}
        >
          {t('Go Pro')}
        </Button>
      )}

      {isAuthenticated && <UserMenu user={user} onLogout={onLogout} />}
    </Box>
  );
};

export default DesktopNav;
