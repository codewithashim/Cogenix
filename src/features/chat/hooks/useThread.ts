/**
 * Hook for managing a single thread
 */

import { useState, useEffect, useCallback } from 'react';
import { DBThread, DBMessage } from '../types/database';

export function useThread(threadId: string | null) {
  const [thread, setThread] = useState<DBThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch thread by ID
  const fetchThread = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/threads/${id}`);
      const data = await response.json();

      if (data.success) {
        setThread(data.thread);
      } else {
        setError(data.error || 'Failed to fetch thread');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch thread');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add messages to thread
  const addMessages = useCallback(async (id: string, messages: DBMessage[]) => {
    try {
      const response = await fetch(`/api/threads/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      if (data.success) {
        setThread(data.thread);
        return data.thread;
      } else {
        throw new Error(data.error || 'Failed to add messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add messages');
      return null;
    }
  }, []);

  // Update thread metadata
  const updateThread = useCallback(async (id: string, updates: Partial<DBThread>) => {
    try {
      const response = await fetch(`/api/threads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setThread(data.thread);
        return data.thread;
      } else {
        throw new Error(data.error || 'Failed to update thread');
      }
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

