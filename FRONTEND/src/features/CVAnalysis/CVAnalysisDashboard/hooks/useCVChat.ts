import { useState } from 'react';
import axios from 'axios';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export function useCVChat(cvText: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (question?: string) => {
    const q = (question ?? input).trim();
    if (!q || !cvText || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await axios.post(
        AI_ENDPOINTS.cvChat,
        { cvText, question: q },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, input, loading, setInput, send };
}
