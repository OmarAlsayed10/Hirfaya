import { Box, Container, Typography, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../theme/tokens';

interface BuildType {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  template: string;
  to: string;
}

const OPTIONS: BuildType[] = [
  {
    icon: <DescriptionIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
    title: 'CV / Resume',
    subtitle: 'A full, ATS-friendly CV built from your profile.',
    template: 'Jake',
    to: '/builder',
  },
  {
    icon: <MailOutlineIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
    title: 'Cover Letter',
    subtitle: 'A tailored letter generated from your CV for a specific role.',
    template: 'Classic',
    to: '/documents/new?type=cover-letter',
  },
  {
    icon: <LinkedInIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
    title: 'LinkedIn Bio',
    subtitle: 'A polished "About" summary drawn from your experience.',
    template: 'Modern',
    to: '/documents/new?type=linkedin-bio',
  },
];

const BuildTypeChooser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#f5f4ef', minHeight: '100vh', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Typography sx={{ fontFamily: TYPOGRAPHY.fontSerif, fontSize: { xs: '1.8rem', md: '2.2rem' }, textAlign: 'center', color: COLORS.textPrimary, mb: 1 }}>
          {t('What would you like to create?')}
        </Typography>
        <Typography sx={{ textAlign: 'center', color: COLORS.textSecondary, mb: 5 }}>
          {t('Each opens with its recommended template.')}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
          {OPTIONS.map((opt) => (
            <Box
              key={opt.title}
              onClick={() => navigate(opt.to)}
              sx={{
                p: 3, borderRadius: RADIUS.lg, border: `2px solid ${COLORS.borderLight}`,
                bgcolor: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': { borderColor: COLORS.primary, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
              }}
            >
              {opt.icon}
              <Typography sx={{ fontWeight: 700, mt: 1.5, mb: 0.5, color: COLORS.textPrimary }}>
                {t(opt.title)}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, flex: 1 }}>
                {t(opt.subtitle)}
              </Typography>
              <Chip
                label={`${t('Recommended')}: ${opt.template}`}
                size="small"
                sx={{ mt: 2, alignSelf: 'flex-start', bgcolor: COLORS.primaryAlpha12, color: COLORS.primary, fontWeight: 600 }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default BuildTypeChooser;
