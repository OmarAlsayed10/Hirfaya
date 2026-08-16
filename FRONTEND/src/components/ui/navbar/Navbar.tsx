import * as React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Container, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import i18n from '../../../i18n';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { AUTH_ENDPOINTS } from '../../../constants/endpoints';
import { resetStore } from '../../../redux/store/store';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './components/MobileMenu';
import DesktopNav from './components/DesktopNav';
import navbar from './navbar.tokens';

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(AUTH_ENDPOINTS.logout, {}, { withCredentials: true });
      dispatch(resetStore());
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const productPages = [
    { label: t('CV Builder'), href: '/getStart' },
    { label: t('Career Match'), href: '/career-match' },
    { label: t('Roadmap'), href: '/roadmap' },
  ];

  const pages = [
    { label: t('Home'), href: '/' },
    { label: t('Job Radar'), href: '/job-radar' },
    { label: t('Blogs'), href: '/Blogs' },
    { label: t('Pricing'), href: '/pricing' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ ...navbar.appBar, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters>
          <Typography variant="h6" noWrap onClick={() => navigate('/')} sx={navbar.logoDesktop}>
            <DescriptionIcon sx={navbar.brandIcon} />
            Hirfaya
          </Typography>

          {!isDesktop && (
            <>
              <Box sx={navbar.mobileMenuBox}>
                <IconButton size="large" onClick={handleOpenNavMenu} sx={navbar.menuIcon}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h5" noWrap onClick={() => navigate('/')} sx={navbar.logoMobile}>
                  <DescriptionIcon sx={navbar.brandIconSmall} />
                  Hirfaya
                </Typography>
              </Box>

              <MobileMenu
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                productPages={productPages}
                pages={pages}
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={handleLogout}
              />
            </>
          )}

          {isDesktop && (
            <DesktopNav
              pages={pages}
              productPages={productPages}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
