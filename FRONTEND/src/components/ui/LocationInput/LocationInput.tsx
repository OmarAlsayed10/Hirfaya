import { Box, TextField, Typography, Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Country, City, State } from 'country-state-city';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationInputProps } from './LocationInput.types';
import locationInput from './locationInput.tokens';

const LocationInput = ({ control, watch, setValue }: LocationInputProps) => {
  const { t } = useTranslation();
  const selectedCountryCode = watch('country') as string;

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode })),
    []
  );

  const cityOptions = useMemo(() => {
    if (!selectedCountryCode) return [];
    const cities = City.getCitiesOfCountry(selectedCountryCode) || [];
    if (cities.length > 0) {
      return [...new Set(cities.map((c) => c.name))].map((name) => ({ label: name, value: name }));
    }
    const states = State.getStatesOfCountry(selectedCountryCode) || [];
    return states.map((s) => ({ label: s.name, value: s.name }));
  }, [selectedCountryCode]);

  return (
    <Box sx={locationInput.wrapper}>
      <Typography variant="subtitle1" sx={locationInput.label}>
        {t('Location')}
      </Typography>

      <Box sx={locationInput.fieldRow}>
        <Typography sx={locationInput.sublabel}>{t('Country')}</Typography>
        <Controller
          name="country"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              options={countryOptions}
              value={countryOptions.find((o) => o.value === value) || null}
              onChange={(_, newValue) => {
                onChange(newValue?.value || '');
                setValue('city', '');
              }}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, val) => option.value === val.value}
              size="small"
              sx={locationInput.autocomplete}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('Country (optional)')}
                  error={!!error}
                  helperText={error?.message}
                  size="small"
                />
              )}
            />
          )}
        />
      </Box>

      <Box sx={locationInput.fieldRow}>
        <Typography sx={locationInput.sublabel}>{t('City')}</Typography>
        <Controller
          name="city"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              freeSolo
              options={cityOptions.map((o) => o.label)}
              value={(value as string) || ''}
              inputValue={(value as string) || ''}
              onInputChange={(_, newValue) => onChange(newValue)}
              onChange={(_, newValue) => onChange((newValue as string) || '')}
              size="small"
              sx={locationInput.autocomplete}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('Type your city')}
                  error={!!error}
                  helperText={error?.message}
                  size="small"
                />
              )}
            />
          )}
        />
      </Box>    </Box>
  );
};

export default LocationInput;

