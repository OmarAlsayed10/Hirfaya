import { useChatBot } from '../hooks/useChatBot';
import { ChatTriggerButton } from '../components/ChatTriggerButton';
import { ChatWindow } from '../components/ChatWindow';

const ChatBot = () => {
  const {
    messages,
    input,
    setInput,
    open,
    setOpen,
    errorMessage,
    messagesEndRef,
    handleChatButtonClick,
    handleSend,
  } = useChatBot();

  return (
    <>
      <ChatTriggerButton open={open} onClick={handleChatButtonClick} />
      <ChatWindow
        open={open}
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        setOpen={setOpen}
        errorMessage={errorMessage}
        messagesEndRef={messagesEndRef}
      />
    </>
  );
};

export default ChatBot;
