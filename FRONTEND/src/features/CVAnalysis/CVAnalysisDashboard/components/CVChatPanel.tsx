import { Box, Dialog, DialogContent, DialogTitle, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import type { useCVChat } from '../hooks/useCVChat';

const SUGGESTIONS_KEYS = [
  'How should I answer "Tell me about yourself"?',
  'What are my biggest CV weaknesses?',
  'Which companies should I target with this CV?',
];

type CVChatPanelProps = ReturnType<typeof useCVChat> & {
  open: boolean;
  onClose: () => void;
};

const CVChatPanel = ({ open, onClose, messages, input, loading, setInput, send }: CVChatPanelProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', height: '80vh', maxHeight: 640 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkspacePremiumIcon sx={{ color: COLORS.primary, fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.primary }}>{t('Ask AI About Your CV')}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.9rem', mb: 0.5 }}>
                {t('Pick a question or type your own — answers are based on your actual CV.')}
              </Typography>
              {SUGGESTIONS_KEYS.map((key, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  size="small"
                  onClick={() => send(t(key))}
                  sx={{ borderColor: COLORS.borderMedium, color: COLORS.textSecondary, borderRadius: '10px', textTransform: 'none', justifyContent: 'flex-start', fontSize: '0.85rem', '&:hover': { borderColor: COLORS.primary, color: COLORS.primary } }}
                >
                  {t(key)}
                </Button>
              ))}
            </Box>
          )}
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', p: 2,
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                bgcolor: msg.role === 'user' ? COLORS.primary : COLORS.bgLight,
                color: msg.role === 'user' ? COLORS.onAccent : COLORS.textPrimary,
                fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
            </Box>
          ))}
          {loading && (
            <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ color: COLORS.primary }} />
              <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem' }}>{t('Thinking...')}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <TextField
            fullWidth size="small"
            placeholder={t('Ask about your CV, interview prep, career advice...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: COLORS.primary } } }}
          />
          <IconButton
            onClick={() => send()}
            disabled={loading || !input.trim()}
            sx={{ bgcolor: COLORS.primarySurface, color: COLORS.onAccent, borderRadius: '12px', px: 2, '&:hover': { bgcolor: COLORS.primarySurfaceDark }, '&.Mui-disabled': { bgcolor: COLORS.disabled } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CVChatPanel;
