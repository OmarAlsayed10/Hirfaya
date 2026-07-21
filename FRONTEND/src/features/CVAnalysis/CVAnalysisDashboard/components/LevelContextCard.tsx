import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Award, ShieldAlert } from "../../../../components/icons/MuiIcons";
import { COLORS } from '../../../../theme/tokens';
import type { LevelContext } from '../CVAnalysisDashboard.types';

interface LevelContextCardProps {
  levelContext: LevelContext;
}

const LEVELS = ['Fresh', 'Junior', 'Mid', 'Senior', 'Lead'] as const;

export default function LevelContextCard({ levelContext }: LevelContextCardProps) {
  const { t } = useTranslation();
  const {
    level,
    fit,
    message,
    nextLevel,
    nextLevelTips,
    belowBar,
    levelReasons,
    skillLevel,
  } = levelContext;

  const activeIndex = LEVELS.indexOf(level as any);
  const displayIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: '24px',
        border: `1px solid ${COLORS.primary}22`,
        bgcolor: 'rgba(245, 247, 245, 0.5)',
        boxShadow: '0 4px 20px rgba(42, 92, 69, 0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header section with message and fit badge */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: belowBar ? '#fbebe8' : `${COLORS.primary}12`,
              color: belowBar ? '#d32f2f' : COLORS.primary,
              flexShrink: 0,
            }}
          >
            {belowBar ? <ShieldAlert size={22} /> : <Award size={22} />}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: COLORS.textPrimary,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              lineHeight: 1.3,
            }}
          >
            {t(message)}
          </Typography>
        </Box>

        {typeof fit === 'number' && (
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: '16px',
              bgcolor: belowBar ? '#fbebe8' : `${COLORS.primary}12`,
              border: `1px solid ${belowBar ? '#fbebe8' : `${COLORS.primary}22`}`,
              color: belowBar ? '#d32f2f' : COLORS.primary,
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              alignSelf: { xs: 'flex-start', sm: 'center' },
            }}
          >
            {t('Level fit')}: {fit}%
          </Box>
        )}
      </Box>

      {/* Stepper / Progression Bar */}
      <Box sx={{ mb: 4, px: { xs: 1, md: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            mt: 2,
            mb: 1,
          }}
        >
          {/* Connector Line */}
          <Box
            sx={{
              position: 'absolute',
              top: '12px',
              left: 0,
              right: 0,
              height: '4px',
              bgcolor: 'rgba(26,26,24,0.06)',
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '12px',
              left: 0,
              width: `${(displayIndex / (LEVELS.length - 1)) * 100}%`,
              height: '4px',
              bgcolor: COLORS.primary,
              zIndex: 1,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {LEVELS.map((lvl, index) => {
            const isCompleted = index < displayIndex;
            const isActive = index === displayIndex;
            const isUpcoming = index > displayIndex;

            return (
              <Box
                key={lvl}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  position: 'relative',
                  width: '60px',
                }}
              >
                {/* Dot */}
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isActive
                      ? COLORS.primary
                      : isCompleted
                      ? COLORS.primary
                      : '#fff',
                    border: `3px solid ${
                      isActive || isCompleted ? COLORS.primary : 'rgba(26,26,24,0.12)'
                    }`,
                    boxShadow: isActive
                      ? `0 0 0 6px ${COLORS.primary}22`
                      : 'none',
                    transition: 'all 0.4s ease',
                    ...(isActive && {
                      '@keyframes pulse': {
                        '0%': { boxShadow: `0 0 0 0 rgba(42, 92, 69, 0.4)` },
                        '70%': { boxShadow: `0 0 0 8px rgba(42, 92, 69, 0)` },
                        '100%': { boxShadow: `0 0 0 0 rgba(42, 92, 69, 0)` },
                      },
                      animation: 'pulse 2s infinite',
                    }),
                  }}
                >
                  {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
                  {isActive && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#fff',
                      }}
                    />
                  )}
                </Box>
                {/* Label */}
                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive
                      ? COLORS.primary
                      : isCompleted
                      ? COLORS.textPrimary
                      : COLORS.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  {t(lvl)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Two column detail layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mt: 4,
          borderTop: `1px solid rgba(26,26,24,0.06)`,
          pt: 3,
        }}
      >
        {/* Why you fit section */}
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color: COLORS.textPrimary,
              mb: 2,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {t('Why you fit this level')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {levelReasons && levelReasons.length > 0 ? (
              levelReasons.map((reason, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(26,26,24,0.03)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: `${COLORS.primary}12`,
                      color: COLORS.primary,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </Box>
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: '0.88rem', fontWeight: 500 }}>
                    {t(reason)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.88rem', fontStyle: 'italic' }}>
                {t('Based on the experience and skills detected on your CV.')}
              </Typography>
            )}
          </Box>
        </Box>

        {/* How to reach next level section */}
        {nextLevelTips && nextLevelTips.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: COLORS.textPrimary,
                mb: 2,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {belowBar ? t('To close the gap to') : t('To level up to')}{' '}
              <span style={{ color: COLORS.primary }}>{t(nextLevel)}</span>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {nextLevelTips.map((tip, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(26,26,24,0.03)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'rgba(42, 92, 69, 0.06)',
                      color: COLORS.primary,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </Box>
                  <Typography sx={{ color: COLORS.textPrimary, fontSize: '0.88rem', fontWeight: 500 }}>
                    {t(tip)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
