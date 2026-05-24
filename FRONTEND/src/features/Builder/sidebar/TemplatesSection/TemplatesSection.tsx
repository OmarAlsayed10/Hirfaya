import { useState } from 'react';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AIWritingAssistDialog from '../components/AIWritingAssist';
import ChooseTemplateDialog from '../components/ChooseTemplate';
import { Box, Button } from '@mui/material';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import templatesSection from './templatesSection.tokens';

function TemplatesSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const dialogKey = 0;
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPro = user?.role === 'pro user';

  const handleClickOpen = () => {
    if (isPro) {
      setOpen(true);
    } else {
      navigate('/pricing');
    }
  };
  const handleClose = () => setOpen(false);
  const handleClickOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  return (
    <>
      <Box sx={templatesSection.root}>
        <Button
          onClick={handleClickOpen2}
          variant="outlined"
          startIcon={<ViewModuleIcon />}
          sx={templatesSection.templateButton}
        >
          {t('Choose Template')}
        </Button>

        <ChooseTemplateDialog open={open2} onClose={handleClose2} key={dialogKey} />

        <Button
          onClick={handleClickOpen}
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          sx={templatesSection.aiButton}
        >
          {t('AI Writing Assistant')}
        </Button>

        <AIWritingAssistDialog open={open} onClose={handleClose} selectedValue="" />
      </Box>
    </>
  );
}

export default TemplatesSection;
