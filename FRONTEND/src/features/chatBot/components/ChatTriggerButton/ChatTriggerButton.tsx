import { Box, Fab, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import chatTriggerButton from './chatTriggerButton.tokens';
import type { ChatTriggerButtonProps } from './ChatTriggerButton.types';

export const ChatTriggerButton = ({ open, onClick }: ChatTriggerButtonProps) => {
  return (
    <Tooltip title="Open Chat Assistant" arrow>
      <Box sx={chatTriggerButton.root(open)}>
        <Fab color="primary" onClick={onClick}>
          <SmartToyIcon />
        </Fab>
      </Box>
    </Tooltip>
  );
};
