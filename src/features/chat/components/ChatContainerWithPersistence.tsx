'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, MemoryContext, ChatSettings } from '../types';
import { DBMessage } from '../types/database';
import { useThreads } from '../hooks/useThreads';
import { useThread } from '../hooks/useThread';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import MemoryDisplay from './MemoryDisplay';
import ModelSelector from './ModelSelector';
import SettingsPanel from './SettingsPanel';
import ThreadSidebar from './ThreadSidebar';

interface ChatContainerWithPersistenceProps {
  initialThreadId: string | null;
}

export default function ChatContainerWithPersistence({ initialThreadId }: ChatContainerWithPersistenceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama2');
  const [memoryContexts, setMemoryContexts] = useState<MemoryContext[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(initialThreadId);
  const [settings, setSettings] = useState<ChatSettings>({
    theme: 'system',
    streaming: true,
    showTokenCount: false,
  });
  const [tokenStats, setTokenStats] = useState<{ prompt: number; completion: number; total: number }>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousThreadIdRef = useRef<string | null>(currentThreadId);

  // Thread management hooks
  const { threads, loading: threadsLoading, createThread, deleteThread } = useThreads();
  const { thread, addMessages: addMessagesToThread } = useThread(currentThreadId);

  // Sync currentThreadId with initialThreadId
  useEffect(() => {
    if (initialThreadId && initialThreadId !== currentThreadId) {
      setCurrentThreadId(initialThreadId);
    }
  }, [initialThreadId, currentThreadId]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setCurrentThreadId(null);
        setMessages([]);
        setMemoryContexts([]);
        setTokenStats(undefined);
      } else if (path.startsWith('/chat/')) {
        const threadId = path.split('/chat/')[1];
        if (threadId && threadId !== currentThreadId) {
          setCurrentThreadId(threadId);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentThreadId]);

  // Load thread messages when thread changes
  useEffect(() => {
    const threadIdChanged = previousThreadIdRef.current !== currentThreadId;
    
    if (thread && thread.messages) {
      // Only load messages from DB if:
      // 1. Thread ID changed AND we're not currently loading (switching threads, not creating)
      // 2. OR DB has more messages than local state (messages were saved and need refresh)
      const shouldLoadMessages = 
        (threadIdChanged && !isLoading) || 
        (!isLoading && thread.messages.length > messages.length);
      
      if (shouldLoadMessages) {
        const loadedMessages: Message[] = thread.messages.map((msg: DBMessage, index: number) => ({
          id: `${thread._id}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);
      }
      setSelectedModel(thread.model || 'llama2');
    } else if (!thread && currentThreadId === null) {
      // Only clear messages if we're intentionally going to a new chat (no thread)
      if (threadIdChanged && !isLoading) {
        setMessages([]);
      }
    }
    
    // Update the previous thread ID
    previousThreadIdRef.current = currentThreadId;
  }, [thread, currentThreadId, isLoading, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Set loading state FIRST to prevent useEffect from overwriting messages
    setIsLoading(true);

    // Create thread if doesn't exist
    let threadId = currentThreadId;
    if (!threadId) {
      const newThread = await createThread(content.substring(0, 50), selectedModel);
      if (!newThread) {
        console.error('Failed to create thread');
        setIsLoading(false);
        return;
      }
      threadId = newThread._id!;
      setCurrentThreadId(threadId);
      
      // Update URL without navigation/reload using window.history
      window.history.pushState(null, '', `/chat/${threadId}`);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
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

      let assistantContent = '';

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

      // Save messages to database
      if (threadId && assistantContent) {
        const dbMessages: DBMessage[] = [
          {
            role: 'user',
            content: content,
            timestamp: userMessage.timestamp,
          },
          {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          },
        ];

        await addMessagesToThread(threadId, dbMessages);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
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
    }
  };

  const handleRegenerateLastMessage = () => {
    if (messages.length < 2) return;

    const lastUserMessageIndex = messages.findLastIndex((m) => m.role === 'user');
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    setMessages((prev) => prev.slice(0, lastUserMessageIndex + 1));
    
    setTimeout(() => handleSendMessage(lastUserMessage.content), 100);
  };

  const handleNewChat = async () => {
    setMessages([]);
    setMemoryContexts([]);
    setTokenStats(undefined);
    setCurrentThreadId(null);
    // Update URL without reload
    window.history.pushState(null, '', '/');
  };

  const handleSelectThread = (threadId: string) => {
    if (threadId === currentThreadId) return; // Already on this thread
    setCurrentThreadId(threadId);
    // Update URL without reload
    window.history.pushState(null, '', `/chat/${threadId}`);
  };

  const handleDeleteThread = async (threadId: string) => {
    await deleteThread(threadId);
    if (currentThreadId === threadId) {
      // If deleting current thread, go to home
      setMessages([]);
      setMemoryContexts([]);
      setTokenStats(undefined);
      setCurrentThreadId(null);
      // Update URL without reload
      window.history.pushState(null, '', '/');
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ThreadSidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewChat}
        onDeleteThread={handleDeleteThread}
        loading={threadsLoading}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {thread?.title || 'Cognix Chat'}
              </h1>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleRegenerateLastMessage}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 Regenerate
                </button>
              )}
              
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                tokenStats={tokenStats}
              />
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {memoryContexts.length > 0 && (
              <MemoryDisplay
                contexts={memoryContexts}
                onClearMemory={handleClearMemory}
              />
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to Cognix
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Start a conversation with your AI assistant. Your chat history will be saved automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
        />
      </div>
    </div>
  );
}

