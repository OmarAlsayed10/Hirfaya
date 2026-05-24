import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../../../components/ui/FormInput';
import { useEffect } from 'react';
import education from './education.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { EducationFormData } from './Education.types';

const educationSchema = z.object({
  education: z.array(
    z.object({
      institution: z.string().min(1, 'Institution is required').regex(/^[؀-ۿa-zA-Z\s]*$/, 'Letters only'),
      degree: z.string().min(1, 'Degree is required').regex(/^[؀-ۿa-zA-Z\s]*$/, 'Letters only'),
      location: z.string().min(1, 'Location is required'),
      startYear: z.string().min(1, 'Start Year is required'),
      endYear: z.string().min(1, 'End Year is required'),
      description: z.string().optional(),
    }),
  ),
});

const Education = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const educations = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.education || [],
  );

  const { control, watch } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: { education: JSON.parse(JSON.stringify(educations)) },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'education' });

  useEffect(() => {
    const subscription = watch((value) => {
      const clonedData = value.education ? JSON.parse(JSON.stringify(value.education)) : [];
      dispatch(updateSection({ section: 'education', data: clonedData }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const addEducation = () => {
    append({ institution: '', degree: '', location: '', startYear: '', endYear: '', description: '' });
  };

  return (
    <Box sx={{ ...education.root, maxWidth: isMobile ? '90%' : '800px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={education.sectionTitle}>
          {t('Education')}
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addEducation} sx={education.addButton}>
          {t('Add Education')}
        </Button>
      </Stack>

      <Box sx={education.entriesBox}>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={education.itemTitle}>
                {t('Education')} {index + 1}
              </Typography>
              <IconButton onClick={() => remove(index)} sx={education.deleteButton}>
                <DeleteIcon />
              </IconButton>
            </Box>

            <Box sx={education.row}>
              <Box sx={education.halfWidth}>
                <Controller
                  name={`education.${index}.institution`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Institution')} placeholder={t('University Name')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
              <Box sx={education.halfWidth}>
                <Controller
                  name={`education.${index}.degree`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Degree')} placeholder={t("Bachelor's in Computer Science")} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
            </Box>

            <Box sx={education.row}>
              <Box sx={education.halfWidth}>
                <Controller
                  name={`education.${index}.location`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Location')} placeholder={t('New York, NY')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
              <Box sx={education.quarterWidth}>
                <Controller
                  name={`education.${index}.startYear`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Start Year')} placeholder={t('2018')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
              <Box sx={education.quarterWidth}>
                <Controller
                  name={`education.${index}.endYear`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('End Year')} placeholder={t('2022')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
            </Box>

            <Controller
              name={`education.${index}.description`}
              control={control}
              render={({ field: f, fieldState: { error } }) => (
                <FormInput {...f} label={t('Description (Optional)')} placeholder={t('Describe your education experience here...')} error={!!error} helperText={error ? t(error.message ?? '') : ''} multiline minRows={3} />
              )}
            />

            {index < fields.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Education;
