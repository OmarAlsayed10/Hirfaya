import { Box, Button, Tooltip } from '@mui/material';
import { COLORS } from '../../../../theme/tokens';

interface EntryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const EntryChip = ({ label, active, onClick }: EntryChipProps) => (
  <Tooltip title={label}>
    <Button
      onClick={onClick}
      variant={active ? 'contained' : 'outlined'}
      size="small"
      sx={{
        borderRadius: 20,
        textTransform: 'none',
        px: 2,
        py: 0.5,
        flexShrink: 0,
        maxWidth: 180,
        minWidth: 0,
        bgcolor: active ? COLORS.primary : 'transparent',
        color: active ? COLORS.onAccent : COLORS.textSecondary,
        borderColor: active ? COLORS.primary : COLORS.borderMedium,
        '&:hover': {
          bgcolor: active ? COLORS.primaryDark : COLORS.primaryAlpha12,
          borderColor: COLORS.primary,
        },
      }}
    >
      <Box
        component="span"
        sx={{ display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {label}
      </Box>
    </Button>
  </Tooltip>
);

export default EntryChip;
