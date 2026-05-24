import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Divider,
  Slide,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useTranslation } from 'react-i18next';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransitionProps } from '@mui/material/transitions';
import { ProWarningProps } from './ProWarning.types';
import proWarning from './proWarning.tokens';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProWarning = ({ openPaymentDialog, setOpenPaymentDialog }: ProWarningProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigateToPayment = () => {
    setOpenPaymentDialog(false);
    navigate('/payment-check');
  };

  return (
    <Dialog
      open={openPaymentDialog}
      onClose={() => setOpenPaymentDialog(false)}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{ sx: proWarning.paper }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
        <Box sx={proWarning.iconWrapper}>
          <StarRoundedIcon sx={proWarning.icon} />
        </Box>
      </Box>

      <DialogTitle sx={proWarning.title}>{t('Unlock Pro Features')}</DialogTitle>

      <DialogContent sx={proWarning.content}>
        <Typography variant="body1" sx={proWarning.bodyText}>
          {t('pro warning text')}
        </Typography>
      </DialogContent>

      <Divider sx={proWarning.divider} />

      <DialogActions sx={proWarning.actions}>
        <Button
          onClick={() => setOpenPaymentDialog(false)}
          variant="outlined"
          color="inherit"
          sx={proWarning.btnCancel}
        >
          {t('Maybe Later')}
        </Button>
        <Button onClick={handleNavigateToPayment} variant="contained" sx={proWarning.btnUpgrade}>
          {t('Upgrade Now')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProWarning;
