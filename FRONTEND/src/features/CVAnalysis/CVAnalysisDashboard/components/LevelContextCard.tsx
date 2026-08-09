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
  } = levelContext;

  const activeIndex = LEVELS.indexOf(level as any);
  const displayIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: '24px',
        border: `1px solid ${COLORS.primaryAlpha20}`,
        bgcolor: COLORS.surfaceSubtle,
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
          background: `radial-gradient(circle, ${COLORS.primaryAlpha12} 0%, transparent 70%)`,
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
              bgcolor: belowBar ? COLORS.dangerSoft : `${COLORS.primaryAlpha12}`,
              color: belowBar ? COLORS.danger : COLORS.primary,
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
              bgcolor: belowBar ? COLORS.dangerSoft : `${COLORS.primaryAlpha12}`,
              border: `1px solid ${belowBar ? COLORS.dangerSoft : `${COLORS.primaryAlpha20}`}`,
              color: belowBar ? COLORS.danger : COLORS.primary,
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
          {/* Connector lines span dot centres: each step is a 60px cell, so inset by half a cell. */}
          <Box
            sx={{
              position: 'absolute',
              top: '12px',
              left: '30px',
              right: '30px',
              height: '4px',
              bgcolor: COLORS.borderLight,
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '12px',
              insetInlineStart: '30px',
              width: `calc((100% - 60px) * ${displayIndex / (LEVELS.length - 1)})`,
              height: '4px',
              bgcolor: COLORS.primarySurface,
              zIndex: 1,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {LEVELS.map((lvl, index) => {
            const isCompleted = index < displayIndex;
            const isActive = index === displayIndex;

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
                      : COLORS.onAccent,
                    border: `3px solid ${
                      isActive || isCompleted ? COLORS.primary : COLORS.borderMedium
                    }`,
                    boxShadow: isActive
                      ? `0 0 0 6px ${COLORS.primaryAlpha20}`
                      : 'none',
                    transition: 'all 0.4s ease',
                    ...(isActive && {
                      '@keyframes pulse': {
                        '0%': { boxShadow: `0 0 0 0 ${COLORS.primaryAlpha35}` },
                        '70%': { boxShadow: '0 0 0 8px transparent' },
                        '100%': { boxShadow: '0 0 0 0 transparent' },
                      },
                      animation: 'pulse 2s infinite',
                    }),
                  }}
                >
                  {isCompleted && <Check size={14} color={COLORS.onAccent} strokeWidth={3} />}
                  {isActive && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: COLORS.bgWhite,
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
          borderTop: `1px solid ${COLORS.borderLight}`,
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
                    bgcolor: COLORS.bgRaised,
                    border: `1px solid ${COLORS.borderLight}`,
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
                      bgcolor: `${COLORS.primaryAlpha12}`,
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
                    bgcolor: COLORS.bgRaised,
                    border: `1px solid ${COLORS.borderLight}`,
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
                      bgcolor: COLORS.primaryAlpha12,
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
