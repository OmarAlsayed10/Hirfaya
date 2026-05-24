import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../../../components/ui/FormInput';
import PhoneInput from '../../../../components/ui/PhoneInput';
import LocationInput from '../../../../components/ui/LocationInput';
import { useEffect } from 'react';
import personal from './personal.tokens';
import type { RootState } from '../../../../redux/store/store';
import type { PersonalFormData } from './Personal.types';

const personalSchema = z.object({
  firstName: z.string().min(1, 'First Name is required').regex(/^[؀-ۿa-zA-Z\s]*$/, 'Letters only'),
  lastName: z.string().min(1, 'Last Name is required').regex(/^[؀-ۿa-zA-Z\s]*$/, 'Letters only'),
  professionalTitle: z.string().min(1, 'Professional Title is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phoneCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(7, 'Phone number too short').max(15, 'Phone number too long').regex(/^[0-9]+$/, 'Digits only'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  town: z.string().optional(),
  ProfessionalSummary: z.string().optional(),
});

const Personal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const personalInfo = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.personalInfo || {},
  );

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

  return (
    <Box sx={{ ...personal.root, maxWidth: isMobile ? '90%' : '800px' }}>
      <Typography variant="h3" sx={personal.sectionTitle}>
        {t('Personal Information')}
      </Typography>

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

      <PhoneInput control={control} />

      <LocationInput control={control} watch={watch} setValue={setValue} />

      <Controller
        name="ProfessionalSummary"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormInput
            {...field}
            label={t('Professional Summary')}
            placeholder={t('Write your professional summary here...')}
            error={!!error}
            helperText={error ? t(error.message ?? '') : ''}
            multiline
            minRows={2}
          />
        )}
      />
    </Box>
  );
};

export default Personal;
