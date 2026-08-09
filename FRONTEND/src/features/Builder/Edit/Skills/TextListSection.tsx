import type { ChangeEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '../../../../components/ui/FormInput';
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import UndoButton from '../../../../components/ui/UndoButton/UndoButton';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useFieldUndo } from '../../../../hooks/useFieldUndo';
import type { RootState } from '../../../../redux/store/store';
import skillsTokens from './skills.tokens';

interface TextListSectionProps {
  field: 'languages';
  titleKey: string;
  placeholderKey: string;
}

const TextListSection = ({ field, titleKey, placeholderKey }: TextListSectionProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const value = useSelector((state: RootState) => state.cvBuilder.formData.skills[field]);
  const professionalTitle = useSelector(
    (state: RootState) => state.cvBuilder.formData.personalInfo.professionalTitle || '',
  );

  const setField = (next: string) => dispatch(updateSection({ section: 'skills', data: { [field]: next } }));
  const undo = useFieldUndo<string>(`skills.${field}`, setField);

  const updateValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(event.target.value);

  return (
    <Box sx={{ ...skillsTokens.root, maxWidth: '100%', padding: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ ...skillsTokens.sectionTitle, fontSize: '1.1rem' }}>
          {t(titleKey)}
        </Typography>
        <UndoButton disabled={!undo.canUndo} onUndo={undo.undo} />
      </Box>
      <FormInput value={value} onChange={updateValue} label={t(titleKey)} placeholder={t(placeholderKey)} />
      <AIEditInput
        section={field}
        currentContent={value || ''}
        context={{ jobTitle: professionalTitle }}
        onResult={(text) => {
          undo.pushChange(value || '');
          setField(text.replace(/^[-•*]\s*/gm, '').split('\n').map((line) => line.trim()).filter(Boolean).join(', '));
        }}
      />
    </Box>
  );
};

export const LanguagesSection = () => (
  <TextListSection field="languages" titleKey="languages" placeholderKey="placeholderLanguages" />
);

export default TextListSection;
