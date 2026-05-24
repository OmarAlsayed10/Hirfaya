import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Stack,
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
import experience from './experience.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { ExperienceFormData } from './Experience.types';

const experienceSchema = z.object({
  experience: z.array(
    z.object({
      jobTitle: z.string().min(1, 'Job Title is required'),
      company: z.string().min(1, 'Company is required'),
      location: z.string().min(1, 'Location is required'),
      startDate: z.string().min(1, 'Start Date is required'),
      endDate: z.string().min(1, 'End Date is required'),
      description: z.string().optional(),
    }),
  ),
});

const Experience = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const experiences = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.experience || [],
  );

  const { control, watch } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experience: JSON.parse(JSON.stringify(experiences)) },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'experience' });

  useEffect(() => {
    const subscription = watch((value) => {
      const clonedData = value.experience ? JSON.parse(JSON.stringify(value.experience)) : [];
      dispatch(updateSection({ section: 'experience', data: clonedData }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const addExperience = () => {
    append({ jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' });
  };

  return (
    <Box sx={{ ...experience.root, maxWidth: isMobile ? '90%' : '800px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={experience.sectionTitle}>
          {t('Work Experience')}
        </Typography>

        <Button variant="outlined" startIcon={<AddIcon />} onClick={addExperience} sx={experience.addButton}>
          {t('Add Experience')}
        </Button>
      </Stack>

      <Box sx={experience.entriesBox}>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={experience.itemTitle}>
                {t('Experience')} {index + 1}
              </Typography>
              <IconButton onClick={() => remove(index)} sx={experience.deleteButton}>
                <DeleteIcon />
              </IconButton>
            </Box>

            <Box sx={experience.row}>
              <Box sx={experience.halfWidth}>
                <Controller
                  name={`experience.${index}.jobTitle`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Job Title')} placeholder={t('Marketing Manager')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
              <Box sx={experience.halfWidth}>
                <Controller
                  name={`experience.${index}.company`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Company')} placeholder={t('Company Name')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
            </Box>

            <Box sx={experience.row}>
              <Box sx={experience.fullWidth}>
                <Controller
                  name={`experience.${index}.location`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Location')} placeholder={t('New York, NY')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
              <Box sx={experience.halfWidth}>
                <Controller
                  name={`experience.${index}.startDate`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('Start Date')} placeholder={t('Jan 2020')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
              <Box sx={experience.halfWidth}>
                <Controller
                  name={`experience.${index}.endDate`}
                  control={control}
                  render={({ field: f, fieldState: { error } }) => (
                    <FormInput {...f} label={t('End Date')} placeholder={t('Present')} error={!!error} helperText={error ? t(error.message ?? '') : ''} required />
                  )}
                />
              </Box>
            </Box>

            <Controller
              name={`experience.${index}.description`}
              control={control}
              render={({ field: f, fieldState: { error } }) => (
                <FormInput {...f} label={t('Description')} placeholder={t('Describe your responsibilities and achievements...')} error={!!error} helperText={error ? t(error.message ?? '') : ''} multiline minRows={4} />
              )}
            />

            {index < fields.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}

        {fields.length === 0 && (
          <Typography sx={experience.emptyText}>
            {t('No experiences added yet')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Experience;
