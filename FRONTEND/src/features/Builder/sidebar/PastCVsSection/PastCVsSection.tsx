import { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { setMyCvs, updateFormData } from '../../../../redux/store/slices/cvBuilderSlice';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { BUILDER_ENDPOINTS } from '../../../../constants/endpoints';
import pastCVsSection from './pastCVsSection.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { CvItem } from './PastCVsSection.types';

const PastCVsSection = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const myCvs = useSelector((state: RootState) => state.cvBuilder?.myCvs || []);

  const fetchUserCVs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/cvbuilder/user', { withCredentials: true });
      dispatch(setMyCvs(response.data || []));
    } catch (err) {
      console.error('Error fetching CVs:', err);
      setError(t('errorFetchingCVs'));
    }
  };

  useEffect(() => {
    fetchUserCVs();
  }, [t]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(BUILDER_ENDPOINTS.delete(id), { withCredentials: true });
      await fetchUserCVs();
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data: string } };
      setError(axiosErr.response ? axiosErr.response.data : t('errorDeletingCV'));
      setSuccess(false);
    }
  };

  const handlePreview = (cv: CvItem) => {
    dispatch(updateFormData(cv));
  };

  return (
    <Box sx={pastCVsSection.root}>
      <Typography variant="body1">{t('myCVs')}</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{t('cvDeletedSuccessfully')}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {myCvs.map((cv: CvItem, index: number) => (
        <Box key={index} sx={pastCVsSection.cvItem} onClick={() => handlePreview(cv)}>
          <Box sx={pastCVsSection.cvItemLeft}>
            <TextSnippetIcon />
            <Typography variant="body1">{cv.personalInfo.professionalTitle}</Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(cv.id || cv._id || '');
            }}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            <DeleteIcon />
          </Button>
        </Box>
      ))}

      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        fullWidth
        onClick={() => {
          dispatch(updateFormData({
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
          }));
        }}
      >
        {t('newCV')}
      </Button>
    </Box>
  );
};

export default PastCVsSection;
