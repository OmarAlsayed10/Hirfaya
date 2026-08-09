import { IconButton, Tooltip } from '@mui/material';
import iconAction from './iconAction.tokens';
import type { IconActionProps } from './IconAction.types';

const IconAction = ({
  label,
  children,
  onClick,
  tone = 'neutral',
  active = false,
  disabled = false,
  size = 'small',
}: IconActionProps) => (
  <Tooltip title={label}>
    <span>
      <IconButton
        aria-label={label}
        size={size}
        disabled={disabled}
        onClick={onClick}
        sx={iconAction.button(tone, active)}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

export default IconAction;
