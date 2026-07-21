import { useState } from 'react';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ChooseTemplateDialog from '../components/ChooseTemplate';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import templatesSection from './templatesSection.tokens';

function TemplatesSection() {
  const { t } = useTranslation();
  const [open2, setOpen2] = useState(false);
  const dialogKey = 0;
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
      </Box>
    </>
  );
}

export default TemplatesSection;
