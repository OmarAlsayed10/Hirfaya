import {
  Box,
  Dialog,
  DialogTitle,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import TemplateCard from '../TemplateCard';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { cvTemplateAction } from '../../../../../redux/store/slices/cvTemplateSlice';
import chooseTemplate from './chooseTemplate.tokens';
import type { ChooseTemplateDialogProps, TemplateItem } from './ChooseTemplate.types';
import type { RootState } from '../../../../../redux/store/store';

function ChooseTemplateDialog({ onClose, open }: ChooseTemplateDialogProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { t } = useTranslation();

  const dispatch = useDispatch<ReturnType<typeof useDispatch>>();
  const templates = useSelector((state: RootState) => state.cvTemplate.cvTemplate);

  useEffect(() => {
    (dispatch as ReturnType<typeof useDispatch> & ((action: ReturnType<typeof cvTemplateAction>) => void))(cvTemplateAction());
  }, []);

  const handleClose = () => onClose();

  return (
    <Dialog onClose={handleClose} open={open}>
      <Box sx={chooseTemplate.dialogHeader}>
        <DialogTitle>{t('Choose Template')}</DialogTitle>
        <CloseIcon sx={chooseTemplate.closeIcon} onClick={handleClose} />
      </Box>
      <Grid container spacing={2} sx={chooseTemplate.grid}>
        {templates.map((template: TemplateItem, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <TemplateCard
              sx={{ minWidth: isMobile ? '100%' : '30%' }}
              title={template.title}
              img={template.img}
              disc={template.disc}
              pro={template.pro}
              onCloseDialog={handleClose}
            />
          </Grid>
        ))}
      </Grid>
    </Dialog>
  );
}

export default ChooseTemplateDialog;
