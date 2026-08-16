import * as React from 'react';
import { Box, IconButton, Typography, Popover, Avatar, Chip, Divider, ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material';
import { User, FileText, Files, LogOut } from "../../../../icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AVATAR_COLORS } from '../../../../../theme/tokens';
import { UserMenuProps } from './UserMenu.types';
import { displayName } from '../../../../../utils/displayName';
import userMenu from './userMenu.tokens';

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const u = user as (typeof user & { avatarColor?: string; planTier?: string }) | null;
  const color = u?.avatarColor || AVATAR_COLORS[0];
  const initial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const isAdmin = user?.role === 'admin';
  const planLabel = isAdmin ? 'ADMIN' : (u?.planTier || 'basic').toUpperCase();

  const close = () => setAnchorEl(null);
  const go = (path: string) => { close(); navigate(path); };

  const LINKS = [
    { label: 'Profile', icon: <User size={17} />, to: '/settings' },
    { label: 'My CVs', icon: <FileText size={17} />, to: '/settings?tab=cv' },
    { label: 'Documents', icon: <Files size={17} />, to: '/settings?tab=documents' },
  ];

  return (
    <>
      <IconButton aria-label="Open user menu" onClick={(e) => setAnchorEl(e.currentTarget)} sx={userMenu.trigger}>
        <Avatar src={user?.photo || ''} sx={{ ...userMenu.triggerAvatar, bgcolor: color }}>
          {initial}
        </Avatar>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: userMenu.paper } }}
      >
        <Box sx={userMenu.header}>
          <Avatar src={user?.photo || ''} sx={{ ...userMenu.avatar, bgcolor: color }}>
            {initial}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={userMenu.userName} noWrap>
                {displayName(user?.firstName, user?.lastName)}
              </Typography>
              <Chip label={planLabel} size="small" color="primary" sx={userMenu.planChip} />
            </Box>
            <Typography sx={userMenu.userEmail} noWrap>{user?.email}</Typography>
          </Box>
        </Box>

        <MenuList sx={{ py: 0.5 }}>
          {LINKS.map((l) => (
            <MenuItem key={l.to} onClick={() => go(l.to)}>
              <ListItemIcon sx={userMenu.itemIcon}>{l.icon}</ListItemIcon>
              <ListItemText primary={t(l.label)} slotProps={{ primary: { sx: userMenu.itemLabel } }} />
            </MenuItem>
          ))}
        </MenuList>

        <Divider />

        <MenuList sx={{ py: 0.5 }}>
          <MenuItem onClick={() => { onLogout(); close(); }}>
            <ListItemIcon sx={userMenu.logoutIcon}><LogOut size={17} /></ListItemIcon>
            <ListItemText primary={t('Logout')} slotProps={{ primary: { sx: userMenu.logoutLabel } }} />
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};

export default UserMenu;
