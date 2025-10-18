import { RefObject } from 'react';
import { Message, MemoryContext } from '../../types';
import MessageBubble from '../messages/MessageBubble';
import MemoryDisplay from '../messages/MemoryDisplay';
import ChatEmptyState from './ChatEmptyState';

interface ChatMessagesAreaProps {
  messages: Message[];
  memoryContexts: MemoryContext[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onClearMemory: () => void;
}

export default function ChatMessagesArea({
  messages,
  memoryContexts,
  messagesEndRef,
  isLoading,
  onSendMessage,
  onRegenerateMessage,
  onClearMemory,
}: ChatMessagesAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
        {memoryContexts.length > 0 && (
          <MemoryDisplay
            contexts={memoryContexts}
            onClearMemory={onClearMemory}
          />
        )}
        
        {messages.length === 0 ? (
          <ChatEmptyState onSendMessage={onSendMessage} />
        ) : (
          <div className="space-y-6 py-4">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onRegenerate={message.role === 'assistant' ? () => onRegenerateMessage(message.id) : undefined}
                isRegenerating={isLoading}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
