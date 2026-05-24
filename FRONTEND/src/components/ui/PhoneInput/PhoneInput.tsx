import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Country } from 'country-state-city';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneInputProps } from './PhoneInput.types';
import phoneInput from './phoneInput.tokens';

const PhoneInput = ({ control }: PhoneInputProps) => {
  const { t } = useTranslation();

  const phoneOptions = useMemo(
    () =>
      Country.getAllCountries()
        .filter((c) => c.phonecode)
        .map((c) => ({
          label: `${c.name} (+${c.phonecode})`,
          value: `+${c.phonecode}`,
          isoCode: c.isoCode,
        })),
    []
  );

  return (
    <Box sx={phoneInput.wrapper}>
      <Typography variant="subtitle1" sx={phoneInput.label}>
        {t('Phone')} *
      </Typography>
      <Box sx={phoneInput.row}>
        <Box sx={phoneInput.codeBox}>
          <Controller
            name="phoneCode"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Autocomplete
                options={phoneOptions}
                value={phoneOptions.find((o) => o.value === value) || null}
                onChange={(_, newValue) => onChange(newValue?.value || '')}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, val) => option.isoCode === val.isoCode}
                size="small"
                sx={phoneInput.autocomplete}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t('Country code')}
                    error={!!error}
                    helperText={error?.message}
                    size="small"
                  />
                )}
              />
            )}
          />
        </Box>
        <Box sx={phoneInput.numberBox}>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="standard"
                placeholder="01332731222"
                error={!!error}
                helperText={error?.message}
                inputProps={{ inputMode: 'numeric', maxLength: 15 }}
                InputProps={{ disableUnderline: true }}
                sx={phoneInput.textField}
                onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PhoneInput;
