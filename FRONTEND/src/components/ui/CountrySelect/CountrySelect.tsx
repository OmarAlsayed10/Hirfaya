import { Autocomplete, TextField } from '@mui/material';
import { Country } from 'country-state-city';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const CountrySelect = ({ value, onChange, label, placeholder, size = 'small', fullWidth = true }: Props) => {
  const options = useMemo(() => Country.getAllCountries().map((country) => country.name), []);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const commit = (country: string) => {
    setInputValue(country);
    if (country !== value) onChange(country);
  };

  return (
    <Autocomplete
      freeSolo
      autoHighlight
      fullWidth={fullWidth}
      options={options}
      value={value || null}
      inputValue={inputValue}
      onInputChange={(_, country) => setInputValue(country)}
      onChange={(_, country) => commit(country ?? '')}
      onBlur={() => commit(inputValue)}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} size={size} />
      )}
    />
  );
};

export default CountrySelect;