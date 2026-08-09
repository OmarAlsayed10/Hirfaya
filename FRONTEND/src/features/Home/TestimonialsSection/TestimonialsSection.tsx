import { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Chip, Avatar, Skeleton, Button } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { COMMUNITY_ENDPOINTS, REVIEW_ENDPOINTS } from '../../../constants/endpoints';
import { AuthContext } from '../../../context/Auth/AuthContext';
import { useFeedback } from '../../../context/FeedbackContext';
import ReviewDialog from '../ReviewDialog';
import testimonialsSection from './testimonialsSection.tokens';
import { COLORS } from "../../../theme/tokens";

interface CommunityData {
  cvsCreated: number;
  cvsAnalyzed: number;
  averageRating: number | null;
  reviewCount: number;
  countries: number;
  reviews: {
    id: string;
    displayName: string;
    rating: number;
    description: string;
    createdAt: string;
  }[];
}

const METRICS_CACHE_KEY = 'community_metrics_cache';

const readCachedMetrics = (): CommunityData | null => {
  try {
    const raw = localStorage.getItem(METRICS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.cvsCreated === 'number' ? (parsed as CommunityData) : null;
  } catch {
    return null;
  }
};

function TestimonialsSection() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { notify } = useFeedback();
  const [data, setData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // The server cache cannot help when the backend is unreachable, and an empty stats row
  // reads as "this product has no users". The last numbers this browser saw are kept and
  // shown instead — they are public counters that move slowly, so stale is harmless.
  const fetchMetrics = () => {
    setLoading(true);
    axios
      .get(COMMUNITY_ENDPOINTS.metrics, { withCredentials: true })
      .then((res) => {
        setData(res.data);
        try {
          localStorage.setItem(METRICS_CACHE_KEY, JSON.stringify(res.data));
        } catch {
          // Private mode or a full quota — the live fetch already worked.
        }
      })
      .catch(() => setData((current) => current ?? readCachedMetrics()))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleWriteReview = async () => {
    if (!user) {
      notify(t('Please log in to submit a review.'), 'warning');
      return;
    }

    try {
      const res = await axios.get(REVIEW_ENDPOINTS.me, { withCredentials: true });
      const review = res.data?.review;
      if (review?.status === 'PENDING') {
        notify(t('Your review has been submitted and is pending approval.'), 'success');
      } else if (review?.status === 'APPROVED') {
        notify(t('You have already submitted an approved review. Thank you!'), 'info');
      } else {
        setReviewDialogOpen(true);
      }
    } catch {
      setReviewDialogOpen(true);
    }
  };

  const stats = data
    ? [
        { value: data.cvsCreated.toLocaleString(), labelKey: 'CVs Created' },
        { value: data.cvsAnalyzed.toLocaleString(), labelKey: 'CVs Analyzed' },
        {
          value: data.averageRating !== null ? `${data.averageRating}★` : '—',
          labelKey: 'Average Rating',
        },
        { value: data.countries.toString(), labelKey: 'Countries' },
      ]
    : [];

  return (
    <Box sx={testimonialsSection.root}>
      <Box sx={testimonialsSection.statsRow}>
        <Grid container justifyContent="center" spacing={0}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid
                  key={i}
                  sx={{
                    width: { xs: '50%', sm: '25%' },
                    textAlign: 'center',
                    borderRight: {
                      sm: i < 3 ? '1px solid rgba(26,26,24,0.08)' : 'none',
                    },
                    py: { xs: 3, md: 4 },
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={80}
                    height={48}
                    sx={{ mx: 'auto', mb: 0.75 }}
                  />
                  <Skeleton variant="text" width={100} sx={{ mx: 'auto' }} />
                </Grid>
              ))
            : stats.map((stat, i) => (
                <Grid
                  key={i}
                  sx={{
                    width: { xs: '50%', sm: '25%' },
                    textAlign: 'center',
                    borderRight: {
                      sm: i < 3 ? '1px solid rgba(26,26,24,0.08)' : 'none',
                    },
                    py: { xs: 3, md: 4 },
                  }}
                >
                  <Typography sx={testimonialsSection.statValue}>
                    {stat.value}
                  </Typography>
                  <Typography sx={testimonialsSection.statLabel}>
                    {t(stat.labelKey)}
                  </Typography>
                </Grid>
              ))}
        </Grid>
      </Box>

      <Box sx={testimonialsSection.sectionHeader}>
        <Chip
          label={t('What users say')}
          size="small"
          sx={testimonialsSection.chip}
        />
        <Typography variant="h2" sx={testimonialsSection.sectionTitle}>
          {t('Loved by job seekers')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RateReviewIcon />}
          onClick={handleWriteReview}
          sx={{
            mt: 2,
            borderRadius: '24px',
            borderColor: COLORS.textPrimary,
            color: COLORS.textPrimary,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              borderColor: COLORS.borderDark,
              bgcolor: COLORS.bgHover,
            },
          }}
        >
          {t('Write a Review')}
        </Button>
      </Box>

      {loading ? (
        <Grid
          container
          spacing={0}
          sx={testimonialsSection.grid}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} sx={{ width: '100%' }}>
              <Box sx={testimonialsSection.card}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="100%" height={60} />
                <Skeleton variant="circular" width={42} height={42} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : data && data.reviews.length > 0 ? (
        <Grid
          container
          spacing={0}
          sx={testimonialsSection.grid}
        >
          {data.reviews.map((review) => (
            <Grid key={review.id} sx={{ width: '100%' }}>
              <Box sx={testimonialsSection.card}>
                <FormatQuoteIcon sx={testimonialsSection.quoteIcon} />

                <Box sx={{ display: 'flex', gap: 0.3 }}>
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <StarIcon
                      key={j}
                      sx={{ color: COLORS.warning, fontSize: '1rem' }}
                    />
                  ))}
                </Box>

                <Typography sx={testimonialsSection.quoteText}>
                  "{review.description}"
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={testimonialsSection.avatar}>
                    {review.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={testimonialsSection.authorName}>
                      {review.displayName}
                    </Typography>
                    <Typography sx={testimonialsSection.authorRole}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.95rem', mb: 2 }}>
            {t('No reviews yet. Be the first to share your experience!')}
          </Typography>
        </Box>
      )}

      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        onSubmitted={() => {
          fetchMetrics();
        }}
      />
    </Box>
  );
}

export default TestimonialsSection;
