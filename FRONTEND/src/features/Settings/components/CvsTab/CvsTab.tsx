import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import { FileText, Plus, Star } from "../../../../components/icons/MuiIcons";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createEmptyBuilderFormData, updateFormData } from '../../../../redux/store/slices/cvBuilderSlice';
import { CV_ENDPOINTS } from '../../../../constants/endpoints';
import { COLORS } from '../../../../theme/tokens';
import cvsTab from './cvsTab.tokens';
import type { CV } from './CvsTab.types';

const CvsTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cvs, setCvs] = useState<CV[]>([]);

  useEffect(() => {
    axios
      .get(CV_ENDPOINTS.userCvs, { withCredentials: true })
      .then((r) => setCvs(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const cvKey = (cv: CV) => cv.id ?? cv._id ?? '';

  const makePrimary = async (cv: CV) => {
    const id = cvKey(cv);
    if (!id) return;
    setCvs((prev) => prev.map((c) => ({ ...c, isPrimary: cvKey(c) === id })));
    try {
      await axios.patch(CV_ENDPOINTS.setPrimary(id), {}, { withCredentials: true });
    } catch {
      setCvs((prev) => prev.map((c) => ({ ...c, isPrimary: c.isPrimary && cvKey(c) !== id })));
    }
  };

  return (
    <Box>
      <Typography sx={cvsTab.sectionTitle}>{t('My CVs')}</Typography>
      <Grid container spacing={2}>
        {cvs.map((cv) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cvKey(cv)}>
            <Card variant="outlined" sx={{ ...cvsTab.card, position: 'relative' }}>
              <Tooltip title={cv.isPrimary ? t('Primary CV — used by Job Radar') : t('Set as primary')}>
                <IconButton
                  size="small"
                  onClick={() => makePrimary(cv)}
                  sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, color: cv.isPrimary ? 'warning.main' : 'action.disabled' }}
                >
                  <Star size={18} fill={cv.isPrimary ? 'currentColor' : 'none'} />
                </IconButton>
              </Tooltip>
              <CardActionArea
                onClick={() => {
                  dispatch(updateFormData(cv));
                  navigate('/builder');
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={cvsTab.cardPreview}>
                    <FileText size={24} color={COLORS.primary} />
                  </Box>
                  <Typography fontSize={13} fontWeight={600} noWrap>
                    {cv.title || t('Untitled CV')}
                  </Typography>
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
                dispatch(updateFormData(createEmptyBuilderFormData()));
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
    </Box>
  );
};

export default CvsTab;
