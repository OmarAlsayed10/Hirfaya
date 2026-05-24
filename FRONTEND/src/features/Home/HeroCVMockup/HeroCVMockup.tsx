import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import heroCVMockup from './heroCVMockup.tokens';


const BODY_SECTIONS = [
  { delay: 0.8, lineWidths: ['85%', '95%'] },
  { delay: 1.4, lineWidths: ['100%', '75%'] },
  { delay: 1.8, lineWidths: ['85%', '95%'] },
] as const;

const HeroCVMockup = () => {
  const { t } = useTranslation();

  return (
    <Box
      component={motion.div}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      sx={heroCVMockup.floatWrapper}
    >
      {/* CV Created Successfully popup — auto-appears after animation completes */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.6, ease: 'easeOut' }}
        sx={heroCVMockup.badge}
      >
        <CheckIcon sx={{ fontSize: '1.2rem' }} />
        <Typography sx={heroCVMockup.badgeText}>
          {t('CV Created Successfully')}
        </Typography>
      </Box>

      {/* Animated CV card */}
      <Box sx={heroCVMockup.card}>
        {/* Profile row */}
        <Box sx={heroCVMockup.profileRow}>
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            sx={heroCVMockup.avatar}
          />
          <Box sx={heroCVMockup.profileLines}>
            <Box
              component={motion.div}
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              sx={heroCVMockup.nameLine}
            />
            <Box
              component={motion.div}
              initial={{ width: 0 }}
              animate={{ width: '35%' }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              sx={heroCVMockup.roleLine}
            />
          </Box>
        </Box>

        <Box sx={heroCVMockup.divider} />

        {/* Body sections */}
        {BODY_SECTIONS.map(({ delay, lineWidths }, index) => (
          <Box key={index} sx={heroCVMockup.sectionRow}>
            <Box
              component={motion.div}
              initial={{ width: 0 }}
              animate={{ width: '25%' }}
              transition={{ duration: 0.6, delay, ease: 'easeOut' }}
              sx={heroCVMockup.sectionTitle}
            />
            {lineWidths.map((width, i) => (
              <Box
                key={i}
                component={motion.div}
                initial={{ width: 0 }}
                animate={{ width }}
                transition={{ duration: 0.8, delay: delay + 0.2 * (i + 1), ease: 'easeOut' }}
                sx={heroCVMockup.sectionLine}
              />
            ))}
            {index === 0 && (
              <Box
                component={motion.div}
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 0.8, delay: delay + 0.6, ease: 'easeOut' }}
                sx={heroCVMockup.sectionLine}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HeroCVMockup;
