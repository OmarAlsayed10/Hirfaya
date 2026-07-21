import { useEffect, useRef } from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AIFieldButton from '../../components/AIFieldButton/AIFieldButton';
import { SKILL_DICTIONARY } from '../../skillDictionary';
import skillsTokens from './skills.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { SkillsFormData } from './Skills.types';

const skillsSchema = z.object({
  skills: z.array(z.string()),
});

const Skills = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const seededProfileSkills = useRef(false);
  const formDataSkills = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.skills || { skills: [], languages: '', certifications: '' },
  );
  const professionalTitle = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.personalInfo?.professionalTitle || '',
  );

  const { watch, setValue, getValues } = useForm<Pick<SkillsFormData, 'skills'>>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills: [...formDataSkills.skills] },
    mode: 'onChange',
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const clonedData = value ? JSON.parse(JSON.stringify(value)) : {};
      dispatch(updateSection({ section: 'skills', data: clonedData }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  useEffect(() => {
    if (seededProfileSkills.current) return;
    const profileSkills = (user as { skills?: string[] } | null)?.skills;
    if (!Array.isArray(profileSkills) || profileSkills.length === 0) return;
    if ((getValues('skills') || []).length > 0) return;
    seededProfileSkills.current = true;
    setValue('skills', profileSkills);
  }, [user, getValues, setValue]);

  const addAISkills = (text: string) => {
    const current = getValues('skills') || [];
    const suggested = text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const merged = [...current];
    suggested.forEach((s) => { if (!merged.includes(s)) merged.push(s); });
    setValue('skills', merged);
  };

  const skillsArray = watch('skills') || [];

  return (
    <Box sx={{ ...skillsTokens.root, maxWidth: '100%', padding: '12px' }}>
      <Typography variant="h6" sx={{ ...skillsTokens.sectionTitle, fontSize: '1.1rem' }}>
        {t('skills')}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'start' }}>
        {t('Skills you mention in your experience are added automatically — add or remove any freely.')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'start' }}>
            {t('yourSkills')}
          </Typography>
          <AIFieldButton section="skills" jobTitle={professionalTitle} onResult={addAISkills} />
        </Box>
        <Autocomplete
          multiple
          freeSolo
          options={SKILL_DICTIONARY}
          value={skillsArray}
          onChange={(_, value) => setValue('skills', value as string[])}
          renderInput={(params) => (
            <TextField {...params} size="small" placeholder={t('placeholderSkills')} />
          )}
        />
      </Box>
    </Box>
  );
};

export default Skills;
