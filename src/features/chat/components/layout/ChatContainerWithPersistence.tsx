'use client';

import { useState, useEffect } from 'react';
import { ChatSettings } from '../../types';
import { useThreads } from '../../hooks/useThreads';
import { useThread } from '../../hooks/useThread';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useChatNavigation } from '../../hooks/useChatNavigation';
import { useChatActions } from '../../hooks/useChatActions';
import { useThemeSync } from '../../hooks/useThemeSync';
import ThreadSidebar from '../sidebar/ThreadSidebar';
import ChatHeader from './ChatHeader';
import ChatMessagesArea from './ChatMessagesArea';
import ChatInputArea from './ChatInputArea';
import { SettingsModal } from '../../../../components';

interface ChatContainerWithPersistenceProps {
  initialThreadId: string | null;
}

export default function ChatContainerWithPersistence({ initialThreadId }: ChatContainerWithPersistenceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama2');
  const [settings, setSettings] = useState<ChatSettings>({
    theme: 'system',
    streaming: true,
    showTokenCount: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Thread management hooks
  const { threads, loading: threadsLoading, createThread, deleteThread } = useThreads();
  
  // Navigation hook
  const { currentThreadId, setCurrentThreadId, navigateToThread, navigateToNewChat, updateUrlForThread } = useChatNavigation({ initialThreadId });
  
  // Current thread hook
  const { thread: currentThread, addMessages: addMessagesToCurrentThread } = useThread(currentThreadId);

  // Messages hook
  const {
    messages,
    setMessages,
    memoryContexts,
    setMemoryContexts,
    tokenStats,
    setTokenStats,
    messagesEndRef,
    clearMessages,
  } = useChatMessages({
    thread: currentThread,
    currentThreadId,
    isLoading,
  });

  // Chat actions hook
  const {
    handleSendMessage,
    handleRegenerateMessage,
    handleStopGeneration,
    handleClearMemory,
  } = useChatActions({
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
    addMessagesToThread: addMessagesToCurrentThread,
  });

  // Sync theme from context
  useThemeSync(settings, setSettings);

  // Update selected model based on current thread
  useEffect(() => {
    if (currentThread && currentThread.model && selectedModel !== currentThread.model) {
      setSelectedModel(currentThread.model);
    }
  }, [currentThread, selectedModel]);

  // Handler functions for sidebar actions
  const handleNewChat = async () => {
    clearMessages();
    navigateToNewChat();
  };

  const handleSelectThread = (threadId: string) => {
    navigateToThread(threadId);
  };

  const handleDeleteThread = async (threadId: string) => {
    await deleteThread(threadId);
    if (currentThreadId === threadId) {
      clearMessages();
      navigateToNewChat();
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        loading={threadsLoading}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        <ChatHeader
          threadTitle={currentThread?.title}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        <ChatMessagesArea
          messages={messages}
          memoryContexts={memoryContexts}
          messagesEndRef={messagesEndRef}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onRegenerateMessage={handleRegenerateMessage}
          onClearMemory={handleClearMemory}
        />

        <ChatInputArea
          onSendMessage={handleSendMessage}
          onStop={handleStopGeneration}
          isLoading={isLoading}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

