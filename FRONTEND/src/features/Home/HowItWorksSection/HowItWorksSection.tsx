import { Box, Typography, Chip } from '@mui/material';
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HOW_IT_WORKS_STEPS } from '../../../constants/homeData';
import { STEP_ILLUSTRATIONS } from '../HowItWorksIllustrations';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import howItWorksSection from './howItWorksSection.tokens';
import { COLORS } from '../../../theme/tokens';

const STEP_ICONS = [UploadFileOutlinedIcon, AutoFixHighOutlinedIcon, RocketLaunchOutlinedIcon];

function HowItWorksSection() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      setActiveStep(Math.min(2, Math.floor(progress * 3)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const step = HOW_IT_WORKS_STEPS[activeStep];

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-bar {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <Box ref={containerRef} sx={howItWorksSection.outerBox}>
        <Box sx={howItWorksSection.stickyPanel}>
          <Box sx={howItWorksSection.innerContainer}>

            <Box sx={howItWorksSection.leftPane}>
              <Box sx={howItWorksSection.stepCounterRow}>
                <Box sx={howItWorksSection.stepCounterBadge}>
                  {String(activeStep + 1).padStart(2, '0')}
                </Box>
                <Chip label={t('Simple & Fast')} size="small" sx={howItWorksSection.chip} />
              </Box>

              <Box key={activeStep} sx={howItWorksSection.animatedBlock}>
                <Typography variant="h2" sx={howItWorksSection.stepTitle}>
                  {t(step.titleKey)}
                </Typography>

                <Typography sx={howItWorksSection.stepDesc}>
                  {t(step.descriptionKey)}
                </Typography>

                <Box sx={howItWorksSection.bulletRow}>
                  {step.detailPoints.map((pt, i) => (
                    <Box key={i} sx={howItWorksSection.bulletItem}>
                      <CheckCircleOutlineIcon sx={howItWorksSection.bulletIcon} />
                      <Typography sx={howItWorksSection.bulletText}>{t(pt)}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={howItWorksSection.badgesRow}>
                  {step.badges.map((badge) => (
                    <Box key={badge} sx={howItWorksSection.badge}>
                      {t(badge)}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box key={`ill-${activeStep}`} sx={howItWorksSection.illustrationPanel}>
                {STEP_ILLUSTRATIONS[activeStep]}
              </Box>
            </Box>

            <Box sx={howItWorksSection.rightPane}>
              <Typography sx={howItWorksSection.rightPaneLabel}>
                {t('How It Works')}
              </Typography>

              <Box sx={howItWorksSection.progressTrack}>
                <Box sx={{
                  width: '100%',
                  bgcolor: COLORS.primary,
                  borderRadius: 2,
                  transition: 'height 0.6s cubic-bezier(0.22,1,0.36,1)',
                  height: activeStep === 0 ? '0%' : activeStep === 1 ? '50%' : '100%',
                }} />
              </Box>

              {HOW_IT_WORKS_STEPS.map((s, i) => {
                const isActive = i === activeStep;
                const isDone = i < activeStep;
                const Icon = STEP_ICONS[i];
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: i < 2 ? 4 : 0, position: 'relative', zIndex: 1 }}>
                    <Box sx={howItWorksSection.timelineNodeActive(isActive, isDone)}>
                      <Icon sx={{ fontSize: 16, color: isActive || isDone ? 'white' : `${COLORS.primary}66`, transition: 'color 0.3s' }} />
                    </Box>
                    <Box sx={{ pt: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: isActive ? COLORS.textPrimary : COLORS.textSecondary, transition: 'color 0.3s', lineHeight: 1.3 }}>
                        {s.step}. {t(s.titleKey)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

          </Box>
        </Box>
      </Box>
    </>
  );
}

export default HowItWorksSection;
