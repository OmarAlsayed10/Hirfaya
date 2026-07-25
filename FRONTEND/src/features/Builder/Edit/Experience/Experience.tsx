import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../../../components/ui/FormInput';
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import UndoButton from '../../../../components/ui/UndoButton/UndoButton';
import { useEffect, useState } from 'react';
import experience from './experience.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { Control, UseFormSetValue } from 'react-hook-form';
import type { ExperienceFormData } from './Experience.types';
import { COLORS } from '../../../../theme/tokens';
import { useFieldUndo } from '../../../../hooks/useFieldUndo';
import { useTranslation as useTranslationType } from 'react-i18next';

interface ExperienceDescriptionFieldProps {
  control: Control<ExperienceFormData>;
  index: number;
  rowId: string;
  setValue: UseFormSetValue<ExperienceFormData>;
  jobTitle?: string;
  company?: string;
  t: ReturnType<typeof useTranslationType>['t'];
}

const ExperienceDescriptionField = ({
  control,
  index,
  rowId,
  setValue,
  jobTitle,
  company,
  t,
}: ExperienceDescriptionFieldProps) => {
  const descUndo = useFieldUndo<string>(`experience.${rowId}.description`, (v) =>
    setValue(`experience.${index}.description`, v, { shouldDirty: true }),
  );

  return (
    <Controller
      name={`experience.${index}.description`}
      control={control}
      render={({ field: f, fieldState: { error } }) => (
        <FormInput
          {...f}
          onChange={(e) => {
            descUndo.onTypingChange(f.value || '');
            f.onChange(e);
          }}
          onBlur={() => {
            descUndo.commitTyping();
            f.onBlur();
          }}
          label={t('Description')}
          labelAction={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <UndoButton disabled={!descUndo.canUndo} onUndo={descUndo.undo} />
              <AIEditInput
                section="experience"
                currentContent={f.value || ''}
                context={{ jobTitle, company }}
                onResult={(text) => {
                  descUndo.pushChange(f.value || '');
                  setValue(`experience.${index}.description`, text, { shouldDirty: true });
                }}
              />
            </Stack>
          }
          placeholder={t('Jot down rough notes — e.g. "built react dashboard, cut load time 40%" — then hit the AI icon')}
          error={!!error}
          helperText={error ? t(error.message ?? '') : ''}
          multiline
          minRows={4}
          formatting={{
            onValueChange: (text) => {
              descUndo.pushChange(f.value || '');
              setValue(`experience.${index}.description`, text, { shouldDirty: true });
            },
          }}
        />
      )}
    />
  );
};

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
  const dispatch = useDispatch();
  const experiences = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.experience || [],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const { control, watch, setValue } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experience: JSON.parse(JSON.stringify(experiences)) },
    mode: 'onChange',
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'experience' });

  useEffect(() => {
    const subscription = watch((value) => {
      const clonedData = value.experience ? JSON.parse(JSON.stringify(value.experience)) : [];
      dispatch(updateSection({ section: 'experience', data: clonedData }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const addExperience = () => {
    append({ jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' });
    setActiveIndex(fields.length);
  };

  const removeExperience = (index: number) => {
    remove(index);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, fields.length - 2)));
  };

  const moveExperience = (offset: number) => {
    const destination = activeIndex + offset;
    if (destination < 0 || destination >= fields.length) return;
    move(activeIndex, destination);
    setActiveIndex(destination);
  };

  return (
    <Box sx={{ ...experience.root, maxWidth: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={experience.sectionTitle}>
          {t('Work Experience')}
        </Typography>

        <Button variant="outlined" startIcon={<AddIcon />} onClick={addExperience} sx={experience.addButton}>
          {t('Add Experience')}
        </Button>
      </Stack>

      <Box sx={experience.entriesBox}>
        {fields.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1, pt: 0.5, '::-webkit-scrollbar': { height: 6 } }}>
            {fields.map((field, index) => {
              const item = watch(`experience.${index}`);
              const label = item?.jobTitle || `${t('Experience')} ${index + 1}`;
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
                <Typography variant="h6" sx={experience.itemTitle}>
                  {t('Experience')} {index + 1}
                </Typography>
                <Stack direction="row" spacing={0.25}>
                  <Tooltip title={t('Move up')}>
                    <span>
                      <IconButton onClick={() => moveExperience(-1)} disabled={index === 0} size="small">
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('Move down')}>
                    <span>
                      <IconButton onClick={() => moveExperience(1)} disabled={index === fields.length - 1} size="small">
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <IconButton onClick={() => removeExperience(index)} sx={experience.deleteButton} aria-label={t('Delete experience')}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
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

              <ExperienceDescriptionField
                control={control}
                index={index}
                rowId={field.id}
                setValue={setValue}
                jobTitle={watch(`experience.${index}.jobTitle`)}
                company={watch(`experience.${index}.company`)}
                t={t}
              />
            </Box>
          );
        })}

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
