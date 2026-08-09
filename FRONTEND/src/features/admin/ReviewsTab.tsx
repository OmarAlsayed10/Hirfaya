import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ADMIN_ENDPOINTS } from '../../constants/endpoints';
import { useFeedback } from '../../context/FeedbackContext';
import { displayName } from '../../utils/displayName';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { COLORS } from '../../theme/tokens';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface AdminReview {
  id: string;
  displayName: string;
  rating: number;
  description: string;
  status: ReviewStatus;
  createdAt: string;
  reviewedAt: string | null;
  user: { firstName: string; lastName: string; email: string };
}

const STATUS_COLORS: Record<ReviewStatus, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const ReviewsTab = () => {
  const { t } = useTranslation();
  const { notify } = useFeedback();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | ReviewStatus>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const res = await axios.get(ADMIN_ENDPOINTS.allReviews, {
        params,
        withCredentials: true,
      });
      setReviews(res.data.reviews ?? []);
    } catch {
      notify(t('Could not load reviews.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await axios.patch(
        ADMIN_ENDPOINTS.reviewAction(id),
        { action },
        { withCredentials: true }
      );
      notify(
        t(action === 'approve' ? 'Review approved.' : 'Review rejected.'),
        'success'
      );
      load();
    } catch {
      notify(t('Could not process review.'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(ADMIN_ENDPOINTS.deleteReview(deleteTarget.id), {
        withCredentials: true,
      });
      setReviews((current) => current.filter((r) => r.id !== deleteTarget.id));
      notify(t('Review deleted.'), 'success');
    } catch {
      notify(t('Could not delete review.'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={800}>
          {t('Reviews')}
        </Typography>
        <Typography
          color="text.secondary"
          fontSize="0.9rem"
          sx={{ mb: 2 }}
        >
          {t(
            'Manage all user reviews. Approve, reject, or delete them.'
          )}
        </Typography>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v !== null && setFilter(v)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="ALL">{t('All')}</ToggleButton>
          <ToggleButton value="PENDING">{t('Pending')}</ToggleButton>
          <ToggleButton value="APPROVED">{t('Approved')}</ToggleButton>
          <ToggleButton value="REJECTED">{t('Rejected')}</ToggleButton>
        </ToggleButtonGroup>

        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography color="text.secondary">
            {t('No reviews found.')}
          </Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={2}>
            {reviews.map((review) => (
              <Box key={review.id} sx={{ pt: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography fontWeight={800}>
                    {displayName(
                      review.user.firstName,
                      review.user.lastName
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.2 }}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{ color: COLORS.warning, fontSize: '1rem' }}
                      />
                    ))}
                  </Box>
                  <Chip
                    label={t(review.status)}
                    size="small"
                    color={STATUS_COLORS[review.status]}
                    variant="outlined"
                  />
                </Box>
                <Typography
                  color="text.secondary"
                  fontSize="0.84rem"
                  sx={{ mb: 1 }}
                >
                  {new Date(review.createdAt).toLocaleDateString()} ·{' '}
                  {review.user.email}
                  {review.reviewedAt &&
                    ` · ${t('Reviewed')}: ${new Date(review.reviewedAt).toLocaleDateString()}`}
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1.5 }}>
                  {review.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {review.status === 'PENDING' && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAction(review.id, 'approve')}
                      >
                        {t('Approve')}
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleAction(review.id, 'reject')}
                      >
                        {t('Reject')}
                      </Button>
                    </>
                  )}
                  <Button
                    color="error"
                    variant="text"
                    size="small"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteTarget(review)}
                  >
                    {t('Delete')}
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('Delete review')}
        message={t(
          'Are you sure you want to permanently delete this review? This action cannot be undone.'
        )}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default ReviewsTab;
