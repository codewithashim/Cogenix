'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, MemoryContext, ChatSettings } from '../../types';
import { DBMessage } from '../../types/database';
import { useThreads } from '../../hooks/useThreads';
import { useThread } from '../../hooks/useThread';
import MessageBubble from '../messages/MessageBubble';
import ChatInput from '../messages/ChatInput';
import MemoryDisplay from '../messages/MemoryDisplay';
import ModelSelector from '../controls/ModelSelector';
import ThreadSidebar from '../sidebar/ThreadSidebar';
import { useThemeSync } from '../../hooks/useThemeSync';

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

  // Sync theme from context
  useThemeSync(settings, setSettings);

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
        setMessages([]);
        setMemoryContexts([]);
        setTokenStats(undefined);
        previousThreadIdRef.current = null;
        setCurrentThreadId(null);
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
      setSelectedModel(thread.model || 'llama2');
    }
    
    // Update the previous thread ID
    previousThreadIdRef.current = currentThreadId;
  }, [thread, currentThreadId, isLoading, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              content: content,
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

  const handleRegenerateLastMessage = () => {
    if (messages.length < 2) return;

    const lastUserMessageIndex = messages.findLastIndex((m) => m.role === 'user');
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    setMessages((prev) => prev.slice(0, lastUserMessageIndex + 1));
    
    setTimeout(() => handleSendMessage(lastUserMessage.content), 100);
  };

  const handleNewChat = async () => {
    // Clear everything first
    setMessages([]);
    setMemoryContexts([]);
    setTokenStats(undefined);
    // Update the ref to track that we're intentionally clearing
    previousThreadIdRef.current = null;
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
      previousThreadIdRef.current = null;
      setCurrentThreadId(null);
      // Update URL without reload
      window.history.pushState(null, '', '/');
    }
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

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] overflow-hidden">
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
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Header - Show on all devices */}
        <div className="flex bg-white dark:bg-[#212121] border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-3 items-center justify-between sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-[#212121]/80">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
              {thread?.title || 'Cognix'}
            </h1>
            <div className="hidden md:block">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleRegenerateLastMessage}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden lg:inline">Regenerate</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
            {memoryContexts.length > 0 && (
              <MemoryDisplay
                contexts={memoryContexts}
                onClearMemory={handleClearMemory}
              />
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
                <div className="mb-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  What are you working on?
                </h2>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
                  Start a conversation with your AI assistant. Ask questions, brainstorm ideas, or get help with your work.
                </p>
                
                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {[
                    { icon: '💡', title: 'Brainstorm ideas', desc: 'Generate creative solutions' },
                    { icon: '📝', title: 'Write content', desc: 'Draft articles and messages' },
                    { icon: '🔍', title: 'Research topics', desc: 'Get detailed information' },
                    { icon: '🚀', title: 'Plan projects', desc: 'Organize tasks and goals' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.title)}
                      className="group text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white dark:bg-[#2A2A2A]"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#212121] sticky bottom-0">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              onStop={handleStopGeneration}
              disabled={isLoading}
              placeholder={isLoading ? 'Cognix is thinking...' : 'Message Cognix...'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

