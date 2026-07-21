import { Box, Button, Typography, Fade, Grow } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { useNavigate } from 'react-router-dom';
import HeroCVMockup from '../HeroCVMockup';
import heroSection from './heroSection.tokens';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const isRTL = currentLang !== 'en';

  return (
    <Box sx={heroSection.root}>
      <Box sx={heroSection.container}>
        <Grow in timeout={1000}>
          <Box sx={heroSection.headlineBlock}>
            <Typography sx={heroSection.eyebrow}>
              {t('Careerak-CV BUILDER')}
            </Typography>

            <Typography variant="h1" sx={heroSection.h1}>
              {t('Craft the')}{' '}
              <Box component="i" sx={heroSection.accent}>{t('Perfect CV')}</Box>{' '}
              {t('with AI')}
            </Typography>

            <Typography variant="body1" sx={heroSection.subtitle}>
              {t('home1.subtitle')}
            </Typography>

            <Box sx={heroSection.buttonRow}>
              <Button
                variant="contained"
                onClick={() => navigate('/getStart')}
                endIcon={isRTL ? <ArrowBackIcon sx={{ px: 2 }} /> : <ArrowForwardIcon />}
                sx={heroSection.primaryButton}
              >
                {t('Get Started')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/getStart')}
                sx={heroSection.outlinedButton}
              >
                {t('Upload Your CV')}
              </Button>
            </Box>
          </Box>
        </Grow>

        <Fade in timeout={1200}>
          <Box sx={heroSection.mockupWrapper}>
            <HeroCVMockup />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default HeroSection;
