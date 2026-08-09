import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useTranslation } from 'react-i18next';
import confirmDialog from './confirmDialog.tokens';
import type { ConfirmDialogProps } from './ConfirmDialog.types';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      slotProps={{ paper: { sx: confirmDialog.paper } }}
    >
      <Box sx={confirmDialog.header}>
        <Box sx={confirmDialog.iconCircle(destructive)}>
          {destructive ? <WarningAmberRoundedIcon /> : <HelpOutlineRoundedIcon />}
        </Box>
        <Typography sx={confirmDialog.title}>{title}</Typography>
      </Box>

      <DialogContent sx={confirmDialog.content}>
        <Typography component="div" sx={confirmDialog.message}>{message}</Typography>
      </DialogContent>

      <DialogActions sx={confirmDialog.actions}>
        <Button onClick={onClose} disabled={loading} sx={confirmDialog.cancelButton}>
          {cancelLabel || t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={confirmDialog.confirmButton(destructive)}
        >
          {confirmLabel || t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
