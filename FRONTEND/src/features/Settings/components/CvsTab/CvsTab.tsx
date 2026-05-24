import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateFormData } from '../../../../redux/store/slices/cvBuilderSlice';
import { CV_ENDPOINTS } from '../../../../constants/endpoints';
import cvsTab from './cvsTab.tokens';
import type { CV } from './CvsTab.types';

const EMPTY_CV = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    professionalTitle: '',
    ProfessionalSummary: '',
  },
  experience: [],
  education: [],
  skills: { skills: [], languages: '', certifications: '' },
};

const CvsTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cvs, setCvs] = useState<CV[]>([]);

  useEffect(() => {
    axios
      .get(CV_ENDPOINTS.userCvs, { withCredentials: true })
      .then((r) => setCvs(r.data))
      .catch(() => {});
  }, []);

  return (
    <Box>
      <Typography sx={cvsTab.sectionTitle}>{t('My CVs')}</Typography>
      <Grid container spacing={2}>
        {cvs.map((cv) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cv._id}>
            <Card variant="outlined" sx={cvsTab.card}>
              <CardActionArea
                onClick={() => {
                  dispatch(updateFormData(cv));
                  navigate('/builder');
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={cvsTab.cardPreview}>
                    <DescriptionIcon color="primary" />
                  </Box>
                  <Typography fontSize={13} fontWeight={600} noWrap>
                    {cv.title}
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
                dispatch(updateFormData(EMPTY_CV));
                navigate('/builder');
              }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={cvsTab.newCvContent}>
                <AddIcon color="action" sx={{ mb: 1 }} />
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
