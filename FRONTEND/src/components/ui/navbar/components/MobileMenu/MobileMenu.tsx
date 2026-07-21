import { Box, Menu, MenuItem, Typography, Button, Switch, Avatar } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../i18n';
import { useNavigate } from 'react-router-dom';
import { MobileMenuProps } from './MobileMenu.types';
import mobileMenu from './mobileMenu.tokens';
import { useFeedback } from '../../../../../context/FeedbackContext';
import { hasPaidAccess } from '../../../../../utils/proAccess';

const MobileMenu = ({ anchorEl, onClose, pages, isAuthenticated, user, onLogout }: MobileMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';
  const { showEntitlement } = useFeedback();

  const isAdmin = user?.role === 'admin';
  const isActivePro = hasPaidAccess(user);

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === 'en' ? 'ar' : 'en');
  };

  return (
    <Menu
      id="mobile-menu"
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorEl)}
      onClose={onClose}
      sx={mobileMenu.menu}
    >
      {isAuthenticated && (
        <MenuItem>
          <Avatar src={user?.photo || ''} sx={{ bgcolor: 'primary.main', marginInlineEnd: 1 }}>
            {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </Avatar>
          {user?.firstName || user?.email?.split('@')[0]}
        </MenuItem>
      )}

      {pages.map((page) => (
        <MenuItem
          key={page.label}
          onClick={() => {
            onClose();
            if (page.requiresPaid && !isActivePro) {
              showEntitlement('PRO_REQUIRED');
              return;
            }
            navigate(page.href);
          }}>
          <Typography textAlign="center">{page.label}</Typography>
        </MenuItem>
      ))}

      <MenuItem>
        <Box sx={mobileMenu.langBox}>
          <Typography sx={mobileMenu.langLabel}>{isRTL ? 'ع' : 'En'}</Typography>
          <Switch checked={currentLang === 'ar'} onChange={toggleLanguage} color="primary" />
        </Box>
      </MenuItem>

      {!isAuthenticated && (
        <MenuItem onClick={() => { onClose(); navigate('/login'); }}>
          <Button fullWidth variant="contained">
            {t('LogIn')}
          </Button>
        </MenuItem>
      )}

      {isAdmin && (
        <MenuItem onClick={() => { onClose(); navigate('/admin'); }}>
          <Button fullWidth variant="contained">
            {t('Admin')}
          </Button>
        </MenuItem>
      )}

      {!isAdmin && isActivePro && (
        <MenuItem onClick={() => { onClose(); navigate('/settings?tab=plan'); }}>
          <Button fullWidth variant="contained">
            {t('Pro')}
          </Button>
        </MenuItem>
      )}

      {isAuthenticated && !isAdmin && !isActivePro && (
        <MenuItem onClick={() => { onClose(); navigate('/payment-check'); }}>
          <Button fullWidth variant="outlined">
            {t('Go Pro')}
          </Button>
        </MenuItem>
      )}

      {isAuthenticated && (
        <MenuItem onClick={() => { onClose(); onLogout(); }}>
          <LogoutOutlinedIcon sx={{ mr: 1 }} />
          {t('Logout')}
        </MenuItem>
      )}
    </Menu>
  );
};

export default MobileMenu;
