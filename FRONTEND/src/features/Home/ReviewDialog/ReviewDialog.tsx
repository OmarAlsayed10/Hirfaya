import { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../../../context/Auth/AuthContext';
import { displayName } from '../../../utils/displayName';
import { REVIEW_ENDPOINTS } from '../../../constants/endpoints';
import { COLORS } from '../../../theme/tokens';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const ReviewDialog = ({ open, onClose, onSubmitted }: ReviewDialogProps) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const name = user ? displayName(user.firstName, user.lastName) : '';

  const handleSubmit = async () => {
    setError('');
    if (rating < 1) {
      setError(t('Please select a rating.'));
      return;
    }
    if (description.trim().length < 10) {
      setError(t('Review must be at least 10 characters.'));
      return;
    }
    if (description.trim().length > 1000) {
      setError(t('Review must be under 1000 characters.'));
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        REVIEW_ENDPOINTS.create,
        { rating, description: description.trim() },
        { withCredentials: true }
      );
      setSubmitted(true);
      onSubmitted();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('Failed to submit review.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setDescription('');
    setError('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 1,
        },
      }}
    >
      {submitted ? (
        <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 64, color: COLORS.primary, mb: 2 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {t('Thank you for your review!')}
          </Typography>
          <Typography sx={{ color: COLORS.textSecondary, mb: 3 }}>
            {t('Your review has been submitted and is pending approval.')}
          </Typography>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: COLORS.primarySurface,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 4,
              '&:hover': { bgcolor: COLORS.primarySurfaceDark },
            }}
          >
            {t('Close')}
          </Button>
        </Box>
      ) : (
        <>
          <DialogTitle
            sx={{ fontWeight: 700, fontSize: '1.25rem', pb: 0 }}
          >
            {t('Share your experience')}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 0.5 }}
              >
                {t('Reviewing as')}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 1 }}
              >
                {t('Your rating')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    sx={{ p: 0.5 }}
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarIcon
                        sx={{ fontSize: '2rem', color: COLORS.warning }}
                      />
                    ) : (
                      <StarBorderIcon
                        sx={{ fontSize: '2rem', color: COLORS.borderMedium }}
                      />
                    )}
                  </IconButton>
                ))}
              </Box>
            </Box>

            <TextField
              label={t('Your review')}
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText={`${description.length}/1000`}
              inputProps={{ maxLength: 1000 }}
              sx={{ mb: 1 }}
            />

            {error && (
              <Typography sx={{ color: COLORS.danger, fontSize: '0.85rem', mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleClose}
              sx={{
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
              sx={{
                bgcolor: COLORS.primarySurface,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                '&:hover': { bgcolor: COLORS.primarySurfaceDark },
              }}
            >
              {submitting ? t('Submitting...') : t('Submit Review')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ReviewDialog;
