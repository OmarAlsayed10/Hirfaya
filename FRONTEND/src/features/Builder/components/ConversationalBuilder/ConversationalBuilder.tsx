import { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
  TextField, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';
import { updateFormData } from '../../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../../redux/store/store';
import { COLORS } from '../../../../theme/tokens';

interface Msg { role: 'user' | 'assistant'; content: string; }

const GREETING = "how can we help you with your cv today ?";

interface Props { open: boolean; onClose: () => void; onUpdate?: () => void; }

const ConversationalBuilder = ({ open, onClose, onUpdate }: Props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const formData = useSelector((s: RootState) => s.cvBuilder?.formData);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: t(GREETING) }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(
        AI_ENDPOINTS.conversationalBuild,
        { messages: next, formData },
        { withCredentials: true },
      );
      if (res.data?.formData) {
        dispatch(updateFormData(res.data.formData));
        if (onUpdate) onUpdate();
      }
      setMessages((m) => [...m, { role: 'assistant', content: res.data?.reply || t('Got it — what next?') }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('Sorry, something went wrong. Try again.') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '20px', height: '80vh', display: 'flex', flexDirection: 'column' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: COLORS.primary }} />
          <Typography sx={{ fontWeight: 'bold', color: COLORS.textPrimary }}>{t('Build with AI Chat')}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: COLORS.bgLight }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
            <Box sx={{
              maxWidth: '80%', px: 2, py: 1.2, borderRadius: '14px',
              bgcolor: m.role === 'user' ? COLORS.primary : '#fff',
              color: m.role === 'user' ? '#fff' : COLORS.textPrimary,
              border: m.role === 'user' ? 'none' : `1px solid ${COLORS.borderLight}`,
              fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
            <Box sx={{ px: 2, py: 1.2, borderRadius: '14px', bgcolor: '#fff', border: `1px solid ${COLORS.borderLight}` }}>
              <CircularProgress size={16} sx={{ color: COLORS.primary }} />
            </Box>
          </Box>
        )}
        <div ref={endRef} />
      </DialogContent>

      <Box sx={{ p: 2, borderTop: `1px solid ${COLORS.borderLight}`, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <TextField
          fullWidth multiline maxRows={4} size="small"
          placeholder={t('Type your answer...')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <IconButton
          onClick={send}
          disabled={loading || !input.trim()}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            bgcolor: COLORS.primary,
            color: '#fff',
            '&:hover': { bgcolor: COLORS.primaryDark },
            '&.Mui-disabled': { bgcolor: COLORS.borderMedium },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default ConversationalBuilder;
