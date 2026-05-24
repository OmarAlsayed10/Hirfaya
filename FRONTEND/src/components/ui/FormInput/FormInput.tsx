import { Box, Typography, TextField } from '@mui/material';
import { FormInputProps } from './FormInput.types';
import formInput from './formInput.tokens';

const FormInput = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  required,
  icon: Icon,
  multiline,
  minRows,
}: FormInputProps) => {
  return (
    <Box sx={formInput.wrapper}>
      <Typography variant="subtitle1" sx={formInput.label}>
        {label} {required && '*'}
      </Typography>

      <Box sx={formInput.row}>
        {Icon && (
          <Box sx={multiline ? formInput.iconWrapperMultiline : formInput.iconWrapper}>
            <Icon sx={formInput.icon} />
          </Box>
        )}
        <TextField
          fullWidth
          variant={multiline ? 'outlined' : 'standard'}
          name={name}
          value={value || ''}
          onChange={onChange}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          required={required}
          multiline={multiline}
          minRows={minRows}
          InputProps={!multiline ? { disableUnderline: true } : undefined}
          sx={multiline ? formInput.fieldMultiline : formInput.fieldStandard}
        />
      </Box>
    </Box>
  );
};

export default FormInput;
