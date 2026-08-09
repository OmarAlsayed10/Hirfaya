import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import type { Control, UseFormSetValue } from 'react-hook-form';
import FormInput from '../../../../components/ui/FormInput';
import UndoButton from '../../../../components/ui/UndoButton/UndoButton';
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import { useFieldUndo } from '../../../../hooks/useFieldUndo';
import { createEmptyCertification, updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import type { CertificationItem } from '../../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../../redux/store/store';
import { EntryChipRow, EntryToolbar } from '../../components/EntryChip';
// Shares the Experience layout tokens — same repeatable-entry shape.
import layout from '../Experience/experience.tokens';

interface CertificationsFormData {
  certifications: CertificationItem[];
}

// Own component so the undo history hook is keyed to the row rather than the list index —
// reordering or deleting a certification would otherwise hand its history to a neighbour.
const CertificationDescriptionField = ({
  control,
  index,
  rowId,
  setValue,
  name,
  issuer,
  t,
}: {
  control: Control<CertificationsFormData>;
  index: number;
  rowId: string;
  setValue: UseFormSetValue<CertificationsFormData>;
  name: string;
  issuer: string;
  t: (key: string) => string;
}) => {
  const descriptionUndo = useFieldUndo<string>(`certifications.${rowId}.description`, (value) =>
    setValue(`certifications.${index}.description`, value, { shouldDirty: true }),
  );

  return (
    <Controller
      name={`certifications.${index}.description`}
      control={control}
      render={({ field: f }) => (
        <FormInput
          {...f}
          onChange={(event) => {
            descriptionUndo.onTypingChange(f.value || '');
            f.onChange(event);
          }}
          onBlur={() => {
            descriptionUndo.commitTyping();
            f.onBlur();
          }}
          label={t('Description (optional)')}
          labelAction={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <UndoButton disabled={!descriptionUndo.canUndo} onUndo={descriptionUndo.undo} />
              <AIEditInput
                section="education"
                currentContent={f.value || ''}
                context={{ institution: issuer, degree: name }}
                onResult={(value) => {
                  descriptionUndo.pushChange(f.value || '');
                  setValue(`certifications.${index}.description`, value, { shouldDirty: true });
                }}
              />
            </Stack>
          }
          placeholder={t('What the course covered — leave empty if the name says it')}
          multiline
          minRows={3}
          formatting={{
            onValueChange: (value) => {
              descriptionUndo.pushChange(f.value || '');
              setValue(`certifications.${index}.description`, value, { shouldDirty: true });
            },
          }}
        />
      )}
    />
  );
};

const Certifications = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const certifications = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.skills?.certifications || [],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const { control, watch, setValue } = useForm<CertificationsFormData>({
    defaultValues: { certifications: JSON.parse(JSON.stringify(certifications)) },
    mode: 'onChange',
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'certifications' });

  useEffect(() => {
    const subscription = watch((value) => {
      const cloned = value.certifications ? JSON.parse(JSON.stringify(value.certifications)) : [];
      dispatch(updateSection({ section: 'skills', data: { certifications: cloned } }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const addCertification = () => {
    append(createEmptyCertification());
    setActiveIndex(fields.length);
  };

  const removeCertification = (index: number) => {
    remove(index);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, fields.length - 2)));
  };

  const moveCertification = (offset: number) => {
    const destination = activeIndex + offset;
    if (destination < 0 || destination >= fields.length) return;
    move(activeIndex, destination);
    setActiveIndex(destination);
  };

  return (
    <Box sx={{ ...layout.root, maxWidth: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={layout.sectionTitle}>
          {t('Certifications')}
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addCertification} sx={layout.addButton}>
          {t('Add Certification')}
        </Button>
      </Stack>

      <Box sx={layout.entriesBox}>
        <EntryChipRow
          labels={fields.map((_, index) => watch(`certifications.${index}.name`) || `${t('Certification')} ${index + 1}`)}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        {fields.map((field, index) => {
          if (index !== activeIndex) return null;
          return (
            <Box key={field.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={layout.itemTitle}>
                  {t('Certification')} {index + 1}
                </Typography>
                <EntryToolbar
                  onMove={moveCertification}
                  onDelete={() => removeCertification(index)}
                  isFirst={index === 0}
                  isLast={index === fields.length - 1}
                  deleteLabel={t('Delete certification')}
                  deleteSx={layout.deleteButton}
                />
              </Box>

              <Box sx={layout.row}>
                <Box sx={layout.halfWidth}>
                  <Controller
                    name={`certifications.${index}.name`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput {...f} label={t('Certification Name')} placeholder={t('AWS Solutions Architect')} />
                    )}
                  />
                </Box>
                <Box sx={layout.halfWidth}>
                  <Controller
                    name={`certifications.${index}.issuer`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput {...f} label={t('Issuing Body')} placeholder={t('Amazon Web Services')} />
                    )}
                  />
                </Box>
              </Box>

              <Box sx={layout.row}>
                <Box sx={layout.halfWidth}>
                  <Controller
                    name={`certifications.${index}.date`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput {...f} label={t('Date')} placeholder={t('Mar 2024')} />
                    )}
                  />
                </Box>
                <Box sx={layout.halfWidth}>
                  <Controller
                    name={`certifications.${index}.url`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput {...f} label={t('Credential URL')} placeholder={t('https://credly.com/badges/...')} />
                    )}
                  />
                </Box>
              </Box>

              <CertificationDescriptionField
                control={control}
                index={index}
                rowId={field.id}
                setValue={setValue}
                name={watch(`certifications.${index}.name`) || ''}
                issuer={watch(`certifications.${index}.issuer`) || ''}
                t={t}
              />
            </Box>
          );
        })}

        {fields.length === 0 && (
          <Typography sx={layout.emptyText}>{t('No certifications added yet')}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Certifications;
