import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTemplate } from '../../../../../hooks/useTemplate';
import { usePreview } from '../../../../../hooks/usePreview';
import { useAuth } from '../../../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import templateCard from './templateCard.tokens';
import type { TemplateCardProps } from './TemplateCard.types';
import { isProUser } from '../../../../../utils/proAccess';

function TemplateCard({ title, img, disc, pro, onCloseDialog }: TemplateCardProps) {
  const { choosenTemp, setChoosenTemp } = useTemplate();
  const { setGoToPreview } = usePreview();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isPro = isProUser(user);

  const isSelected = choosenTemp === title;

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    setChoosenTemp(title);
    onCloseDialog();
    setGoToPreview(true);
  };

  return (
    <Card sx={templateCard.card(isSelected)}>
      <Box sx={{ position: 'relative' }}>
        <Box sx={templateCard.badgeContainer}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {isSelected ? (
              <CheckCircleOutlineIcon sx={{ mr: 0.5, mt: 0.5, color: 'green' }} />
            ) : (
              <Box />
            )}
          </Typography>
          {pro && (
            <Typography variant="caption" sx={templateCard.proBadge}>
              {t('Pro')}
            </Typography>
          )}
        </Box>

        <CardMedia
          component="img"
          image={img}
          alt="template image"
          sx={templateCard.media}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={templateCard.title}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {disc}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          disabled={!isPro && pro}
          size="small"
          color="primary"
          variant="contained"
          fullWidth
          onClick={handleSelect}
        >
          {t('Select')}
        </Button>
      </CardActions>
    </Card>
  );
}

export default TemplateCard;
