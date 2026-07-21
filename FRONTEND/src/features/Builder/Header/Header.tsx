import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { useDispatch, useSelector } from 'react-redux';
import { setMyCvs } from '../../../redux/store/slices/cvBuilderSlice';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import UpdateIcon from '@mui/icons-material/Update';
import { BUILDER_ENDPOINTS, CV_ENDPOINTS } from '../../../constants/endpoints';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PdfClassicCV from '../../../templates/pdf/PdfClassicCV';
import header from './header.tokens';
import type { RootState } from '../../../redux/store/store';

const Header = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchUserCVs = async () => {
    try {
      const response = await api.get(CV_ENDPOINTS.userCvs);
      dispatch(setMyCvs(response.data || []));
    } catch (err) {
      console.error('Error fetching CVs:', err);
    }
  };

  const pdfProps = useMemo(() => {
    const personalInfo = formData.personalInfo;
    const name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`;
    const email = personalInfo.email || '';
    const phone = [personalInfo.phoneCode, personalInfo.phone].filter(Boolean).join(' ');
    const location = [personalInfo.town, personalInfo.city, personalInfo.country].filter(Boolean).join(', ');
    const professionalTitle = personalInfo.professionalTitle || '';
    const summary = personalInfo.ProfessionalSummary || '';
    const skills = formData.skills.skills.join(', ');

    const experience = formData.experience.map((exp) => ({
      role: exp.jobTitle || '',
      company: exp.company || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      years: `${exp.startDate || ''} - ${exp.endDate || ''}`,
      location: exp.location || '',
      description: exp.description || '',
    }));

    const education = formData.education.map((edu) => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      startYear: edu.startYear || '',
      endYear: edu.endYear || '',
      location: edu.location || '',
      description: edu.description || '',
    }));

    return { name, email, phone, location, professionalTitle, summary, skills, experience, education };
  }, [formData]);

  const handelSave = async () => {
    try {
      await api.post(BUILDER_ENDPOINTS.save, formData);
      fetchUserCVs();
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: { message: string } } };
      if (axiosErr.response && axiosErr.response.status === 403) {
        setError(axiosErr.response.data.message);
        setTimeout(() => setError(''), 10000);
      } else {
        setError(t('Error saving CV'));
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = async () => {
    if (!(formData as any).id && !(formData as any)._id) {
      setError(t('CV ID is missing.'));
      return;
    }
    try {
      fetchUserCVs();
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data: { message: string } } };
      console.error('Update error:', err);
      if (axiosErr.response && axiosErr.response.status === 403) {
        setError(axiosErr.response.data.message);
        setTimeout(() => setError(''), 10000);
      } else {
        setError(t('Error updating CV'));
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <AppBar position="static" sx={header.appBar}>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          pt: 2,
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 'auto' }}>
          <Typography
            variant="h4"
            onClick={() => navigate('/')}
            component="div"
            sx={{ ...header.title, textAlign: isMobile ? 'center' : 'start' }}
          >
            {t('CV Builder')}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ ...header.subtitle, textAlign: isMobile ? 'center' : 'left' }}
          >
            {t('Create your professional CV with our easy-to-use tools')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'center',
            width: isMobile ? '90%' : 'auto',
            mx: isMobile ? 'auto' : 2,
            mt: isMobile ? 2 : 0,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {(success || error) && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {success && <Alert severity="success" sx={{ whiteSpace: 'nowrap', mr: 2 }}>{t('CV saved successfully!')}</Alert>}
              {error && <Alert severity="error" sx={{ whiteSpace: 'nowrap', mr: 2 }}>{error}</Alert>}
            </Box>
          )}

          {((formData as any).id || (formData as any)._id) && (
            <Button
              onClick={handleEdit}
              startIcon={<UpdateIcon sx={{ marginInlineEnd: 1 }} />}
              fullWidth={isMobile}
              variant="outlined"
              sx={header.updateButton}
            >
              {t('Update')}
            </Button>
          )}

          <Button
            onClick={handelSave}
            startIcon={<SaveIcon sx={{ marginInlineEnd: 1 }} />}
            fullWidth={isMobile}
            variant="outlined"
            sx={header.saveButton}
          >
            {t('Save')}
          </Button>

          <PDFDownloadLink
            document={<PdfClassicCV {...pdfProps} />}
            fileName={`${pdfProps.name.replace(/\s+/g, '_') || 'My'}_CV.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                startIcon={<DownloadIcon sx={{ marginInlineEnd: 1 }} />}
                fullWidth={isMobile}
                variant="contained"
                disabled={loading}
                sx={header.downloadButton}
              >
                {loading ? t('Generating...') : t('Download')}
              </Button>
            )}
          </PDFDownloadLink>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
