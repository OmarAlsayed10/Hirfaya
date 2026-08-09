import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Step,
  StepButton,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { ArrowLeft, CheckCircle2, Download, Plus, LayoutTemplate, Save, ShieldAlert, Sparkles, Upload, Home } from "../../../components/icons/MuiIcons";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AI_ENDPOINTS, BUILDER_ENDPOINTS } from '../../../constants/endpoints';
import { track } from '../../../lib/analytics';
import { addCustomSection, customSectionId, setCurrentCvId, setCvTitle, setPageCount, updateFormData } from '../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../redux/store/store';
import { cvFormToPdfProps } from '../../../templates/pdf/cvFormToPdfProps';
import { useTemplate } from '../../../hooks/useTemplate';
import { FormWorkspace } from '../components/FormWorkspace';
import { LivePreviewPane } from '../components/LivePreviewPane';
import ConversationalBuilder from '../components/ConversationalBuilder/ConversationalBuilder';
import ChooseTemplate from '../sidebar/components/ChooseTemplate';
import AddSectionDialog from '../components/AddSectionDialog/AddSectionDialog';
import { useSkillAutoExtract } from '../hooks/useSkillAutoExtract';
import { runCvChecks } from '../cvChecks';
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
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checksAnchor, setChecksAnchor] = useState<HTMLElement | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const sectionOrder = useSelector((state: RootState) => state.cvBuilder.sectionOrder);
  const currentCvId = useSelector((state: RootState) => state.cvBuilder.currentCvId);
  const title = useSelector((state: RootState) => state.cvBuilder.title);
  const fontScale = useSelector((state: RootState) => state.cvBuilder.fontScale);
  const pageCount = useSelector((state: RootState) => state.cvBuilder.pageCount);
  const { choosenTemp } = useTemplate();
  const { t } = useTranslation();
  const steps = sectionOrder.map((section) => {
    const customId = customSectionId(section);
    if (!customId) return sectionLabels[section as keyof typeof sectionLabels];
    const custom = formData.customSections.find((entry) => entry.id === customId);
    return custom?.title || t('New Section');
  });
  const navigate = useNavigate();
  const location = useLocation();
  const analyzedFile = (location.state as { analyzedFile?: File } | null)?.analyzedFile;
  const importedAnalysisFileRef = useRef<File | null>(null);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  useSkillAutoExtract();

  const flashNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 3000);
  };

  const importCV = useCallback(async (file?: File) => {
    if (!file) return;
    setImporting(true);
    const upload = new FormData();
    upload.append('cv', file);
    try {
      const response = await axios.post(AI_ENDPOINTS.importCv, upload, { withCredentials: true });
      dispatch(updateFormData(response.data.formData));
      setWorkspaceKey((k) => k + 1);
      setChatOpen(true);
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      flashNotice('error', message || t('We could not import that CV. Please use a PDF or Word file.'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [dispatch, t]);

  useEffect(() => {
    if (!analyzedFile || importedAnalysisFileRef.current === analyzedFile) return;

    importedAnalysisFileRef.current = analyzedFile;
    void importCV(analyzedFile);
  }, [analyzedFile, importCV]);

  const saveCV = async () => {
    setSaving(true);
    const resolvedTitle = title.trim() || formData.personalInfo.professionalTitle.trim();
    const payload = { ...formData, title: resolvedTitle, template: choosenTemp, sectionOrder, fontScale };
    try {
      if (currentCvId) {
        await axios.put(BUILDER_ENDPOINTS.update(currentCvId), payload, { withCredentials: true });
      } else {
        const response = await axios.post(BUILDER_ENDPOINTS.save, payload, { withCredentials: true });
        const newId = response.data?.cv?.id;
        if (newId) dispatch(setCurrentCvId(newId));
        track('cv_created');
      }
      if (resolvedTitle && !title.trim()) dispatch(setCvTitle(resolvedTitle));
      flashNotice('success', t('CV saved successfully!'));
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      flashNotice('error', message || t('Error saving CV'));
    } finally {
      setSaving(false);
    }
  };

  const pdfProps = useMemo(
    () => ({ ...cvFormToPdfProps(formData), sectionOrder, fontScale }),
    [formData, sectionOrder, fontScale],
  );

  const checks = useMemo(
    () => runCvChecks(formData, sectionOrder, pageCount, fontScale),
    [formData, sectionOrder, pageCount, fontScale],
  );
  const warningCount = checks.filter((check) => check.severity === 'warning').length;

  // The server prints the same template the preview renders, so the download matches what
  // is on screen instead of being a second hand-written implementation of the design.
  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await axios.post(
        BUILDER_ENDPOINTS.exportPdf,
        { formData, sectionOrder, template: choosenTemp, fontScale, name: pdfProps.name },
        { withCredentials: true, responseType: 'blob' },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfProps.name.replace(/\s+/g, '_') || 'My'}_CV.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      // The preview only estimates where pages break; the printed file is the real answer.
      const printedPages = Number(response.headers['x-page-count']);
      if (Number.isFinite(printedPages) && printedPages > 0) dispatch(setPageCount(printedPages));
      track('cv_downloaded');
    } catch {
      flashNotice('error', t('We could not generate the PDF. Please try again.'));
    } finally {
      setDownloading(false);
    }
  };

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
            <Button
              variant="outlined"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
              onClick={saveCV}
              disabled={saving}
              sx={builder.secondaryButton}
            >
              {saving ? t('Saving...') : t('Save to Profile')}
            </Button>
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <Download size={18} />}
              onClick={downloadPdf}
              disabled={downloading}
              sx={builder.primaryButton}
            >
              {downloading ? t('Generating...') : t('Download')}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box sx={builder.nameBar}>
            <TextField
              size="small"
              variant="standard"
              value={title}
              onChange={(event) => dispatch(setCvTitle(event.target.value))}
              placeholder={formData.personalInfo.professionalTitle.trim() || t('Untitled CV')}
              inputProps={{ maxLength: 80, 'aria-label': t('CV name') }}
              sx={builder.nameField}
            />
          </Box>

          <Box sx={builder.stepperBar}>
            <Stepper nonLinear activeStep={activeStep} alternativeLabel sx={builder.stepper}>
              {steps.map((label, index) => (
                <Step key={`${label}-${index}`}>
                  <StepButton onClick={() => setActiveStep(index)}>{t(label)}</StepButton>
                </Step>
              ))}
            </Stepper>
            <Tooltip title={t('Add a section')}>
              <IconButton onClick={() => setAddSectionOpen(true)} sx={{ ml: 1, flexShrink: 0 }}>
                <Plus size={20} />
              </IconButton>
            </Tooltip>
            <Box sx={builder.stepperCompact}>
              <Typography sx={builder.stepperCompactCount}>
                {activeStep + 1}/{steps.length}
              </Typography>
              <Select
                variant="standard"
                disableUnderline
                value={activeStep}
                onChange={(event) => setActiveStep(Number(event.target.value))}
                sx={builder.stepperCompactSelect}
              >
                {steps.map((label, index) => (
                  <MenuItem key={label} value={index}>{t(label)}</MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          <Box sx={builder.mobileSwitch}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mobileView}
              onChange={(_, next) => next && setMobileView(next)}
              sx={builder.mobileSwitchGroup}
            >
              <ToggleButton value="form">{t('Edit Fields')}</ToggleButton>
              <ToggleButton value="preview">{t('Preview')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={builder.contentRow}>
            <Box sx={builder.editorPane(mobileView === 'form')}>
              <FormWorkspace
                key={workspaceKey}
                activeStep={activeStep}
                stepCount={steps.length}
                sectionOrder={sectionOrder}
                onBack={() => setActiveStep((s) => Math.max(0, s - 1))}
                onNext={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
                onFinish={() => setDone(true)}
              />
            </Box>
            <Box sx={builder.previewPane(mobileView === 'preview')}>
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
                <IconButton onClick={saveCV} disabled={saving} sx={builder.dockButton}>
                  {saving ? <CircularProgress size={20} /> : <Save size={22} />}
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('Save')}</Typography>
            </Box>

            <Box sx={builder.dockItem}>
              <Tooltip title={t('CV Suggestions')}>
                <IconButton onClick={(event) => setChecksAnchor(event.currentTarget)} sx={builder.dockButton}>
                  <Badge badgeContent={checks.length} color={warningCount > 0 ? 'error' : 'primary'}>
                    {checks.length === 0 ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
                  </Badge>
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('CV Suggestions')}</Typography>
            </Box>

            <Box sx={builder.dockItem}>
              <Tooltip title={t('Download')}>
                <IconButton onClick={downloadPdf} disabled={downloading} sx={builder.dockButton}>
                  {downloading ? <CircularProgress size={20} /> : <Download size={22} />}
                </IconButton>
              </Tooltip>
              <Typography sx={builder.dockLabel}>{t('Download')}</Typography>
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

          <Popover
            open={Boolean(checksAnchor)}
            anchorEl={checksAnchor}
            onClose={() => setChecksAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            slotProps={{ paper: { sx: { maxWidth: 340, borderRadius: 2 } } }}
          >
            {checks.length === 0 ? (
              <Typography sx={{ p: 2, fontSize: 13 }}>{t('No issues found. Your CV covers the basics.')}</Typography>
            ) : (
              <List dense disablePadding>
                {checks.map((check) => (
                  <ListItemButton
                    key={check.id}
                    onClick={() => {
                      const step = sectionOrder.indexOf(check.section);
                      if (step >= 0) setActiveStep(step);
                      setChecksAnchor(null);
                    }}
                    sx={{ alignItems: 'flex-start', gap: 1 }}
                  >
                    <Box sx={{ mt: '2px', color: check.severity === 'warning' ? 'error.main' : 'text.secondary' }}>
                      <ShieldAlert size={16} />
                    </Box>
                    <ListItemText
                      primary={t(check.message, check.values)}
                      primaryTypographyProps={{ fontSize: 12.5, lineHeight: 1.45 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Popover>

          <AddSectionDialog
            open={addSectionOpen}
            onClose={() => setAddSectionOpen(false)}
            onCreate={(sectionTitle) => {
              dispatch(addCustomSection(sectionTitle));
              setActiveStep(sectionOrder.length);
            }}
          />

          <ConversationalBuilder open={chatOpen} onClose={() => setChatOpen(false)} onUpdate={() => setWorkspaceKey((k) => k + 1)} />
          <ChooseTemplate open={templateOpen} onClose={() => setTemplateOpen(false)} />
        </>
      )}
    </Box>
  );
};

export default Builder;
