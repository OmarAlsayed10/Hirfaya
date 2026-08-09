import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import languageToggle from './languageToggle.tokens';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const current = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={current}
      onChange={(_, next) => next && i18n.changeLanguage(next)}
      aria-label="Language"
      sx={languageToggle.group}
    >
      <ToggleButton value="en" aria-label="English">EN</ToggleButton>
      <ToggleButton value="ar" aria-label="العربية">ع</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageToggle;
