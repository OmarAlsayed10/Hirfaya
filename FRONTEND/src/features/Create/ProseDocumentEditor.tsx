import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, Grid, Alert, CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { DOCUMENT_ENDPOINTS } from '../../constants/endpoints';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../theme/tokens';

type DocType = 'cover-letter' | 'linkedin-bio';

interface SavedDocument {
  id: string;
  type: DocType;
  title: string;
  content: string;
}

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

const isDocType = (value: unknown): value is DocType =>
  value === 'cover-letter' || value === 'linkedin-bio';

const errMsg = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const ProseDocumentEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [params] = useSearchParams();
  const requestedType = params.get('type');
  const [type, setType] = useState<DocType>(isDocType(requestedType) ? requestedType : 'cover-letter');
  const isEditing = Boolean(documentId);
  const meta = LABELS[type];
  const isCoverLetter = type === 'cover-letter';

  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    let active = true;
    const loadDocument = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get<{ document: SavedDocument }>(
          DOCUMENT_ENDPOINTS.get(documentId),
          { withCredentials: true },
        );
        const document = data.document;
        if (!isDocType(document?.type)) throw new Error('Invalid document type');
        if (!active) return;
        setDocId(document.id);
        setType(document.type);
        setTitle(document.title);
        setContent(document.content);
        setSaved(true);
      } catch (e) {
        if (active) setError(errMsg(e, 'Could not load this document. Please try again.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDocument();
    return () => {
      active = false;
    };
  }, [documentId]);

  const generate = async () => {
    setError('');
    setGenerating(true);
    try {
      const { data } = await axios.post(
        DOCUMENT_ENDPOINTS.generate,
        { type, targetRole: role, targetCompany: company, targetJobDescription: jobDescription },
        { withCredentials: true },
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

  const updateTitle = (value: string) => {
    setTitle(value);
    setSaved(false);
  };

  const updateContent = (value: string) => {
    setContent(value);
    setSaved(false);
  };

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}`, bgcolor: COLORS.bgWhite, p: { xs: 3, md: 4 } }}>
          <Typography sx={{ fontFamily: TYPOGRAPHY.fontSerif, fontSize: '1.6rem', color: COLORS.textPrimary, mb: 0.5 }}>
            {t(isEditing ? 'Edit {{documentType}}' : meta.heading, { documentType: t(meta.heading) })}
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, mb: 3 }}>
            {t(isEditing ? 'Update your saved document, then save your changes.' : meta.blurb)}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: RADIUS.md }}>
              {t(error)}
              {isEditing && !loading && (
                <Button
                  size="small"
                  onClick={() => navigate('/settings?tab=documents')}
                  sx={{ mt: 1, color: COLORS.primary }}
                >
                  {t('Back to My documents')}
                </Button>
              )}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Box>
          ) : (
            <>
              {!isEditing && isCoverLetter && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth size="small" label={t('Target role')} placeholder={t('Frontend Developer')} value={role} onChange={(e) => setRole(e.target.value)} inputProps={{ maxLength: 100 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth size="small" label={t('Company (optional)')} value={company} onChange={(e) => setCompany(e.target.value)} inputProps={{ maxLength: 100 }} />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      size="small"
                      label={t('Job description (optional, but recommended)')}
                      placeholder={t('Paste the job posting text here for a letter tailored to this specific role')}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      inputProps={{ maxLength: 4000 }}
                    />
                  </Grid>
                </Grid>
              )}

              {!isEditing && (
                <Button
                  variant="contained"
                  startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                  onClick={generate}
                  disabled={generating || (isCoverLetter && !role.trim())}
                  sx={{ bgcolor: COLORS.primarySurface, '&:hover': { bgcolor: COLORS.primarySurfaceDark }, mb: 3 }}
                >
                  {content ? t('Regenerate') : t('Generate')}
                </Button>
              )}

              {docId && (
                <>
                  <TextField fullWidth size="small" label={t('Title')} value={title} onChange={(e) => updateTitle(e.target.value)} inputProps={{ maxLength: 150 }} sx={{ mb: 2 }} />
                  <TextField
                    fullWidth multiline minRows={10} label={t('Content')}
                    value={content}
                    onChange={(e) => updateContent(e.target.value)}
                    inputProps={{ maxLength: 10000 }}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={save} disabled={saving || saved} sx={{ bgcolor: COLORS.primarySurface, '&:hover': { bgcolor: COLORS.primarySurfaceDark } }}>
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
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProseDocumentEditor;
