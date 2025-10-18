import { useState, useRef, useEffect } from 'react';
import { Message, MemoryContext } from '../types';
import { DBMessage } from '../types/database';

interface UseChatMessagesProps {
  thread: any;
  currentThreadId: string | null;
  isLoading: boolean;
}

export function useChatMessages({ thread, currentThreadId, isLoading }: UseChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memoryContexts, setMemoryContexts] = useState<MemoryContext[]>([]);
  const [tokenStats, setTokenStats] = useState<{ prompt: number; completion: number; total: number }>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousThreadIdRef = useRef<string | null>(currentThreadId);

  // Load thread messages when thread changes
  useEffect(() => {
    const threadIdChanged = previousThreadIdRef.current !== currentThreadId;
    
    // If no thread ID, clear messages (New Chat scenario)
    if (currentThreadId === null) {
      if (messages.length > 0) {
        setMessages([]);
      }
      previousThreadIdRef.current = currentThreadId;
      return;
    }
    
    // If we have a thread with messages
    if (thread && thread.messages) {
      // Load messages from DB if:
      // 1. Thread ID changed (switching threads)
      // 2. OR DB has different number of messages (messages were saved/updated)
      // 3. BUT skip if currently loading a new response
      const shouldLoadMessages = 
        !isLoading && (
          threadIdChanged || 
          thread.messages.length !== messages.length
        );
      
      if (shouldLoadMessages) {
        const loadedMessages: Message[] = thread.messages.map((msg: DBMessage, index: number) => ({
          id: `${thread._id}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);
        console.log(`Loaded ${loadedMessages.length} messages from thread ${currentThreadId}`);
      }
    }
    
    // Update the previous thread ID
    previousThreadIdRef.current = currentThreadId;
  }, [thread, currentThreadId, isLoading, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearMessages = () => {
    setMessages([]);
    setMemoryContexts([]);
    setTokenStats(undefined);
    previousThreadIdRef.current = null;
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(m => 
        m.id === messageId ? { ...m, ...updates } : m
      )
    );
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const removeMessagesAfter = (messageIndex: number) => {
    setMessages(prev => prev.slice(0, messageIndex + 1));
  };

  return {
    messages,
    setMessages,
    memoryContexts,
    setMemoryContexts,
    tokenStats,
    setTokenStats,
    messagesEndRef,
    clearMessages,
    updateMessage,
    addMessage,
    removeMessagesAfter,
  };
}
