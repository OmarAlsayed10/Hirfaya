import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
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
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import { useEffect, useState } from 'react';
import education from './education.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { EducationFormData } from './Education.types';
import { COLORS } from '../../../../theme/tokens';

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
  const dispatch = useDispatch();
  const educations = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.education || [],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const { control, watch, setValue } = useForm<EducationFormData>({
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
    setActiveIndex(fields.length);
  };

  const removeEducation = (index: number) => {
    remove(index);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, fields.length - 2)));
  };

  return (
    <Box sx={{ ...education.root, maxWidth: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={education.sectionTitle}>
          {t('Education')}
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addEducation} sx={education.addButton}>
          {t('Add Education')}
        </Button>
      </Stack>

      <Box sx={education.entriesBox}>
        {fields.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1, pt: 0.5, '::-webkit-scrollbar': { height: 6 } }}>
            {fields.map((field, index) => {
              const item = watch(`education.${index}`);
              const label = item?.institution || `${t('Education')} ${index + 1}`;
              return (
                <Button
                  key={field.id}
                  onClick={() => setActiveIndex(index)}
                  variant={activeIndex === index ? 'contained' : 'outlined'}
                  size="small"
                  sx={{
                    borderRadius: 20,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    px: 2,
                    py: 0.5,
                    bgcolor: activeIndex === index ? COLORS.primary : 'transparent',
                    color: activeIndex === index ? '#fff' : COLORS.textSecondary,
                    borderColor: activeIndex === index ? COLORS.primary : COLORS.borderMedium,
                    '&:hover': {
                      bgcolor: activeIndex === index ? COLORS.primaryDark : COLORS.primaryAlpha12,
                      borderColor: COLORS.primary,
                    }
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Stack>
        )}

        {fields.map((field, index) => {
          if (index !== activeIndex) return null;
          return (
            <Box key={field.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={education.itemTitle}>
                  {t('Education')} {index + 1}
                </Typography>
                <IconButton onClick={() => removeEducation(index)} sx={education.deleteButton}>
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
                   <FormInput
                     {...f}
                     label={t('Description (Optional)')}
                     labelAction={
                       <AIEditInput
                         section="education"
                         currentContent={f.value || ''}
                         context={{
                           institution: watch(`education.${index}.institution`),
                           degree: watch(`education.${index}.degree`),
                         }}
                         onResult={(text) => setValue(`education.${index}.description`, text, { shouldDirty: true })}
                       />
                     }
                     placeholder={t('Describe your education experience here...')}
                     error={!!error}
                     helperText={error ? t(error.message ?? '') : ''}
                     multiline
                     minRows={3}
                     formatting={{
                       onValueChange: (text) => setValue(`education.${index}.description`, text, { shouldDirty: true }),
                     }}
                   />
                 )}
               />
            </Box>
          );
        })}

        {fields.length === 0 && (
          <Typography sx={education.emptyText}>
            {t('No educations added yet')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Education;
