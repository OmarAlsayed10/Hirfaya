import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import chatWindow from './chatWindow.tokens';
import type { ChatWindowProps, ChatMessage } from './ChatWindow.types';
import { COLORS } from '../../../../theme/tokens';

export const ChatWindow = ({
  open,
  messages,
  input,
  setInput,
  handleSend,
  setOpen,
  errorMessage,
  messagesEndRef,
}: ChatWindowProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <Paper elevation={0} sx={chatWindow.paper}>
      <Box sx={chatWindow.header}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src="/Images/bot.jpg" sx={{ width: 30, height: 30, mr: 1 }} />
          <Typography fontWeight="bold" sx={chatWindow.headerTitle}>ChatBot</Typography>
        </Box>
        <Button onClick={() => setOpen(false)} sx={chatWindow.closeButton}>
          <CloseIcon />
        </Button>
      </Box>

      <Box sx={chatWindow.messagesArea}>
        {messages.map((msg: ChatMessage, index: number) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 1.5,
            }}
          >
            {msg.type === 'bot' && (
              <Avatar src="/Images/bot.jpg" sx={{ width: 30, height: 30, mr: 1, alignSelf: 'flex-end' }} />
            )}

            <Paper
              elevation={0}
              sx={msg.type === 'user' ? chatWindow.userBubble : chatWindow.botBubble}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
            </Paper>
            <div ref={messagesEndRef} />
          </Box>
        ))}
      </Box>

      <Box sx={chatWindow.inputArea}>
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {errorMessage}{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: COLORS.primary, cursor: 'pointer', fontWeight: 500 }}
            >
              Login
            </span>
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !errorMessage && handleSend()}
            size="small"
            sx={chatWindow.textField}
          />
          <Button
            disabled={!!errorMessage}
            variant="contained"
            onClick={handleSend}
            sx={chatWindow.sendButton}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
