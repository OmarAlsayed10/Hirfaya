import { Box, Typography, Stack, Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../../../components/ui/FormInput';
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import PhoneInput from '../../../../components/ui/PhoneInput';
import LocationInput from '../../../../components/ui/LocationInput';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import personal from './personal.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { PersonalFormData } from './Personal.types';
import { COLORS } from '../../../../theme/tokens';

const personalSchema = z.object({
  firstName: z.string().min(1, 'First Name is required').regex(/^[؀-ۿa-zA-Z\s]*$/, 'Letters only'),
  lastName: z.string().min(1, 'Last Name is required').regex(/^[؀-ۿa-zA-Z\s]*$/, 'Letters only'),
  professionalTitle: z.string().min(1, 'Professional Title is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phoneCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(7, 'Phone number too short').max(15, 'Phone number too long').regex(/^[0-9]+$/, 'Digits only'),
  country: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  ProfessionalSummary: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

const Personal = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { user } = useAuth();
  const personalInfo = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.personalInfo || {},
  );

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'role' | 'summary'>('details');

  const { control, watch, setValue } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: personalInfo,
    mode: 'onChange',
  });

  useEffect(() => {
    const subscription = watch((value) => {
      dispatch(updateSection({ section: 'personalInfo', data: value }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  // Prefill a brand-new CV from the user's saved profile so they don't retype it.
  // Only seeds when the personal section is still empty — never overwrites a loaded CV.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !user) return;
    seeded.current = true;
    const pi = personalInfo as Partial<PersonalFormData>;
    if (pi.firstName || pi.email) return;
    const seed: Partial<PersonalFormData> = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      professionalTitle: user.title || '',
      ProfessionalSummary: user.summary || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      portfolio: user.portfolio || '',
    };
    (Object.entries(seed) as [keyof PersonalFormData, string][]).forEach(
      ([k, v]) => v && setValue(k, v),
    );
    dispatch(updateSection({ section: 'personalInfo', data: seed }));
  }, [user, personalInfo, setValue, dispatch]);

  return (
    <Box sx={{ ...personal.root, maxWidth: '100%' }}>
      <Typography variant="h6" sx={personal.sectionTitle}>
        {t('Personal Information')}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
        <Button
          onClick={() => setActiveSubTab('details')}
          variant={activeSubTab === 'details' ? 'contained' : 'outlined'}
          size="small"
          sx={{
            borderRadius: 20,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            px: 2,
            bgcolor: activeSubTab === 'details' ? COLORS.primary : 'transparent',
            color: activeSubTab === 'details' ? '#fff' : COLORS.textSecondary,
            borderColor: activeSubTab === 'details' ? COLORS.primary : COLORS.borderMedium,
            '&:hover': {
              bgcolor: activeSubTab === 'details' ? COLORS.primaryDark : COLORS.primaryAlpha12,
              borderColor: COLORS.primary,
            }
          }}
        >
          {t('Personal Details')}
        </Button>
        <Button
          onClick={() => setActiveSubTab('role')}
          variant={activeSubTab === 'role' ? 'contained' : 'outlined'}
          size="small"
          sx={{
            borderRadius: 20,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            px: 2,
            bgcolor: activeSubTab === 'role' ? COLORS.primary : 'transparent',
            color: activeSubTab === 'role' ? '#fff' : COLORS.textSecondary,
            borderColor: activeSubTab === 'role' ? COLORS.primary : COLORS.borderMedium,
            '&:hover': {
              bgcolor: activeSubTab === 'role' ? COLORS.primaryDark : COLORS.primaryAlpha12,
              borderColor: COLORS.primary,
            }
          }}
        >
          {t('Role')}
        </Button>
        <Button
          onClick={() => setActiveSubTab('summary')}
          variant={activeSubTab === 'summary' ? 'contained' : 'outlined'}
          size="small"
          sx={{
            borderRadius: 20,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            px: 2,
            bgcolor: activeSubTab === 'summary' ? COLORS.primary : 'transparent',
            color: activeSubTab === 'summary' ? '#fff' : COLORS.textSecondary,
            borderColor: activeSubTab === 'summary' ? COLORS.primary : COLORS.borderMedium,
            '&:hover': {
              bgcolor: activeSubTab === 'summary' ? COLORS.primaryDark : COLORS.primaryAlpha12,
              borderColor: COLORS.primary,
            }
          }}
        >
          {t('Professional Summary')}
        </Button>
      </Stack>

      {activeSubTab === 'details' && (
        <Box>
          <Box sx={personal.row}>
            <Box sx={personal.halfWidth}>
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    label={t('First Name')}
                    placeholder={t('John')}
                    error={!!error}
                    helperText={error ? t(error.message ?? '') : ''}
                    required
                  />
                )}
              />
            </Box>

            <Box sx={personal.halfWidth}>
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    label={t('Last Name')}
                    placeholder={t('Smith')}
                    error={!!error}
                    helperText={error ? t(error.message ?? '') : ''}
                    required
                  />
                )}
              />
            </Box>
          </Box>

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormInput
                {...field}
                label={t('Email')}
                placeholder="john.smith@example.com"
                icon={EmailIcon}
                error={!!error}
                helperText={error ? t(error.message ?? '') : ''}
                required
              />
            )}
          />

          <PhoneInput control={control as any} />

          <LocationInput control={control as any} watch={watch as any} setValue={setValue as any} />

          <Controller
            name="linkedin"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormInput
                {...field}
                label={t('LinkedIn')}
                placeholder="linkedin.com/in/username"
                icon={LinkedInIcon}
                error={!!error}
                helperText={error ? t(error.message ?? '') : ''}
              />
            )}
          />

          <Controller
            name="github"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormInput
                {...field}
                label={t('GitHub (Others)')}
                placeholder="github.com/username"
                icon={GitHubIcon}
                error={!!error}
                helperText={error ? t(error.message ?? '') : ''}
              />
            )}
          />

          <Controller
            name="portfolio"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormInput
                {...field}
                label={t('Portfolio / Website')}
                placeholder="portfolio.com"
                icon={LanguageIcon}
                error={!!error}
                helperText={error ? t(error.message ?? '') : ''}
              />
            )}
          />
        </Box>
      )}

      {activeSubTab === 'role' && (
        <Controller
          name="professionalTitle"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormInput
              {...field}
              label={t('Professional Title')}
              placeholder={t('Marketing Manager')}
              icon={WorkIcon}
              error={!!error}
              helperText={error ? t(error.message ?? '') : ''}
              required
            />
          )}
        />
      )}

      {activeSubTab === 'summary' && (
        <Controller
          name="ProfessionalSummary"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormInput
              {...field}
              label={t('Professional Summary')}
              labelAction={
                <AIEditInput
                  section="summary"
                  currentContent={field.value || ''}
                  context={{
                    jobTitle: watch('professionalTitle'),
                  }}
                  onResult={(text) => setValue('ProfessionalSummary', text, { shouldDirty: true })}
                />
              }
              placeholder={t('Write your professional summary here...')}
              error={!!error}
              helperText={error ? t(error.message ?? '') : ''}
              multiline
              minRows={5}
              formatting={{
                onValueChange: (text) => setValue('ProfessionalSummary', text, { shouldDirty: true }),
              }}
            />
          )}
        />
      )}
    </Box>
  );
};

export default Personal;
