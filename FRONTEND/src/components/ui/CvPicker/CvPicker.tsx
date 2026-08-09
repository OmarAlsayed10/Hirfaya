import { useEffect, useState } from 'react';
import { Box, CircularProgress, MenuItem, TextField, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';
import { loadCvOptions } from '../../../utils/cvOptions';
import type { CvOption } from '../../../utils/cvOptions';
import { COLORS } from '../../../theme/tokens';

interface CvPickerProps {
  value: string;
  onSelect: (cv: CvOption) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  autoSelectPrimary?: boolean;
}

const CvPicker = ({ value, onSelect, label, helperText, disabled = false, autoSelectPrimary = false }: CvPickerProps) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<CvOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadCvOptions()
      .then((loaded) => {
        if (!active) return;
        setOptions(loaded);
        if (loaded.length === 0) {
          setError(t('No saved CV found. Build one first.'));
          return;
        }
        // Options are primary-first, so the head is the sensible default.
        if (autoSelectPrimary) onSelect(loaded[0]);
      })
      .catch(() => active && setError(t("Couldn't load your CVs. Try again.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, autoSelectPrimary]);

  const noCvs = !loading && options.length === 0;

  return (
    <TextField
      select
      fullWidth
      value={value}
      disabled={disabled || loading || noCvs}
      error={Boolean(error)}
      label={label ?? t('Choose a CV from your profile')}
      helperText={error || helperText}
      onChange={(event) => {
        const picked = options.find((option) => option.id === event.target.value);
        if (picked) onSelect(picked);
      }}
      InputProps={loading ? { startAdornment: <CircularProgress size={16} sx={{ mr: 1 }} /> } : undefined}
    >
      {options.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {option.isPrimary && (
              <Tooltip title={t('Primary CV')}>
                <StarIcon sx={{ fontSize: 16, color: COLORS.accentOrange, flexShrink: 0 }} />
              </Tooltip>
            )}
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {option.title}
            </Box>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CvPicker;
