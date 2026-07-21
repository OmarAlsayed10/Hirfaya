import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAuth } from '../../../../hooks/useAuth';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';
import type { RootState } from '../../../../redux/store/store';
import { isProUser } from '../../../../utils/proAccess';
import { COLORS, RADIUS } from '../../../../theme/tokens';

interface AIEditInputContext {
  jobTitle?: string;
  company?: string;
  projectName?: string;
  technologies?: string;
  institution?: string;
  degree?: string;
}

interface AIEditInputProps {
  section: string;
  currentContent: string;
  context: AIEditInputContext;
  onResult: (text: string) => void;
}

const QUICK_CHIPS: Record<string, string[]> = {
  experience: ['Write description', 'Add metrics', 'Make concise', 'Add keywords'],
  projects: ['Write description', 'Highlight tech stack', 'Add impact', 'Make concise'],
  summary: ['Write summary', 'Make shorter', 'Add keywords', 'More professional'],
  education: ['Write description', 'Add coursework', 'Make concise'],
  skills: ['Suggest skills', 'Add keywords'],
};

const AIEditInput = ({ section, currentContent, context, onResult }: AIEditInputProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPro = isProUser(user);
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleSend = async (text?: string) => {
    const userPrompt = (text || prompt).trim();
    if (!userPrompt || loading) return;

    if (!isPro) {
      navigate('/pricing');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        AI_ENDPOINTS.editFieldAI,
        { sectionName: section, userPrompt, currentContent, context, formData },
        { withCredentials: true },
      );
      if (data?.result) {
        onResult(data.result);
        setPrompt('');
        setExpanded(false);
      }
    } catch {
      // keep the user's text on failure
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    setPrompt(chipText);
    handleSend(chipText);
  };

  const chips = QUICK_CHIPS[section.toLowerCase()] || QUICK_CHIPS.experience;

  return (
    <Box sx={{ mt: 0.5 }}>
      <Collapse in={!expanded}>
        <Box
          onClick={() => setExpanded(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.75,
            borderRadius: RADIUS.lg,
            border: `1px dashed ${COLORS.borderMedium}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: COLORS.primary,
              bgcolor: COLORS.primaryAlpha12,
            },
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16, color: COLORS.primary }} />
          <Typography
            variant="body2"
            sx={{
              color: COLORS.textSecondary,
              fontSize: '0.8rem',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            {t('Edit with AI')}
          </Typography>
        </Box>
      </Collapse>

      <Collapse in={expanded}>
        <Box
          sx={{
            border: `1px solid ${COLORS.primaryAlpha35}`,
            borderRadius: RADIUS.lg,
            bgcolor: '#fafdf8',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 0.5,
              borderBottom: `1px solid ${COLORS.borderLight}`,
              bgcolor: COLORS.primaryAlpha12,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 14, color: COLORS.primary }} />
              <Typography
                variant="caption"
                sx={{ color: COLORS.primary, fontWeight: 600, fontSize: '0.75rem' }}
              >
                {t('Edit with AI')}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => { setExpanded(false); setPrompt(''); }} sx={{ p: 0.25 }}>
              <CloseIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
            </IconButton>
          </Box>

          {/* Quick Chips */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              px: 1.5,
              pt: 1,
              pb: 0.5,
            }}
          >
            {chips.map((chip) => (
              <Chip
                key={chip}
                label={t(chip)}
                size="small"
                icon={<BoltIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => handleChipClick(chip)}
                disabled={loading}
                sx={{
                  height: 26,
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  bgcolor: '#fff',
                  border: `1px solid ${COLORS.borderMedium}`,
                  color: COLORS.textSecondary,
                  '& .MuiChip-icon': { color: COLORS.primaryLight },
                  '&:hover': {
                    bgcolor: COLORS.primaryAlpha12,
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                  },
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>

          {/* Input Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, pb: 1, pt: 0.5 }}>
            <TextField
              inputRef={inputRef}
              fullWidth
              size="small"
              variant="outlined"
              placeholder={t('e.g. Write ATS-friendly bullet points for this role...')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: RADIUS.md,
                  bgcolor: '#fff',
                  fontSize: '0.82rem',
                  '& fieldset': { borderColor: COLORS.borderMedium },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                },
                '& .MuiInputBase-input': {
                  py: 0.75,
                  px: 1.25,
                },
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={loading || !prompt.trim()}
              size="small"
              sx={{
                bgcolor: COLORS.primary,
                color: '#fff',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: COLORS.primaryDark },
                '&.Mui-disabled': { bgcolor: COLORS.disabled, color: '#999' },
              }}
            >
              {loading ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                <SendIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default AIEditInput;
