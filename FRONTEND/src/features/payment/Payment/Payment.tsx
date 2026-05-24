import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePayment } from '../hooks/usePayment';
import { CreditCardForm } from '../components/CreditCardForm';
import { PlanSummaryCards } from '../components/PlanSummaryCards';
import payment from './payment.tokens';

const Payment = () => {
  const {
    form,
    errors,
    loading,
    dialogOpen,
    errorSnackbarOpen,
    errorMessage,
    handleChange,
    handleSubmit,
    handleDialogClose,
    handleErrorSnackbarClose,
  } = usePayment();

  const { t } = useTranslation();

  return (
    <Box sx={payment.root}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={payment.paper}>
          <Box sx={payment.formSection}>
            <Typography variant="h4" gutterBottom sx={payment.formTitle}>
              {t('Upgrade to Pro')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
              {t('payment text')}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <CreditCardForm
                  form={form}
                  errors={errors}
                  handleChange={handleChange}
                  loading={loading}
                />
              </Grid>
            </form>
          </Box>

          <PlanSummaryCards />
        </Paper>
      </Container>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{t('Payment Successful')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{t('payment success message')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            color="secondary"
            variant="contained"
            fullWidth
          >
            {t('Continue to Home')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payment;
