import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormInput from '../../../../components/ui/FormInput';
import { COLORS } from '../../../../theme/tokens';

// Common headings people actually add, so the usual case is one click rather than typing.
const SUGGESTIONS = [
  'Courses',
  'Internships',
  'Volunteering',
  'Awards',
  'Publications',
  'Conferences',
  'Memberships',
  'References',
];

export interface AddSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export const AddSectionDialog = ({ open, onClose, onCreate }: AddSectionDialogProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  const create = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('Add a section')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, mb: 1.5 }}>
          {t('Pick a common one or name your own.')}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {SUGGESTIONS.map((suggestion) => (
            <Chip
              key={suggestion}
              label={t(suggestion)}
              onClick={() => create(suggestion)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        <FormInput
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') create(title);
          }}
          label={t('Section Heading')}
          placeholder={t('Courses')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>{t('Cancel')}</Button>
        <Button variant="contained" onClick={() => create(title)} disabled={!title.trim()} sx={{ textTransform: 'none' }}>
          {t('Add Section')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSectionDialog;
