'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, MemoryContext, ChatSettings } from '../../types';
import MessageBubble from '../messages/MessageBubble';
import ChatInput from '../messages/ChatInput';
import MemoryDisplay from '../messages/MemoryDisplay';
import ModelSelector from '../controls/ModelSelector';
import { useThemeSync } from '../../hooks/useThemeSync';

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [memoryContexts, setMemoryContexts] = useState<MemoryContext[]>([]);
  const [settings, setSettings] = useState<ChatSettings>({
    theme: 'system',
    streaming: true,
    showTokenCount: false,
  });
  const [tokenStats, setTokenStats] = useState<{ prompt: number; completion: number; total: number }>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme from context
  useThemeSync(settings, setSettings);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

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

      if (settings.streaming && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

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
                accumulatedContent += parsed.content;
                
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: accumulatedContent }
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
        
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: data.content, isStreaming: false }
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
    }
  };

  const handleRegenerateLastMessage = () => {
    if (messages.length < 2) return;

    // Find the last user message
    const lastUserMessageIndex = messages.findLastIndex((m) => m.role === 'user');
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    // Remove messages after the last user message
    setMessages((prev) => prev.slice(0, lastUserMessageIndex + 1));
    
    // Resend the last user message
    setTimeout(() => handleSendMessage(lastUserMessage.content), 100);
  };

  const handleNewChat = () => {
    setMessages([]);
    setMemoryContexts([]);
    setTokenStats(undefined);
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cognix Chat
            </h1>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              ✨ New Chat
            </button>
            
            {messages.length > 0 && (
              <button
                onClick={handleRegenerateLastMessage}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                🔄 Regenerate
              </button>
            )}
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
                Start a conversation with your AI assistant. Ask questions, get insights, 
                and explore ideas with the power of local language models.
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
        onStop={handleStopGeneration}
        disabled={isLoading}
        placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
      />
    </div>
  );
}

