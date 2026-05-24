import * as React from 'react';
import { Box, IconButton, Typography, MenuItem, Switch, Popover, Avatar } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../i18n';
import { useNavigate } from 'react-router-dom';
import { UserMenuProps } from './UserMenu.types';
import userMenu from './userMenu.tokens';

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleLanguage = () => i18n.changeLanguage(currentLang === 'en' ? 'ar' : 'en');

  return (
    <>
      <IconButton onClick={handleOpen} sx={userMenu.trigger}>
        <Avatar src={user?.photo || ''}>
          {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={userMenu.popover}
      >
        <Box sx={userMenu.menuBox}>
          <Box sx={userMenu.userHeader}>
            <Avatar src={user?.photo || ''} sx={userMenu.avatar}>
              {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={userMenu.userName}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography sx={userMenu.userEmail}>{user?.email}</Typography>
            </Box>
          </Box>

          <MenuItem>
            <Box sx={userMenu.langBox}>
              <Typography sx={userMenu.langLabel}>
                {currentLang === 'ar' ? 'ع' : 'En'}
              </Typography>
              <Switch
                checked={currentLang === 'ar'}
                onChange={() => { toggleLanguage(); handleClose(); }}
                color="primary"
              />
            </Box>
          </MenuItem>

          <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
            <SettingsIcon sx={{ mr: 1 }} />
            {t('Settings')}
          </MenuItem>

          <MenuItem onClick={() => { onLogout(); handleClose(); }}>
            <LogoutOutlinedIcon sx={{ mr: 1 }} />
            {t('Logout')}
          </MenuItem>
        </Box>
      </Popover>
    </>
  );
};

export default UserMenu;
