import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../../hooks/useThemeMode';
import IconAction from '../IconAction';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <IconAction
      label={isDark ? t('Switch to light mode') : t('Switch to dark mode')}
      onClick={toggleMode}
    >
      {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
    </IconAction>
  );
};

export default ThemeToggle;
