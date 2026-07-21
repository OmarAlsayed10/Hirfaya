import { Box, Fab, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useTranslation } from 'react-i18next';
import chatTriggerButton from './chatTriggerButton.tokens';
import type { ChatTriggerButtonProps } from './ChatTriggerButton.types';

export const ChatTriggerButton = ({ open, onClick }: ChatTriggerButtonProps) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('Open Chat Assistant')} arrow>
      <Box sx={chatTriggerButton.root(open)}>
        <Fab color="primary" onClick={onClick}>
          <SmartToyIcon />
        </Fab>
      </Box>
    </Tooltip>
  );
};
