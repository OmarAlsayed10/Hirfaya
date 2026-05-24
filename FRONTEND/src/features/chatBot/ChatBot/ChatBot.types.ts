export interface ChatBotProps {}

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}
