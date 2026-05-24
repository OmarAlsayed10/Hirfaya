import { MutableRefObject } from 'react';

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

export interface ChatWindowProps {
  open: boolean;
  messages: ChatMessage[];
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  setOpen: (val: boolean) => void;
  errorMessage: string;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
}
