import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import ProfileTab from '../components/ProfileTab';
import CreditsPlanTab from '../components/PlanTab/CreditsPlanTab';
import CvsTab from '../components/CvsTab';
import DocumentsTab from '../components/DocumentsTab';
import AvatarPicker from '../components/AvatarPicker';
import { GitCredentialsSection } from '../GitCredentialsSection';
import settings from './settings.tokens';
import type { SettingsTab, NavItem } from './Settings.types';
import { displayName } from '../../../utils/displayName';

const NAV: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: <PersonRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'cv', label: 'My CVs', icon: <DescriptionRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'documents', label: 'Documents', icon: <FolderCopyRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'connections', label: 'Connections', icon: <HubRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'plan', label: 'Credits & Plan', icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} /> },
];

const QUICK = [
  { label: 'Build', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />, to: '/create' },
  { label: 'Analyze CV', icon: <FactCheckRoundedIcon sx={{ fontSize: 16 }} />, to: '/cv-analysis' },
  { label: 'Career Match', icon: <WorkRoundedIcon sx={{ fontSize: 16 }} />, to: '/career-match' },
  { label: 'Job Radar', icon: <WorkRoundedIcon sx={{ fontSize: 16 }} />, to: '/job-radar' },
];

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const query = new URLSearchParams(window.location.search);
  const requestedTab = query.get('tab') as SettingsTab | null;
  const requestedHost = query.get('host') === 'GITLAB' ? 'GITLAB' : query.get('host') === 'GITHUB' ? 'GITHUB' : undefined;
  const defaultTab = user ? (requestedTab || 'profile') : 'plan';
  const [tab, setTab] = useState<SettingsTab>(defaultTab);

  const planLabel = (user as { planTier?: string } | null)?.planTier || 'free';
  const filteredNav = user ? NAV : NAV.filter((item) => item.id === 'plan');

  return (
    <Box sx={settings.root}>
      <Box sx={settings.container}>
        <Box sx={settings.hero}>
          {user && <AvatarPicker size={92} />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={settings.heroName}>
                {user ? displayName(user.firstName, user.lastName) : t('Guest')}
              </Typography>
              <Chip label={String(planLabel).toUpperCase()} size="small" color="primary" sx={{ fontWeight: 700 }} />
            </Box>
            <Typography sx={settings.heroEmail}>{user?.email || t('See your free analysis allowance below.')}</Typography>
            {user && (
              <Box sx={settings.quickActions}>
                {QUICK.map((q) => (
                  <Button
                    key={q.to}
                    variant="outlined"
                    size="small"
                    startIcon={q.icon}
                    onClick={() => navigate(q.to)}
                    sx={settings.quickBtn}
                  >
                    {t(q.label)}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={settings.shell}>
          <Box sx={settings.sidebar}>
            {filteredNav.map(({ id, label, icon, danger }) => (
              <Box key={id} onClick={() => setTab(id)} sx={settings.navItem(tab === id, !!danger)}>
                {icon}
                <Typography fontSize={14} fontWeight="inherit">{t(label)}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={settings.content}>
            {tab === 'profile' && <ProfileTab />}
            {tab === 'cv' && <CvsTab />}
            {tab === 'documents' && <DocumentsTab />}
            {tab === 'connections' && <GitCredentialsSection highlightHost={requestedHost} />}
            {tab === 'plan' && <CreditsPlanTab />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
