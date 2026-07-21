import Button from '@mui/material/Button';
import List from '@mui/material/List';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import {
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { generateContentAction } from '../../../../../redux/store/slices/generateContentSlice';
import { useEffect, useState } from 'react';
import aiWritingAssist from './aiWritingAssist.tokens';
import type { AIWritingAssistDialogProps, AIFormData } from './AIWritingAssist.types';
import type { RootState } from '../../../../../redux/store/store';

const generatedSection = ['Professional Summary', 'Work Experience', 'Skills', 'Education'];
const experienceLevel = ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (6-10 years)'];
const industryOptions = [
  'Software', 'Technology', 'Information Technology', 'Artificial Intelligence',
  'Healthcare', 'Finance', 'Education', 'Retail', 'E-commerce', 'Construction', 'Media',
];

function AIWritingAssistDialog({ onClose, selectedValue, open }: AIWritingAssistDialogProps) {
  const [formData, setFormData] = useState<AIFormData>({
    jobTitle: '',
    sectionName: 'Professional Summary',
    industry: '',
    experience: 'Entry Level (0-2 years)',
  });

  const [contentVisible, setContentVisible] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const dispatch = useDispatch<ReturnType<typeof useDispatch>>();
  const { t } = useTranslation();
  const contentGenerated = useSelector((state: RootState) => state.generateContent.generateContent);
  const loading = useSelector((state: RootState) => state.generateContent.loading);

  useEffect(() => {
    if (contentGenerated && contentGenerated.trim() !== '') {
      setEditableContent(contentGenerated);
      setContentVisible(true);
    }
  }, [contentGenerated]);

  useEffect(() => {
    setContentVisible(false);
  }, [formData]);

  const handleClose = () => {
    setFormData({ jobTitle: '', sectionName: 'Professional Summary', industry: '', experience: 'Entry Level (0-2 years)' });
    setEditableContent('');
    setContentVisible(false);
    onClose(selectedValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    (dispatch as ReturnType<typeof useDispatch> & ((action: ReturnType<typeof generateContentAction>) => void))(generateContentAction(formData as unknown as Record<string, string>));
    setContentVisible(true);
  };

  const isFormValid = Object.values(formData).every((val) => val.trim() !== '');

  return (
    <Dialog onClose={handleClose} open={open}>
      <Box sx={aiWritingAssist.dialogHeader}>
        <DialogTitle>{t('AI Writing Assistant')}</DialogTitle>
        <CloseIcon sx={aiWritingAssist.closeIcon} onClick={handleClose} />
      </Box>

      <List sx={aiWritingAssist.list}>
        <Box sx={aiWritingAssist.formRow}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 5 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{t('Job Title')}</Typography>
              <TextField
                fullWidth
                placeholder={t('e.g. Frontend Developer')}
                variant="outlined"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{t('Section to Generate')}</Typography>
              <TextField fullWidth select name="sectionName" value={formData.sectionName} onChange={handleChange}>
                {generatedSection.map((option) => (
                  <MenuItem key={option} value={option}>{t(option)}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 5 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{t('Industry')}</Typography>
              <Autocomplete
                freeSolo
                options={industryOptions}
                value={formData.industry}
                onChange={(_event, newValue) => setFormData((prev) => ({ ...prev, industry: newValue || '' }))}
                onInputChange={(_event, newInputValue) => setFormData((prev) => ({ ...prev, industry: newInputValue }))}
                renderInput={(params) => <TextField {...params} label={t('Select or type industry')} variant="outlined" />}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>{t('Experience Level')}</Typography>
              <TextField fullWidth select name="experience" value={formData.experience} onChange={handleChange}>
                {experienceLevel.map((option) => (
                  <MenuItem key={option} value={option}>{t(option)}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </Box>

        <Button
          disabled={!isFormValid || loading}
          onClick={handleGenerate}
          sx={aiWritingAssist.generateButton}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
        >
          {loading ? t('Generating...') : t('Generate Content')}
        </Button>

        {contentVisible && (
          <Box sx={aiWritingAssist.contentArea}>
            <TextField
              sx={{ mb: 2 }}
              multiline
              minRows={4}
              variant="outlined"
              fullWidth
              value={editableContent}
              onChange={(e) => {
                const value = e.target.value;
                setEditableContent(value);
                if (value.trim() === '') setContentVisible(false);
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => navigator.clipboard.writeText(editableContent)}>
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" sx={aiWritingAssist.tipsTitle}>{t('Tips:')}</Typography>
          <ul style={aiWritingAssist.tipsList as React.CSSProperties}>
            <li>{t('Provide a clear job title and industry for better results.')}</li>
            <li style={{ marginTop: '8px', marginBottom: '8px' }}>
              {t('Specify the section you want to generate for more targeted content.')}
            </li>
            <li>{t('Use the experience level to tailor the content to your needs.')}</li>
          </ul>
        </Box>
      </List>
    </Dialog>
  );
}

export default AIWritingAssistDialog;
