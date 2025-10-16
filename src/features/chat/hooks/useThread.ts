/**
 * Hook for managing a single thread
 * Updated to use the centralized thread service
 */

import { useState, useEffect, useCallback } from 'react';
import { DBThread, DBMessage } from '../types/database';
import { getThreadById, addMessageToThread, updateThread as updateThreadService } from '../services';

export function useThread(threadId: string | null) {
  const [thread, setThread] = useState<DBThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch thread by ID - now using thread service function
  const fetchThread = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getThreadById(id);
      setThread(data as unknown as DBThread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch thread');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add messages to thread - now using thread service function
  const addMessages = useCallback(async (id: string, messages: DBMessage[]) => {
    try {
      // Add each message individually
      for (const message of messages) {
        const data = await addMessageToThread(id, message);
        setThread(data as unknown as DBThread);
      }
      return thread;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add messages');
      return null;
    }
  }, [thread]);

  // Update thread metadata - now using thread service function
  const updateThread = useCallback(async (id: string, updates: Partial<DBThread>) => {
    try {
      const data = await updateThreadService(id, updates);
      setThread(data as unknown as DBThread);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update thread');
      return null;
    }
  }, []);

  // Load thread when ID changes
  useEffect(() => {
    if (threadId) {
      fetchThread(threadId);
    } else {
      setThread(null);
    }
  }, [threadId, fetchThread]);

  return {
    thread,
    loading,
    error,
    fetchThread,
    addMessages,
    updateThread,
  };
}

