import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from '@mui/material';
import { ArrowLeft, Download, LayoutTemplate, Save, Sparkles, Upload, Home } from "../../../components/icons/MuiIcons";
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AI_ENDPOINTS, BUILDER_ENDPOINTS } from '../../../constants/endpoints';
import { updateFormData, setPageCount } from '../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../redux/store/store';
import PdfClassicCV from '../../../templates/pdf/PdfClassicCV';
import PdfJakeCV from '../../../templates/pdf/PdfJakeCV';
import PdfHarvardCV from '../../../templates/pdf/PdfHarvardCV';
import { useTemplate } from '../../../hooks/useTemplate';
import { FormWorkspace } from '../components/FormWorkspace';
import { LivePreviewPane } from '../components/LivePreviewPane';
import ConversationalBuilder from '../components/ConversationalBuilder/ConversationalBuilder';
import ChooseTemplate from '../sidebar/components/ChooseTemplate';
import { useSkillAutoExtract } from '../hooks/useSkillAutoExtract';
import builder from './builder.tokens';

const sectionLabels = {
  personal: 'Personal',
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  certifications: 'Certifications',
} as const;

const Builder = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [done, setDone] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const pageCount = useSelector((state: RootState) => state.cvBuilder.pageCount);
  const sectionOrder = useSelector((state: RootState) => state.cvBuilder.sectionOrder);
  const steps = sectionOrder.map((section) => sectionLabels[section]);
  const { choosenTemp } = useTemplate();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workspaceKey, setWorkspaceKey] = useState(0);
  useSkillAutoExtract();

  const handleOptimizeCvLength = async () => {
    setOptimizing(true);
    try {
      const response = await axios.post(
        AI_ENDPOINTS.optimizeCvLength,
        { formData },
        { withCredentials: true }
      );
      dispatch(updateFormData(response.data.formData));
      dispatch(setPageCount(1));
      setWorkspaceKey((k) => k + 1);
      flashNotice('success', t('CV optimized to 1 page successfully!'));
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      flashNotice('error', message || t('Failed to optimize CV length.'));
    } finally {
      setOptimizing(false);
    }
  };

  const flashNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 3000);
  };

  const importCV = async (file?: File) => {
    if (!file) return;
    setImporting(true);
    const upload = new FormData();
    upload.append('cv', file);
    try {
      const response = await axios.post(AI_ENDPOINTS.importCv, upload, { withCredentials: true });
      dispatch(updateFormData(response.data.formData));
      if (typeof response.data.pageCount === 'number') {
        dispatch(setPageCount(response.data.pageCount));
      }
      setWorkspaceKey((k) => k + 1);
      setChatOpen(true);
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      flashNotice('error', message || t('We could not import that CV. Please use a PDF or Word file.'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveCV = async () => {
    try {
      await axios.post(BUILDER_ENDPOINTS.save, formData, { withCredentials: true });
      flashNotice('success', t('CV saved successfully!'));
    } catch {
      flashNotice('error', t('Error saving CV'));
    }
  };

  const pdfProps = useMemo(() => {
    const p = formData.personalInfo;
    return {
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      email: p.email || '',
      phone: [p.phoneCode, p.phone].filter(Boolean).join(' '),
      location: [p.city, p.country].filter(Boolean).join(', '),
      professionalTitle: p.professionalTitle || '',
      linkedin: p.linkedin || '',
      summary: p.ProfessionalSummary || '',
      skills: formData.skills.skills.join(', '),
      languages: formData.skills.languages
        ? formData.skills.languages.split(',').map((l) => ({ name: l.trim() }))
        : [],
      certifications: formData.skills.certifications
        ? formData.skills.certifications.split(',').map((c) => ({ name: c.trim() }))
        : [],
      experience: formData.experience.map((exp) => ({
        role: exp.jobTitle || '',
        company: exp.company || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        years: `${exp.startDate || ''} - ${exp.endDate || ''}`,
        location: exp.location || '',
        description: exp.description || '',
      })),
      education: formData.education.map((edu) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        startYear: edu.startYear || '',
        endYear: edu.endYear || '',
        location: edu.location || '',
        description: edu.description || '',
      })),
      projects: formData.projects.map((proj) => ({
        name: proj.name || '',
        technologies: proj.technologies || '',
        demoUrl: proj.demoUrl || '',
        githubUrl: proj.githubUrl || '',
        description: proj.description || '',
      })),
    };
  }, [formData]);

  const noticeBar = notice && (
    <Box sx={builder.alertBar}>
      <Alert severity={notice.type}>{notice.text}</Alert>
    </Box>
  );

  return (
    <Box sx={builder.root}>
      {noticeBar}

      <Tooltip title={t('Home')}>
        <IconButton onClick={() => navigate('/')} sx={builder.homeButton}>
          <Home size={20} />
        </IconButton>
      </Tooltip>

      {done ? (
        <>
          <Box sx={builder.donePreview}>
            <LivePreviewPane />
          </Box>
          <Box sx={builder.doneBar}>
            <Button startIcon={<ArrowLeft size={18} />} onClick={() => setDone(false)} sx={builder.ghostButton}>
              {t('Back')}
            </Button>
            <PDFDownloadLink
              document={choosenTemp === 'jake-cv' ? <PdfJakeCV {...pdfProps} /> : choosenTemp === 'harvard-cv' ? <PdfHarvardCV {...pdfProps} /> : <PdfClassicCV {...pdfProps} />}
              fileName={`${pdfProps.name.replace(/\s+/g, '_') || 'My'}_CV.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <Button
                  variant="contained"
                  startIcon={<Download size={18} />}
                  disabled={loading}
                  sx={builder.primaryButton}
                >
                  {loading ? t('Generating...') : t('Download')}
                </Button>
              )}
            </PDFDownloadLink>
          </Box>
        </>
      ) : (
        <>
          <Box sx={builder.stepperBar}>
            <Stepper activeStep={activeStep} alternativeLabel sx={builder.stepper}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{t(label)}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {pageCount > 1 && (
            <Box sx={{ px: { xs: 1.5, md: 2.5 }, mt: 1, mb: 0.5 }}>
              <Alert
                severity="info"
                sx={{ borderRadius: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleOptimizeCvLength}
                    disabled={optimizing}
                    startIcon={optimizing ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  >
                    {optimizing ? t('Optimizing...') : t('Shorten to 1 Page')}
                  </Button>
                }
              >
                {t(`Your CV has ${pageCount} pages. You can use AI to optimize it to 1 page.`)}
              </Alert>
            </Box>
          )}

          <Box sx={builder.contentRow}>
            <Box sx={builder.editorPane}>
              <FormWorkspace
                key={workspaceKey}
                activeStep={activeStep}
                stepCount={steps.length}
                sectionOrder={sectionOrder}
                onBack={() => setActiveStep((s) => Math.max(0, s - 1))}
                onNext={() => setActiveStep((s) => s + 1)}
                onFinish={() => setDone(true)}
              />
            </Box>
            <Box sx={builder.previewPane}>
              <LivePreviewPane />
            </Box>
          </Box>

          <Box sx={builder.dock}>
            <Box sx={builder.dockItem}>
              <Tooltip title={t('Choose Template')}>
                <IconButton onClick={() => setTemplateOpen(true)} sx={builder.dockButton}>
                  <LayoutTemplate size={22} />
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('Choose Template')}</Typography>
            </Box>

            <Box sx={builder.dockItem}>
              <Tooltip title={t('Edit with AI')}>
                <IconButton onClick={() => setChatOpen(true)} sx={builder.dockButton}>
                  <Sparkles size={22} />
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('Edit with AI')}</Typography>
            </Box>

            <Box sx={builder.dockItem}>
              <Tooltip title={t('Save')}>
                <IconButton onClick={saveCV} sx={builder.dockButton}>
                  <Save size={22} />
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('Save')}</Typography>
            </Box>

            <Box sx={builder.dockItem}>
              <Tooltip title={t('Upload CV')}>
                <IconButton component="label" sx={builder.dockButton}>
                  {importing ? <CircularProgress size={20} /> : <Upload size={22} />}
                  <input
                    hidden
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => importCV(event.target.files?.[0])}
                  />
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('Upload CV')}</Typography>
            </Box>
          </Box>

          <ConversationalBuilder open={chatOpen} onClose={() => setChatOpen(false)} onUpdate={() => setWorkspaceKey((k) => k + 1)} />
          <ChooseTemplate open={templateOpen} onClose={() => setTemplateOpen(false)} />
        </>
      )}
    </Box>
  );
};

export default Builder;
