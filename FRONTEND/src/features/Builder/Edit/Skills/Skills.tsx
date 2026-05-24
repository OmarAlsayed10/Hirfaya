import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../../../components/ui/FormInput';
import skillsTokens from './skills.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { SkillsFormData } from './Skills.types';

const skillsSchema = z.object({
  skills: z.array(z.string()),
  languages: z.string().optional(),
  certifications: z.string().optional(),
});

const Skills = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const formDataSkills = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.skills || { skills: [], languages: '', certifications: '' },
  );

  const [input, setInput] = useState('');

  const { control, watch, setValue, getValues } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: JSON.parse(JSON.stringify(formDataSkills)),
    mode: 'onChange',
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const clonedData = value ? JSON.parse(JSON.stringify(value)) : {};
      dispatch(updateSection({ section: 'skills', data: clonedData }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const addSkill = () => {
    const currentSkills = getValues('skills') || [];
    if (input.trim() && !currentSkills.includes(input.trim())) {
      setValue('skills', [...currentSkills, input.trim()]);
      setInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = getValues('skills') || [];
    setValue('skills', currentSkills.filter((s) => s !== skillToRemove));
  };

  const skillsArray = watch('skills') || [];

  return (
    <Box sx={{
      ...skillsTokens.root,
      maxWidth: isMobile ? '90%' : '800px',
      padding: isMobile ? '8px' : '12px',
    }}>
      <Typography
        variant="h5"
        sx={{ ...skillsTokens.sectionTitle, fontSize: isMobile ? '1rem' : '1.1rem' }}
      >
        {t('skills')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormInput
          label={t('addSkills')}
          placeholder={t('placeholderSkills')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addSkill} sx={skillsTokens.addButton}>
          {t('add')}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.85rem', mb: 1, textAlign: 'start' }}>
          {t('yourSkills')}
        </Typography>
        <Box sx={skillsArray.length ? skillsTokens.skillsAreaFilled : skillsTokens.skillsAreaEmpty}>
          {skillsArray.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skillsArray.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => removeSkill(skill)}
                  deleteIcon={<DeleteIcon style={{ fontSize: '0.85rem' }} />}
                  sx={{ fontSize: '0.85rem', '& .MuiChip-deleteIcon': skillsTokens.chipDeleteIcon }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={skillsTokens.emptyText}>
              {t('noSkills')}
            </Typography>
          )}
        </Box>
      </Box>

      <Controller
        name="languages"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormInput {...field} label={t('languages')} placeholder={t('placeholderLanguages')} error={!!error} helperText={error ? t(error.message ?? '') : ''} />
        )}
      />

      <Controller
        name="certifications"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormInput {...field} label={t('certifications')} placeholder={t('placeholderCertifications')} error={!!error} helperText={error ? t(error.message ?? '') : ''} />
        )}
      />
    </Box>
  );
};

export default Skills;
