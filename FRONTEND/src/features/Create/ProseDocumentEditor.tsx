import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, Grid, Alert, CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { DOCUMENT_ENDPOINTS } from '../../constants/endpoints';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../theme/tokens';

type DocType = 'cover-letter' | 'linkedin-bio';

const LABELS: Record<DocType, { heading: string; blurb: string }> = {
  'cover-letter': {
    heading: 'Cover Letter',
    blurb: 'Generated from your primary CV and tailored to the role you enter.',
  },
  'linkedin-bio': {
    heading: 'LinkedIn Bio',
    blurb: 'A first-person "About" summary drawn from your primary CV.',
  },
};

const errMsg = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const ProseDocumentEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const type = (params.get('type') as DocType) || 'cover-letter';
  const meta = LABELS[type] ?? LABELS['cover-letter'];
  const isCoverLetter = type === 'cover-letter';

  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [docId, setDocId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    setError('');
    setGenerating(true);
    try {
      const { data } = await axios.post(
        DOCUMENT_ENDPOINTS.generate,
        { type, targetRole: role, targetCompany: company },
        { withCredentials: true }
      );
      setDocId(data.document.id);
      setTitle(data.document.title);
      setContent(data.document.content);
      setSaved(true);
    } catch (e) {
      setError(errMsg(e, t('Generation failed. Please try again.')));
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!docId) return;
    setSaving(true);
    setError('');
    try {
      await axios.put(DOCUMENT_ENDPOINTS.update(docId), { title, content }, { withCredentials: true });
      setSaved(true);
    } catch (e) {
      setError(errMsg(e, t('Could not save. Please try again.')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5fa', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}`, bgcolor: '#fff', p: { xs: 3, md: 4 } }}>
          <Typography sx={{ fontFamily: TYPOGRAPHY.fontSerif, fontSize: '1.6rem', color: COLORS.textPrimary, mb: 0.5 }}>
            {t(meta.heading)}
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, mb: 3 }}>{t(meta.blurb)}</Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: RADIUS.md }}>{error}</Alert>}

          {isCoverLetter && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label={t('Target role')} placeholder={t('Frontend Developer')} value={role} onChange={(e) => setRole(e.target.value)} inputProps={{ maxLength: 100 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label={t('Company (optional)')} value={company} onChange={(e) => setCompany(e.target.value)} inputProps={{ maxLength: 100 }} />
              </Grid>
            </Grid>
          )}

          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={generate}
            disabled={generating || (isCoverLetter && !role.trim())}
            sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark }, mb: 3 }}
          >
            {content ? t('Regenerate') : t('Generate')}
          </Button>

          {content && (
            <>
              <TextField fullWidth size="small" label={t('Title')} value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} inputProps={{ maxLength: 150 }} sx={{ mb: 2 }} />
              <TextField
                fullWidth multiline minRows={10} label={t('Content')}
                value={content}
                onChange={(e) => { setContent(e.target.value); setSaved(false); }}
                inputProps={{ maxLength: 10000 }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={save} disabled={saving || saved} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}>
                  {saving ? t('Saving…') : saved ? t('Saved') : t('Save changes')}
                </Button>
                <Button variant="text" onClick={() => navigator.clipboard?.writeText(content)} sx={{ color: COLORS.textSecondary }}>
                  {t('Copy')}
                </Button>
                <Button variant="text" onClick={() => navigate('/settings?tab=documents')} sx={{ color: COLORS.primary }}>
                  {t('My documents')}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProseDocumentEditor;
