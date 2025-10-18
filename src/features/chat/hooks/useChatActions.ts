import { useRef } from 'react';
import { Message, MemoryContext, ChatSettings } from '../types';
import { DBMessage } from '../types/database';

interface UseChatActionsProps {
  currentThreadId: string | null;
  selectedModel: string;
  settings: ChatSettings;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setMemoryContexts: React.Dispatch<React.SetStateAction<MemoryContext[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setCurrentThreadId: (id: string | null) => void;
  updateUrlForThread: (id: string) => void;
  createThread: (title: string, model: string) => Promise<any>;
  addMessagesToThread: (threadId: string, messages: DBMessage[]) => Promise<any>;
}

export function useChatActions({
  currentThreadId,
  selectedModel,
  settings,
  messages,
  setMessages,
  setMemoryContexts,
  setIsLoading,
  isLoading,
  setCurrentThreadId,
  updateUrlForThread,
  createThread,
  addMessagesToThread,
}: UseChatActionsProps) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Capture content for later use in the finally block
    const userContent = content;

    // Set loading state FIRST to prevent useEffect from overwriting messages
    setIsLoading(true);

    // Create thread if doesn't exist
    let threadId = currentThreadId;
    if (!threadId) {
      const newThread = await createThread(userContent.substring(0, 50), selectedModel);
      if (!newThread) {
        console.error('Failed to create thread');
        setIsLoading(false);
        return;
      }
      threadId = newThread._id!;
      setCurrentThreadId(threadId);
      updateUrlForThread(threadId as string);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    let assistantContent = '';

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          stream: settings.streaming,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (settings.streaming && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data:'));

          for (const line of lines) {
            const data = line.replace('data:', '').trim();
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                assistantContent += parsed.content;
                
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }

              if (parsed.context && parsed.context.length > 0) {
                setMemoryContexts(parsed.context);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      } else {
        const data = await response.json();
        assistantContent = data.content;
        
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: assistantContent, isStreaming: false }
              : m
          )
        );

        if (data.context && data.context.length > 0) {
          setMemoryContexts(data.context);
        }
      }

      // Remove streaming indicator
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, isStreaming: false }
            : m
        )
      );

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted by user');
        // Keep whatever content was generated before stopping
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, isStreaming: false }
              : m
          )
        );
      } else {
        console.error('Error sending message:', error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: 'Sorry, I encountered an error processing your request.',
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      
      // Save messages to database after everything completes (including abort)
      if (threadId && assistantContent) {
        try {
          const dbMessages: DBMessage[] = [
            {
              role: 'user',
              content: userContent,
              timestamp: userMessage.timestamp,
            },
            {
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
            },
          ];

          // Use the hook's addMessages function to update thread state
          const result = await addMessagesToThread(threadId, dbMessages);
          if (result) {
            console.log('Messages saved successfully to thread:', threadId);
          }
        } catch (saveError) {
          console.error('Error saving messages to thread:', saveError);
        }
      }
    }
  };

  const handleRegenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'assistant') return;

    // Find the previous user message
    let userMessageIndex = -1;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessageIndex = i;
        break;
      }
    }
    
    if (userMessageIndex === -1) return;
    
    const userMessage = messages[userMessageIndex];
    
    // Remove all messages after the user message (including the assistant message we're regenerating)
    setMessages((prev) => prev.slice(0, userMessageIndex + 1));
    
    // Resend the user message
    setTimeout(() => handleSendMessage(userMessage.content), 100);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      // Mark the last assistant message as no longer streaming
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === prev.length - 1 && m.role === 'assistant'
            ? { ...m, isStreaming: false }
            : m
        )
      );
    }
  };

  const handleClearMemory = async () => {
    try {
      await fetch('/api/memory/clear', {
        method: 'POST',
      });
      setMemoryContexts([]);
    } catch (error) {
      console.error('Error clearing memory:', error);
    }
  };

  return {
    handleSendMessage,
    handleRegenerateMessage,
    handleStopGeneration,
    handleClearMemory,
  };
}
