import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import grammarCheckHeader from './grammarCheckHeader.tokens';

export const GrammarCheckHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={grammarCheckHeader.root}>
      <Button
        variant="text"
        onClick={() => navigate('/getStart')}
        startIcon={<ArrowBackIcon />}
        sx={grammarCheckHeader.backButton}
      >
        {t('backToStart')}
      </Button>

      <Typography variant="h2" sx={grammarCheckHeader.title}>
        {t('grammarCheckerTitle')}
      </Typography>

      <Typography sx={grammarCheckHeader.subtitle}>
        {t('grammarCheckerSubtitle')}
      </Typography>
    </Box>
  );
};
