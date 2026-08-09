import { useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import UserMenu from '../UserMenu';
import LanguageToggle from '../../../LanguageToggle';
import ThemeToggle from '../../../ThemeToggle';
import { DesktopNavProps } from './DesktopNav.types';
import desktopNav from './desktopNav.tokens';
import { isActivePath } from '../../isActivePath';
import { useFeedback } from '../../../../../context/FeedbackContext';
import { hasPaidAccess } from '../../../../../utils/proAccess';

const DesktopNav = ({ pages, productPages, isAuthenticated, user, onLogout }: DesktopNavProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showEntitlement } = useFeedback();
  const [productsAnchor, setProductsAnchor] = useState<null | HTMLElement>(null);

  const isAdmin = user?.role === 'admin';
  const isActivePro = hasPaidAccess(user);
  const productsActive = productPages.some((page) => isActivePath(pathname, page.href));

  const openPage = (page: { href: string; requiresPaid?: boolean }) => {
    if (page.requiresPaid && !isActivePro) {
      showEntitlement('PRO_REQUIRED');
      return;
    }
    navigate(page.href);
  };

  return (
    <Box sx={desktopNav.root}>
      {pages.slice(0, 1).map((page) => (
        <Button
          key={page.label}
          onClick={() => openPage(page)}
          aria-current={isActivePath(pathname, page.href) ? 'page' : undefined}
          sx={desktopNav.navLink(isActivePath(pathname, page.href))}
        >
          {page.label}
        </Button>
      ))}

      <Button
        onClick={(e) => setProductsAnchor(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        aria-haspopup="menu"
        aria-expanded={Boolean(productsAnchor)}
        aria-current={productsActive ? 'page' : undefined}
        sx={desktopNav.navLink(productsActive)}
      >
        {t('Products')}
      </Button>

      <Menu
        anchorEl={productsAnchor}
        open={Boolean(productsAnchor)}
        onClose={() => setProductsAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: desktopNav.productsPaper } }}
      >
        {productPages.map((page) => (
          <MenuItem
            key={page.label}
            onClick={() => {
              setProductsAnchor(null);
              openPage(page);
            }}
            selected={isActivePath(pathname, page.href)}
            sx={desktopNav.productsItem(isActivePath(pathname, page.href))}
          >
            {page.label}
          </MenuItem>
        ))}
      </Menu>

      {pages.slice(1).map((page) => (
        <Button
          key={page.label}
          onClick={() => openPage(page)}
          aria-current={isActivePath(pathname, page.href) ? 'page' : undefined}
          sx={desktopNav.navLink(isActivePath(pathname, page.href))}
        >
          {page.label}
        </Button>
      ))}

      {!isAuthenticated && (
        <Button variant="contained" onClick={() => navigate('/login')} sx={desktopNav.ctaBtn}>
          {t('LogIn')}
        </Button>
      )}

      {isAdmin && (
        <Button variant="contained" onClick={() => navigate('/admin')} sx={desktopNav.ctaBtn}>
          {t('Admin')}
        </Button>
      )}

      {!isAdmin && isActivePro && (
        <Button
          variant="contained"
          onClick={() => navigate('/settings?tab=plan')}
          sx={desktopNav.ctaBtn}
        >
          {t('Pro')}
        </Button>
      )}

      {isAuthenticated && !isAdmin && !isActivePro && (
        <Button
          variant="outlined"
          onClick={() => navigate('/payment-check')}
          sx={desktopNav.getProBtn}
        >
          {t('Go Pro')}
        </Button>
      )}

      <ThemeToggle />

      <LanguageToggle />

      {isAuthenticated && <UserMenu user={user} onLogout={onLogout} />}
    </Box>
  );
};

export default DesktopNav;
