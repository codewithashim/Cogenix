import ChatInput from '../messages/ChatInput';

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export default function ChatInputArea({ onSendMessage, onStop, isLoading }: ChatInputAreaProps) {
  return (
    <div className="dark:border-gray-800 bg-white dark:bg-[#212121] sticky bottom-0">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <ChatInput
          onSendMessage={onSendMessage}
          onStop={onStop}
          disabled={isLoading}
          placeholder={isLoading ? 'Cognix is thinking...' : 'Message Cognix...'}
        />
      </div>
    </div>
  );
}
