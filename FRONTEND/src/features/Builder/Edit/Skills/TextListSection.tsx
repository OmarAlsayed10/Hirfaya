import type { ChangeEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '../../../../components/ui/FormInput';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import type { RootState } from '../../../../redux/store/store';
import skillsTokens from './skills.tokens';

interface TextListSectionProps {
  field: 'languages' | 'certifications';
  titleKey: string;
  placeholderKey: string;
}

const TextListSection = ({ field, titleKey, placeholderKey }: TextListSectionProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const value = useSelector((state: RootState) => state.cvBuilder.formData.skills[field]);

  const updateValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch(updateSection({ section: 'skills', data: { [field]: event.target.value } }));
  };

  return (
    <Box sx={{ ...skillsTokens.root, maxWidth: '100%', padding: '12px' }}>
      <Typography variant="h6" sx={{ ...skillsTokens.sectionTitle, fontSize: '1.1rem' }}>
        {t(titleKey)}
      </Typography>
      <FormInput value={value} onChange={updateValue} label={t(titleKey)} placeholder={t(placeholderKey)} />
    </Box>
  );
};

export const LanguagesSection = () => (
  <TextListSection field="languages" titleKey="languages" placeholderKey="placeholderLanguages" />
);

export const CertificationsSection = () => (
  <TextListSection field="certifications" titleKey="certifications" placeholderKey="placeholderCertifications" />
);
