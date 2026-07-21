import { Box, Chip, Typography } from '@mui/material';
import { ArrowRight } from "../../../components/icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CV_TOOLS } from '../../../constants/homeData';
import ContentBlock from '../../../components/ui/ContentBlock';
import featuresSection from './featuresSection.tokens';

function FeaturesSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={featuresSection.root}>
      <Box sx={featuresSection.blob} />

      <Box sx={featuresSection.sectionHeader}>
        <Chip
          label={t('Everything you need')}
          size="small"
          sx={featuresSection.chip}
        />
        <ContentBlock
          size="section"
          headline={t('Powerful CV Tools')}
          text={t('home2.subtitle')}
          textMaxWidth="560px"
        />
      </Box>

      <Box sx={featuresSection.grid}>
        {CV_TOOLS.map((tool, index) => (
          <Box
            key={index}
            onClick={() => navigate(tool.to)}
            sx={featuresSection.card}
          >
            <Box sx={featuresSection.iconBadgeRow}>
                <Box sx={featuresSection.iconBox}>
                  {tool.icon}
                </Box>
                <Chip
                  label={t(tool.badge)}
                  size="small"
                  sx={featuresSection.badgeChip}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={featuresSection.cardTitle}>
                  {t(tool.titleKey)}
                </Typography>
                <Typography variant="body2" sx={featuresSection.cardDesc}>
                  {t(tool.descriptionKey)}
                </Typography>
              </Box>

            <Box className="arrow-icon" sx={featuresSection.arrowRow}>
              <Typography sx={featuresSection.arrowLabel}>
                {t('Learn more')}
              </Typography>
              <ArrowRight size={15} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default FeaturesSection;
