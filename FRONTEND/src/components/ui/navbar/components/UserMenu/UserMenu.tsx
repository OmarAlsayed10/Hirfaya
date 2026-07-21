import * as React from 'react';
import { Box, IconButton, Typography, Switch, Popover, Avatar, Chip, Divider } from '@mui/material';
import { User, FileText, Files, Briefcase, Settings, LogOut, Globe } from "../../../../icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../i18n';
import { useNavigate } from 'react-router-dom';
import { AVATAR_COLORS } from '../../../../../theme/tokens';
import { UserMenuProps } from './UserMenu.types';
import { displayName } from '../../../../../utils/displayName';
import userMenu from './userMenu.tokens';

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;

  const u = user as (typeof user & { avatarColor?: string; planTier?: string }) | null;
  const color = u?.avatarColor || AVATAR_COLORS[0];
  const initial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const isAdmin = user?.role === 'admin';
  const isPro = user?.role === 'pro user';
  const planLabel = isAdmin
    ? 'ADMIN'
    : (u?.planTier || (isPro ? 'pro' : 'basic')).toUpperCase();

  const close = () => setAnchorEl(null);
  const go = (path: string) => { close(); navigate(path); };
  const toggleLanguage = () => i18n.changeLanguage(currentLang === 'en' ? 'ar' : 'en');

  const LINKS = [
    { label: 'Profile', icon: <User size={17} />, to: '/settings' },
    { label: 'My CVs', icon: <FileText size={17} />, to: '/settings?tab=cv' },
    { label: 'Documents', icon: <Files size={17} />, to: '/settings?tab=documents' },
    { label: 'Career Match', icon: <Briefcase size={17} />, to: '/career-match' },
    { label: 'Job Radar', icon: <Briefcase size={17} />, to: '/job-radar' },
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

        <Box sx={{ py: 0.5 }}>
          {LINKS.map((l) => (
            <Box key={l.to} onClick={() => go(l.to)} sx={userMenu.item}>
              {l.icon}
              <Typography sx={userMenu.itemLabel}>{t(l.label)}</Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        <Box sx={userMenu.langRow}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Globe size={17} />
            <Typography sx={userMenu.itemLabel}>{currentLang === 'ar' ? 'العربية' : 'English'}</Typography>
          </Box>
          <Switch inputProps={{ "aria-label": "Switch language" }} size="small" checked={currentLang === 'ar'} onChange={toggleLanguage} color="primary" />
        </Box>

        <Divider />

        <Box sx={{ py: 0.5 }}>
          <Box onClick={() => { onLogout(); close(); }} sx={{ ...userMenu.item, color: 'error.main' }}>
            <LogOut size={17} />
            <Typography sx={userMenu.itemLabel}>{t('Logout')}</Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default UserMenu;
