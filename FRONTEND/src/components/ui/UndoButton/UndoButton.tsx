import { IconButton, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { useTranslation } from 'react-i18next';
import { COLORS } from "../../../theme/tokens";

interface UndoButtonProps {
  onUndo: () => void;
  disabled: boolean;
}

const UndoButton = ({ onUndo, disabled }: UndoButtonProps) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('Undo last change')}>
      <span>
        <IconButton onClick={onUndo} disabled={disabled} size="small" sx={{ color: COLORS.primary }}>
          <UndoIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default UndoButton;
