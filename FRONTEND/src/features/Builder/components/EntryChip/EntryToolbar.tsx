import { IconButton, Stack, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';

export interface EntryToolbarProps {
  onMove: (offset: number) => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  deleteLabel: string;
  deleteSx?: object;
}

// Reorder plus delete for one entry in a repeatable list — identical in every builder section.
export const EntryToolbar = ({ onMove, onDelete, isFirst, isLast, deleteLabel, deleteSx }: EntryToolbarProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={0.25}>
      <Tooltip title={t('Move up')}>
        <span>
          <IconButton onClick={() => onMove(-1)} disabled={isFirst} size="small">
            <KeyboardArrowUpIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('Move down')}>
        <span>
          <IconButton onClick={() => onMove(1)} disabled={isLast} size="small">
            <KeyboardArrowDownIcon />
          </IconButton>
        </span>
      </Tooltip>
      <IconButton onClick={onDelete} sx={deleteSx} aria-label={deleteLabel}>
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

export default EntryToolbar;
