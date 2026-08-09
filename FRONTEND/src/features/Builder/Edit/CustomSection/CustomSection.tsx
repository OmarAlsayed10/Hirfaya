import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '../../../../components/ui/FormInput';
import UndoButton from '../../../../components/ui/UndoButton/UndoButton';
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import { useFieldUndo } from '../../../../hooks/useFieldUndo';
import { EntryChipRow, EntryToolbar } from '../../components/EntryChip';
import {
  createEmptyCustomSectionItem,
  removeCustomSection,
  renameCustomSection,
  setCustomSectionItems,
} from '../../../../redux/store/slices/cvBuilderSlice';
import type { CustomSectionItem } from '../../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../../redux/store/store';
// Shares the Experience layout tokens — same repeatable-entry shape.
import layout from '../Experience/experience.tokens';

// Writes straight to the store rather than mirroring into react-hook-form: the entries are
// four plain text fields, so a local form layer would only add a sync problem.
const CustomSection = ({ sectionId }: { sectionId: string }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const section = useSelector((state: RootState) =>
    state.cvBuilder.formData.customSections.find((entry) => entry.id === sectionId),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const items = section?.items ?? [];

  const writeItems = (next: CustomSectionItem[]) => {
    dispatch(setCustomSectionItems({ id: sectionId, items: next }));
  };

  const updateField = (index: number, field: keyof CustomSectionItem, value: string) => {
    writeItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    writeItems([...items, createEmptyCustomSectionItem()]);
    setActiveIndex(items.length);
  };

  const removeItem = (index: number) => {
    writeItems(items.filter((_, i) => i !== index));
    setActiveIndex((previous) => Math.max(0, Math.min(previous, items.length - 2)));
  };

  const moveItem = (offset: number) => {
    const destination = activeIndex + offset;
    if (destination < 0 || destination >= items.length) return;
    const next = [...items];
    [next[activeIndex], next[destination]] = [next[destination], next[activeIndex]];
    writeItems(next);
    setActiveIndex(destination);
  };

  const active = items[activeIndex];

  // Hooks must run before the early return, or the order changes when a section is deleted.
  const descriptionUndo = useFieldUndo<string>(`custom.${sectionId}.${activeIndex}.description`, (value) =>
    updateField(activeIndex, 'description', value),
  );

  if (!section) return null;

  return (
    <Box sx={{ ...layout.root, maxWidth: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={layout.sectionTitle}>
          {section.title || t('Custom Section')}
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={layout.addButton}>
          {t('Add Entry')}
        </Button>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <FormInput
          value={section.title}
          onChange={(event) => dispatch(renameCustomSection({ id: sectionId, title: event.target.value }))}
          label={t('Section Heading')}
          placeholder={t('Courses')}
        />
      </Box>

      <Box sx={layout.entriesBox}>
        <EntryChipRow
          labels={items.map((item, index) => item.title || `${t('Entry')} ${index + 1}`)}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        {active && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={layout.itemTitle}>
                {t('Entry')} {activeIndex + 1}
              </Typography>
              <EntryToolbar
                onMove={moveItem}
                onDelete={() => removeItem(activeIndex)}
                isFirst={activeIndex === 0}
                isLast={activeIndex === items.length - 1}
                deleteLabel={t('Delete entry')}
                deleteSx={layout.deleteButton}
              />
            </Box>

            <Box sx={layout.row}>
              <Box sx={layout.halfWidth}>
                <FormInput
                  value={active.title}
                  onChange={(event) => updateField(activeIndex, 'title', event.target.value)}
                  label={t('Title')}
                  placeholder={t('Advanced Safety Management')}
                />
              </Box>
              <Box sx={layout.halfWidth}>
                <FormInput
                  value={active.subtitle}
                  onChange={(event) => updateField(activeIndex, 'subtitle', event.target.value)}
                  label={t('Organisation')}
                  placeholder={t('Cairo University')}
                />
              </Box>
            </Box>

            <Box sx={layout.row}>
              <Box sx={layout.halfWidth}>
                <FormInput
                  value={active.date}
                  onChange={(event) => updateField(activeIndex, 'date', event.target.value)}
                  label={t('Date')}
                  placeholder={t('Mar 2024')}
                />
              </Box>
            </Box>

            <FormInput
              value={active.description}
              onChange={(event) => {
                descriptionUndo.onTypingChange(active.description);
                updateField(activeIndex, 'description', event.target.value);
              }}
              onBlur={descriptionUndo.commitTyping}
              label={t('Description')}
              labelAction={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <UndoButton disabled={!descriptionUndo.canUndo} onUndo={descriptionUndo.undo} />
                  <AIEditInput
                    section="experience"
                    currentContent={active.description}
                    context={{ jobTitle: active.title, company: active.subtitle }}
                    onResult={(value) => {
                      descriptionUndo.pushChange(active.description);
                      updateField(activeIndex, 'description', value);
                    }}
                  />
                </Stack>
              }
              placeholder={t('One bullet per line')}
              multiline
              minRows={4}
              formatting={{
                onValueChange: (value) => {
                  descriptionUndo.pushChange(active.description);
                  updateField(activeIndex, 'description', value);
                },
              }}
            />
          </Box>
        )}

        {items.length === 0 && (
          <Typography sx={layout.emptyText}>{t('No entries added yet')}</Typography>
        )}
      </Box>

      <Button
        color="error"
        onClick={() => dispatch(removeCustomSection(sectionId))}
        sx={{ mt: 2, textTransform: 'none' }}
      >
        {t('Delete this section')}
      </Button>
    </Box>
  );
};

export default CustomSection;
