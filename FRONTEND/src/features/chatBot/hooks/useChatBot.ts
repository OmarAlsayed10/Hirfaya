import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../hooks/useAuth";
import { useFeedback } from "../../../context/FeedbackContext";
import { hasPaidAccess } from "../../../utils/proAccess";
import { CHATBOT_ENDPOINTS } from "../../../constants/endpoints";
export const useChatBot = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(null);
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    const { user } = useAuth();
    const isPro = hasPaidAccess(user);
    const { notify, showEntitlement } = useFeedback();

    useEffect(() => {
        if (!open || !isPro) return;

        const createChat = async () => {
            try {
                const res = await axios.post(
                    CHATBOT_ENDPOINTS.create,
                    { messages: [] },
                    { withCredentials: true }
                );
                setChatId(res.data.id);
                setErrorMessage('');
            } catch (err: any) {
                const code = err.response?.data?.code;
                if (code === "AUTH_REQUIRED" || code === "PRO_REQUIRED") {
                    setOpen(false);
                    showEntitlement("PRO_REQUIRED");
                } else if (code === "CREDITS_EXHAUSTED") {
                    setOpen(false);
                    showEntitlement("CREDITS_EXHAUSTED");
                } else {
                    notify(err.response?.data?.message || 'Could not start the chat session. Please try again.');
                    console.error('Error creating chat:', err);
                }
            }
        };

        setChatId(null);
        setErrorMessage('');
        createChat();
    }, [isPro, notify, open, showEntitlement]);

    const handleChatButtonClick = () => {
        if (!isPro) {
            showEntitlement("PRO_REQUIRED");
            return;
        }
        
        setOpen(true);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        if (!chatId) {
            setErrorMessage('⚠️ Chat session not ready. Please refresh the page.');
            return;
        }

        setErrorMessage('');

        try {
            const res = await axios.post(
                CHATBOT_ENDPOINTS.send,
                { message: input, chatId },
                { withCredentials: true }
            );

            const userMsg = { type: 'user', text: input };
            const botMsg = { type: 'bot', text: res.data.response };
            setMessages((prev) => [...prev, userMsg, botMsg]);
            setInput('');
            window.dispatchEvent(new Event('quota:refresh'));
        } catch (err: any) {
            console.error('Error sending message:', err);
            const code = err.response?.data?.code;
            if (code === "AUTH_REQUIRED" || code === "PRO_REQUIRED") {
                setOpen(false);
                showEntitlement("PRO_REQUIRED");
            } else if (code === "CREDITS_EXHAUSTED") {
                showEntitlement("CREDITS_EXHAUSTED");
            } else if (err.code === 'ERR_NETWORK') {
                notify('Network error. Please check your internet connection.');
            } else {
                notify(err.response?.data?.message || 'Something went wrong. Please try again later.');
            }
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return {
        messages,
        input,
        setInput,
        open,
        setOpen,
        errorMessage,
        messagesEndRef,
        handleChatButtonClick,
        handleSend,
    };
};
