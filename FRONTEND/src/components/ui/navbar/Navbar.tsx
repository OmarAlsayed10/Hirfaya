import * as React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import i18n from '../../../i18n';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { AUTH_ENDPOINTS } from '../../../constants/endpoints';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './components/MobileMenu';
import DesktopNav from './components/DesktopNav';
import navbar from './navbar.tokens';

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserFromPayment } = useAuth();
  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';
  const paymentState = useSelector((state: { payment: { success: boolean; user: unknown } }) => state.payment);

  useEffect(() => {
    if (paymentState.success && paymentState.user) {
      updateUserFromPayment(paymentState.user, Cookies.get('token') || '');
    }
  }, [paymentState.success, paymentState.user, updateUserFromPayment]);

  const handleLogout = async () => {
    try {
      await axios.post(AUTH_ENDPOINTS.logout, {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const pages = [
    { label: t('Home'), href: '/' },
    { label: t('Blogs'), href: '/Blogs' },
    { label: t('Pricing'), href: '/pricing' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ ...navbar.appBar, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters>
          <Typography variant="h6" noWrap onClick={() => navigate('/')} sx={navbar.logoDesktop}>
            <DescriptionIcon sx={navbar.brandIcon} />
            Resume-IQ
          </Typography>

          <Box sx={navbar.mobileMenuBox}>
            <IconButton size="large" onClick={handleOpenNavMenu} sx={navbar.menuIcon}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" noWrap onClick={() => navigate('/')} sx={navbar.logoMobile}>
              <DescriptionIcon sx={navbar.brandIconSmall} />
              Resume-IQ
            </Typography>
          </Box>

          <MobileMenu
            anchorEl={anchorElNav}
            onClose={handleCloseNavMenu}
            pages={pages}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />

          <DesktopNav
            pages={pages}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
