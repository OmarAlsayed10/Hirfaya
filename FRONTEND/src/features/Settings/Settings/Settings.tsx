import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import ProfileTab from '../components/ProfileTab';
import PlanTab from '../components/PlanTab';
import CvsTab from '../components/CvsTab';
import settings from './settings.tokens';
import type { SettingsTab, NavItem } from './Settings.types';

const NAV: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: <PersonIcon fontSize="small" /> },
  { id: 'cv', label: 'My CVs', icon: <DescriptionIcon fontSize="small" /> },
  { id: 'plan', label: 'Plan', icon: <StarIcon fontSize="small" /> },
];

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const query = new URLSearchParams(window.location.search);
  const defaultTab = (query.get('tab') as SettingsTab) || 'profile';
  const [tab, setTab] = useState<SettingsTab>(defaultTab);

  const filteredNav = NAV.filter((item) => {
    if (item.id === 'plan' && user?.role !== 'pro user') return false;
    return true;
  });

  return (
    <Box sx={settings.root}>
      <Paper sx={settings.paper}>
        <Box sx={settings.sidebar}>
          {filteredNav.map(({ id, label, icon, danger }) => (
            <Box
              key={id}
              onClick={() => setTab(id)}
              sx={settings.navItem(tab === id, !!danger)}
            >
              {icon}
              <Typography fontSize={13}>{t(label)}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={settings.content}>
          {tab === 'profile' && <ProfileTab />}
          {tab === 'cv' && <CvsTab />}
          {tab === 'plan' && <PlanTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
