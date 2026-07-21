import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, Button,
  Tab, Tabs, Chip, IconButton, CircularProgress, LinearProgress,
  Divider, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import EditNoteIcon from '@mui/icons-material/EditNote';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import PdfPlainCV from '../../../../templates/pdf/PdfPlainCV';
import { updateFormData } from '../../../../redux/store/slices/cvBuilderSlice';
import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';
import { roundScore } from '../../../../utils/scoreDisplay';
import type { CVChange, ScoreCategory } from '../../../../redux/store/slices/cvAdjustSlice';

const LOADING_STEPS = [
  'Reading your CV...',
  'Identifying every issue...',
  'Rewriting sections...',
  'Strengthening action verbs...',
  'Optimizing ATS keywords...',
  'Scoring your optimized CV...',
];

const IMPACT_CONFIG = {
  high: { color: '#b71c1c', bg: 'rgba(183,28,28,0.08)', label: 'High Impact' },
  medium: { color: '#c25b1a', bg: 'rgba(194,91,26,0.08)', label: 'Medium Impact' },
  low: { color: COLORS.textSecondary, bg: 'rgba(0,0,0,0.05)', label: 'Low Impact' },
};

interface OptimizedCVViewProps {
  cvText: string;
}

const OptimizedCVView = ({ cvText }: OptimizedCVViewProps) => (
  <Box
    component="pre"
    sx={{
      fontFamily: TYPOGRAPHY.fontSans,
      fontSize: '0.88rem',
      lineHeight: 1.75,
      color: COLORS.textPrimary,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      m: 0,
      p: 0,
    }}
  >
    {cvText}
  </Box>
);

interface PathTo100Props {
  breakdown: ScoreCategory[];
  newScore: number;
}

const PathTo100 = ({ breakdown, newScore }: PathTo100Props) => {
  const { t } = useTranslation();
  const gaps = breakdown
    .filter((c) => c.earned < c.max && c.tip && c.tip !== 'null')
    .sort((a, b) => (b.max - b.earned) - (a.max - a.earned));
  if (gaps.length === 0 || newScore >= 100) return null;

  const userGaps = gaps.filter((c) => c.owner !== 'ai');
  const aiGaps = gaps.filter((c) => c.owner === 'ai');
  const content = userGaps.filter((c) => c.blocker !== 'experience');
  const experience = userGaps.filter((c) => c.blocker === 'experience');
  const toGo = Math.max(1, 100 - newScore);

  const Row = ({ c }: { c: ScoreCategory }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontWeight: 600, color: COLORS.textPrimary, fontSize: '0.88rem' }}>
        {c.name}
      </Typography>
      <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.82rem', lineHeight: 1.55 }}>{c.tip}</Typography>
    </Box>
  );

  return (
    <Box sx={{ mb: 3, p: 3, borderRadius: '16px', border: `1px solid ${COLORS.borderLight}`, bgcolor: COLORS.bgLight }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.textPrimary, mb: 0.5 }}>
        {t('Your path to 100')}
      </Typography>
      <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.88rem', mb: 2.5 }}>
        {t('You are at {{score}} — {{gap}} points to 100. Here is how to close the gap:', { score: newScore, gap: toGo })}
      </Typography>

      {content.length > 0 && (
        <Box sx={{ mb: experience.length > 0 || aiGaps.length > 0 ? 2.5 : 0 }}>
          <Chip
            label={t('Only you can add these')}
            size="small"
            sx={{ mb: 1.5, bgcolor: COLORS.primaryAlpha12, color: COLORS.primary, fontWeight: 700 }}
          />
          {content.map((c) => <Row key={c.name} c={c} />)}
        </Box>
      )}

      {experience.length > 0 && (
        <Box sx={{ mb: aiGaps.length > 0 ? 2.5 : 0 }}>
          <Chip
            label={t('Needs more real experience')}
            size="small"
            sx={{ mb: 1.5, bgcolor: 'rgba(0,0,0,0.05)', color: COLORS.textSecondary, fontWeight: 700 }}
          />
          {experience.map((c) => <Row key={c.name} c={c} />)}
          <Typography sx={{ mt: 1, color: COLORS.textSecondary, fontSize: '0.8rem', fontStyle: 'italic' }}>
            {t('These points come from experience you earn over time — a perfect 100 is not expected, or honest, for every stage of a career.')}
          </Typography>
        </Box>
      )}

      {aiGaps.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <CheckCircleIcon sx={{ color: COLORS.primary, fontSize: 18, mt: 0.2 }} />
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.82rem', lineHeight: 1.55 }}>
            {t('The AI already rewrote your {{sections}} for maximum impact — no action needed there.', {
              sections: aiGaps.map((c) => c.name).join(', '),
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

interface ChangesListProps {
  changes: CVChange[];
  originalScore: number;
  newScore: number;
  newBreakdown: ScoreCategory[];
}

const ChangesList = ({ changes, originalScore, newScore, newBreakdown }: ChangesListProps) => {
  const { t } = useTranslation();
  const safeOrig = roundScore(Number.isFinite(originalScore) ? originalScore : 0);
  const safeNew = roundScore(Number.isFinite(newScore) ? newScore : originalScore);
  const gain = safeNew - safeOrig;

  return (
    <Box>
      <Box sx={{
        p: 3, mb: 3, borderRadius: '16px',
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
        color: 'white', display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap',
      }}>
        <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.9 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {t('CV Quality Score After Optimization')}
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '0.95rem' }}>
            {t('Your optimized CV was re-scored by the same AI — an estimate of how it now performs against ATS standards.')}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', opacity: 0.7 }}>{safeOrig}</Typography>
              <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('Before')}</Typography>
            </Box>
            <Typography sx={{ fontSize: '2rem', opacity: 0.6 }}>→</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeNew}</Typography>
              <Typography sx={{ fontSize: '0.75rem', opacity: 0.9 }}>{t('After')}</Typography>
            </Box>
            <Chip
              label={gain > 0 ? `+${gain} pts` : `${gain} pts`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={safeNew}
            sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
          />
        </Box>
      </Box>

      <PathTo100 breakdown={newBreakdown} newScore={safeNew} />

      {gain <= 0 ? (
        <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: COLORS.bgLight, border: `1px solid ${COLORS.borderLight}` }}>
          <Typography sx={{ color: COLORS.textPrimary, fontWeight: 600, mb: 0.5 }}>
            {t('Your CV is already well-optimized')}
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.88rem', lineHeight: 1.6 }}>
            {t('Rewriting did not raise the score — the writing is already strong. The remaining points above are what to focus on next.')}
          </Typography>
        </Box>
      ) : (
        <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.textPrimary, mb: 2 }}>
        {t('What was changed and why')}
      </Typography>
      {changes.map((change, i) => {
        const config = IMPACT_CONFIG[change.impact] || IMPACT_CONFIG.low;
        return (
          <Box key={i} sx={{ mb: 2.5, p: 2.5, borderRadius: '14px', border: `1px solid ${COLORS.borderLight}`, bgcolor: config.bg }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={change.section}
                size="small"
                sx={{ bgcolor: COLORS.primaryAlpha12, color: COLORS.primary, fontWeight: 'bold', fontSize: '0.78rem' }}
              />
              <Chip
                label={config.label}
                size="small"
                sx={{ bgcolor: config.bg, color: config.color, fontWeight: 600, fontSize: '0.75rem', border: `1px solid ${config.color}30` }}
              />
            </Box>
            <Typography sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 0.5, fontSize: '0.92rem' }}>
              {change.what}
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem', lineHeight: 1.6 }}>
              <b>{t('Why:')}</b> {change.why}
            </Typography>
            {i < changes.length - 1 && <Divider sx={{ mt: 2, opacity: 0 }} />}
          </Box>
        );
      })}
        </>
      )}
    </Box>
  );
};

interface LoadingStateProps {
  stepIndex: number;
}

const LoadingState = ({ stepIndex }: LoadingStateProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: 4, p: 3, flexWrap: 'wrap' }}>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Box sx={{ p: 3, borderRadius: '16px', border: `1px solid ${COLORS.borderLight}`, bgcolor: COLORS.bgLight }}>
          {[80, 60, 90, 50, 70, 60, 85, 45, 75, 65, 55, 80].map((w, i) => (
            <Box
              key={i}
              sx={{
                height: i % 4 === 0 ? 14 : 8, borderRadius: 4,
                bgcolor: i % 4 === 0 ? COLORS.primaryAlpha20 : COLORS.borderMedium,
                width: `${w}%`, mb: i % 4 === 0 ? 2 : 1,
                mt: i % 4 === 0 && i !== 0 ? 2 : 0,
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AutoFixHighIcon sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.textPrimary }}>
            {t('AI is optimizing your CV')}
          </Typography>
        </Box>
        {LOADING_STEPS.map((step, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {i < stepIndex ? (
              <CheckCircleIcon sx={{ color: COLORS.primary, fontSize: 22 }} />
            ) : i === stepIndex ? (
              <CircularProgress size={20} sx={{ color: COLORS.primary }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ color: COLORS.borderMedium, fontSize: 22 }} />
            )}
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: i <= stepIndex ? COLORS.textPrimary : COLORS.textSecondary,
                fontWeight: i === stepIndex ? 600 : 400,
                transition: 'all 0.3s',
              }}
            >
              {t(step)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface CVOptimizeModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  adjustedCV: string | null;
  changes: CVChange[];
  newScore: number | null;
  newBreakdown: ScoreCategory[];
  originalScore: number;
}

const CVOptimizeModal = ({
  open, onClose, loading, error, adjustedCV, changes, newScore, newBreakdown, originalScore,
}: CVOptimizeModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [openingBuilder, setOpeningBuilder] = useState(false);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const formDataCache = useRef<any>(null);

  const ensureFormData = async () => {
    if (formDataCache.current) return formDataCache.current;
    const res = await axios.post(AI_ENDPOINTS.parseCv, { cvText: adjustedCV }, { withCredentials: true });
    formDataCache.current = res.data.formData;
    return res.data.formData;
  };

  const handleEditInBuilder = async () => {
    if (!adjustedCV) return;
    setOpeningBuilder(true);
    try {
      const formData = await ensureFormData();
      dispatch(updateFormData(formData));
      navigate('/builder');
    } catch {
      // leave the modal open on failure
    } finally {
      setOpeningBuilder(false);
    }
  };

  useEffect(() => {
    if (loading) {
      formDataCache.current = null;
      setStepIndex(0);
      stepTimer.current = setInterval(() => {
        setStepIndex((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
      }, 2200);
    } else {
      if (stepTimer.current) clearInterval(stepTimer.current);
      if (adjustedCV) setStepIndex(LOADING_STEPS.length);
    }
    return () => { if (stepTimer.current) clearInterval(stepTimer.current); };
  }, [loading, adjustedCV]);

  const handleDownload = async () => {
    if (!adjustedCV) return;
    setDownloading(true);
    try {
      const firstLine = adjustedCV.split('\n').map((l) => l.trim()).find(Boolean) || 'optimized';
      const blob = await pdf(<PdfPlainCV cvText={adjustedCV} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${firstLine.replace(/\s+/g, '_').slice(0, 40)}_CV.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const blob = new Blob([adjustedCV], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-cv.txt';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const isDone = !loading && !!adjustedCV;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: '24px', maxHeight: '90vh', background: COLORS.bgWhite } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoFixHighIcon sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.textPrimary }}>
            {t('AI CV Optimizer')}
          </Typography>
          {isDone && (
            <Chip label={t('Complete')} size="small" sx={{ bgcolor: COLORS.primaryAlpha12, color: COLORS.primary, fontWeight: 600 }} />
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ '&:hover': { bgcolor: COLORS.bgHover } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading && <LoadingState stepIndex={stepIndex} />}

        {error && (
          <Box sx={{ p: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {isDone && (
          <>
            <Box sx={{ borderBottom: `1px solid ${COLORS.borderLight}`, px: 3 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
                  '& .Mui-selected': { color: COLORS.primary },
                  '& .MuiTabs-indicator': { bgcolor: COLORS.primary },
                }}
              >
                <Tab label={t('Score & Changes')} />
                <Tab label={t('Optimized CV')} />
              </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              {tab === 0 && (
                <ChangesList
                  changes={changes}
                  originalScore={originalScore}
                  newScore={newScore ?? originalScore}
                  newBreakdown={newBreakdown}
                />
              )}
              {tab === 1 && adjustedCV && <OptimizedCVView cvText={adjustedCV} />}
            </Box>

            <Box sx={{ p: 2.5, borderTop: `1px solid ${COLORS.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem' }}>
                {t('Download your optimized CV — ready to submit to employers.')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={openingBuilder ? <CircularProgress size={16} sx={{ color: COLORS.primary }} /> : <EditNoteIcon />}
                onClick={handleEditInBuilder}
                disabled={openingBuilder}
                sx={{ color: COLORS.primary, borderColor: COLORS.primary, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: COLORS.primaryAlpha12 } }}
              >
                {openingBuilder ? t('Opening...') : t('Edit in Builder')}
              </Button>
              <Tooltip title={t('Downloads as PDF')}>
                <Button
                  variant="contained"
                  startIcon={downloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloading}
                  sx={{ bgcolor: COLORS.primary, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3, '&:hover': { bgcolor: COLORS.primaryDark } }}
                >
                  {downloading ? t('Downloading...') : t('Download Optimized CV')}
                </Button>
              </Tooltip>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CVOptimizeModal;
