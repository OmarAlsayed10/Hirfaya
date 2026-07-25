import { IconButton, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { useTranslation } from 'react-i18next';

interface UndoButtonProps {
  onUndo: () => void;
  disabled: boolean;
}

const UndoButton = ({ onUndo, disabled }: UndoButtonProps) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('Undo last change')}>
      <span>
        <IconButton onClick={onUndo} disabled={disabled} size="small" sx={{ color: '#2a5c45' }}>
          <UndoIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default UndoButton;
