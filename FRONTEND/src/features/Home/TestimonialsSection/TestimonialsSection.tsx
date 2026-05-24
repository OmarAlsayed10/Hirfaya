import { Box, Typography, Grid, Chip, Avatar } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';
import { TESTIMONIALS_DATA, STATS_DATA } from '../../../constants/homeData';
import testimonialsSection from './testimonialsSection.tokens';

function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <Box sx={testimonialsSection.root}>
      <Box sx={testimonialsSection.statsRow}>
        <Grid container justifyContent="center" spacing={0}>
          {STATS_DATA.map((stat, i) => (
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
      </Box>

      <Grid
        container
        spacing={0}
        sx={testimonialsSection.grid}
      >
        {TESTIMONIALS_DATA.map((item, i) => (
          <Grid key={i} sx={{ width: '100%' }}>
            <Box sx={testimonialsSection.card}>
              <FormatQuoteIcon sx={testimonialsSection.quoteIcon} />

              <Box sx={{ display: 'flex', gap: 0.3 }}>
                {Array.from({ length: item.rating }).map((_, j) => (
                  <StarIcon key={j} sx={{ color: '#f59e0b', fontSize: '1rem' }} />
                ))}
              </Box>

              <Typography sx={testimonialsSection.quoteText}>
                "{item.text}"
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={testimonialsSection.avatar}>
                  {item.avatar}
                </Avatar>
                <Box>
                  <Typography sx={testimonialsSection.authorName}>
                    {item.name}
                  </Typography>
                  <Typography sx={testimonialsSection.authorRole}>
                    {item.role} · {item.company}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default TestimonialsSection;
