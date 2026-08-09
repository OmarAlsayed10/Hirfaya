import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { FileText, Plus, Star, Trash2 } from "../../../../components/icons/MuiIcons";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadCv, resetCv } from '../../../../redux/store/slices/cvBuilderSlice';
import { CV_ENDPOINTS } from '../../../../constants/endpoints';
import { COLORS } from '../../../../theme/tokens';
import cvsTab from './cvsTab.tokens';
import type { CV } from './CvsTab.types';
import { useFeedback } from '../../../../context/FeedbackContext';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import IconAction from '../../../../components/ui/IconAction';

const CvsTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notify } = useFeedback();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [pendingDelete, setPendingDelete] = useState<CV | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  useEffect(() => {
    axios
      .get(CV_ENDPOINTS.userCvs, { withCredentials: true })
      .then((r) => setCvs(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const cvKey = (cv: CV) => cv.id ?? cv._id ?? '';

  const makePrimary = async (cv: CV) => {
    if (cv.isPrimary) return;
    const id = cvKey(cv);
    if (!id) return;
    setCvs((prev) => prev.map((c) => ({ ...c, isPrimary: cvKey(c) === id })));
    try {
      await axios.patch(CV_ENDPOINTS.setPrimary(id), {}, { withCredentials: true });
    } catch {
      setCvs((prev) => prev.map((c) => ({ ...c, isPrimary: c.isPrimary && cvKey(c) !== id })));
    }
  };

  const commitRename = async (cv: CV) => {
    const id = cvKey(cv);
    const next = draftTitle.trim();
    setRenamingId(null);
    if (!id || next === (cv.title || '')) return;
    const previous = cv.title;
    setCvs((prev) => prev.map((c) => (cvKey(c) === id ? { ...c, title: next } : c)));
    try {
      await axios.put(CV_ENDPOINTS.update(id), { title: next }, { withCredentials: true });
    } catch {
      setCvs((prev) => prev.map((c) => (cvKey(c) === id ? { ...c, title: previous } : c)));
      notify(t('Could not rename this CV. Please try again.'));
    }
  };

  const remove = async () => {
    const id = pendingDelete ? cvKey(pendingDelete) : '';
    if (!id) return;
    setDeleting(true);
    try {
      await axios.delete(CV_ENDPOINTS.delete(id), { withCredentials: true });
      setCvs((prev) => prev.filter((item) => cvKey(item) !== id));
      notify(t('CV deleted successfully!'), 'success');
      setPendingDelete(null);
    } catch {
      notify(t('Could not delete this CV. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Typography sx={cvsTab.sectionTitle}>{t('My CVs')}</Typography>
      <Grid container spacing={2}>
        {cvs.map((cv) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cvKey(cv)}>
            <Card variant="outlined" sx={{ ...cvsTab.card, position: 'relative' }}>
              <Box sx={cvsTab.cardActions}>
                <IconAction
                  label={t('Rename CV')}
                  onClick={(event) => {
                    event.stopPropagation();
                    setDraftTitle(cv.title || '');
                    setRenamingId(cvKey(cv));
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconAction>
                <IconAction
                  label={t('Delete CV')}
                  tone="danger"
                  onClick={(event) => { event.stopPropagation(); setPendingDelete(cv); }}
                >
                  <Trash2 size={18} />
                </IconAction>
                <IconAction
                  label={cv.isPrimary ? t('Primary CV — used by Job Radar') : t('Set as primary')}
                  tone="favorite"
                  active={cv.isPrimary}
                  onClick={() => makePrimary(cv)}
                >
                  <Star size={18} fill={cv.isPrimary ? 'currentColor' : 'none'} />
                </IconAction>
              </Box>
              <CardActionArea
                component="div"
                onClick={() => {
                  if (renamingId === cvKey(cv)) return;
                  dispatch(loadCv(cv));
                  navigate('/builder');
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={cvsTab.cardPreview}>
                    <FileText size={24} color={COLORS.primary} />
                  </Box>
                  {renamingId === cvKey(cv) ? (
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      variant="standard"
                      value={draftTitle}
                      placeholder={t('Untitled CV')}
                      inputProps={{ maxLength: 80 }}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      onBlur={() => commitRename(cv)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commitRename(cv);
                        if (event.key === 'Escape') setRenamingId(null);
                      }}
                    />
                  ) : (
                    <Typography fontSize={13} fontWeight={600} noWrap>
                      {cv.title || t('Untitled CV')}
                    </Typography>
                  )}
                  <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.5 }}>
                    {new Date(cv.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined" sx={cvsTab.newCvCard}>
            <CardActionArea
              onClick={() => {
                dispatch(resetCv());
                navigate('/builder');
              }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={cvsTab.newCvContent}>
                <Plus size={24} color={COLORS.textSecondary} style={{ marginBottom: 8 }} />
                <Typography fontSize={13} color="text.secondary" fontWeight={500}>
                  {t('New CV')}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('Delete CV')}
        message={t('This permanently deletes "{{title}}". You cannot undo this action.', {
          title: pendingDelete?.title || t('Untitled CV'),
        })}
        loading={deleting}
        onConfirm={remove}
        onClose={() => setPendingDelete(null)}
      />
    </Box>
  );
};

export default CvsTab;
