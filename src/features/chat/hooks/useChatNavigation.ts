import { useState, useEffect, useRef } from 'react';

interface UseChatNavigationProps {
  initialThreadId: string | null;
}

export function useChatNavigation({ initialThreadId }: UseChatNavigationProps) {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(initialThreadId);

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

  const navigateToThread = (threadId: string) => {
    if (threadId === currentThreadId) return; // Already on this thread
    setCurrentThreadId(threadId);
    // Update URL without reload
    window.history.pushState(null, '', `/chat/${threadId}`);
  };

  const navigateToNewChat = () => {
    setCurrentThreadId(null);
    // Update URL without reload
    window.history.pushState(null, '', '/');
  };

  const updateUrlForThread = (threadId: string) => {
    // Update URL without navigation/reload using window.history
    window.history.pushState(null, '', `/chat/${threadId}`);
  };

  return {
    currentThreadId,
    setCurrentThreadId,
    navigateToThread,
    navigateToNewChat,
    updateUrlForThread,
  };
}
