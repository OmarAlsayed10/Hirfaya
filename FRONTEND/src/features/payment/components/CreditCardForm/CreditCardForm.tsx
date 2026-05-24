import { Grid, TextField, InputAdornment, Button, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslation } from 'react-i18next';
import creditCardForm from './creditCardForm.tokens';
import type { CreditCardFormProps } from './CreditCardForm.types';

export const CreditCardForm = ({ form, errors, handleChange, loading }: CreditCardFormProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid size={12}>
        <TextField
          required
          label={t('Cardholder Name')}
          name="name"
          fullWidth
          value={form.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          sx={creditCardForm.textField}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          required
          label={t('Card Number')}
          name="cardNumber"
          fullWidth
          inputProps={{ maxLength: 16 }}
          value={form.cardNumber}
          onChange={handleChange}
          error={!!errors.cardNumber}
          helperText={errors.cardNumber}
          sx={creditCardForm.textField}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          required
          label={t('Expiry Date (MM/YY)')}
          name="expiry"
          fullWidth
          placeholder="08/29"
          value={form.expiry}
          onChange={handleChange}
          error={!!errors.expiry}
          helperText={errors.expiry}
          sx={creditCardForm.textField}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          required
          label="CVV"
          name="cvv"
          fullWidth
          inputProps={{ maxLength: 4 }}
          value={form.cvv}
          onChange={handleChange}
          error={!!errors.cvv}
          helperText={errors.cvv}
          sx={creditCardForm.textField}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          required
          label={t('Billing Address')}
          name="address"
          fullWidth
          value={form.address}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon />
              </InputAdornment>
            ),
          }}
          error={!!errors.address}
          helperText={errors.address}
          sx={creditCardForm.textField}
        />
      </Grid>
      <Grid size={12}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={creditCardForm.submitButton}
        >
          {loading ? (
            <CircularProgress size={26} color="inherit" />
          ) : (
            t('Pay $9.99 and Upgrade')
          )}
        </Button>
      </Grid>
    </>
  );
};
