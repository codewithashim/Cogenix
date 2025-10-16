/**
 * Hook for managing chat threads
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DBThread } from '../types/database';

// Fetch threads function
async function fetchThreadsApi(): Promise<DBThread[]> {
  const response = await fetch('/api/threads');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch threads');
  }
  
  return data.threads;
}

// Create thread function
async function createThreadApi(title?: string, model?: string): Promise<DBThread> {
  const response = await fetch('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, model }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to create thread');
  }

  return data.thread;
}

// Delete thread function
async function deleteThreadApi(threadId: string): Promise<void> {
  const response = await fetch(`/api/threads/${threadId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete thread');
  }
}

// Update thread function
async function updateThreadApi(threadId: string, updates: Partial<DBThread>): Promise<DBThread> {
  const response = await fetch(`/api/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to update thread');
  }

  return data.thread;
}

export function useThreads() {
  const queryClient = useQueryClient();

  // Fetch all threads with React Query
  const { data: threads = [], isLoading: loading, error } = useQuery({
    queryKey: ['threads'],
    queryFn: fetchThreadsApi,
  });

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: ({ title, model }: { title?: string; model?: string }) => 
      createThreadApi(title, model),
    onSuccess: (newThread) => {
      // Add new thread to cache
      queryClient.setQueryData<DBThread[]>(['threads'], (old = []) => [newThread, ...old]);
    },
  });

  const createThread = async (title?: string, model?: string) => {
    try {
      const thread = await createThreadMutation.mutateAsync({ title, model });
      return thread;
    } catch (err) {
      console.error('Failed to create thread:', err);
      return null;
    }
  };

  // Delete thread mutation
  const deleteThreadMutation = useMutation({
    mutationFn: deleteThreadApi,
    onSuccess: (_, threadId) => {
      // Remove thread from cache
      queryClient.setQueryData<DBThread[]>(['threads'], (old = []) => 
        old.filter((t) => t._id !== threadId)
      );
    },
  });

  const deleteThread = async (threadId: string) => {
    try {
      await deleteThreadMutation.mutateAsync(threadId);
      return true;
    } catch (err) {
      console.error('Failed to delete thread:', err);
      return false;
    }
  };

  // Update thread mutation
  const updateThreadMutation = useMutation({
    mutationFn: ({ threadId, updates }: { threadId: string; updates: Partial<DBThread> }) =>
      updateThreadApi(threadId, updates),
    onSuccess: (updatedThread) => {
      // Update thread in cache
      queryClient.setQueryData<DBThread[]>(['threads'], (old = []) =>
        old.map((t) => (t._id === updatedThread._id ? updatedThread : t))
      );
    },
  });

  const updateThread = async (threadId: string, updates: Partial<DBThread>) => {
    try {
      const thread = await updateThreadMutation.mutateAsync({ threadId, updates });
      return thread;
    } catch (err) {
      console.error('Failed to update thread:', err);
      return null;
    }
  };

  return {
    threads,
    loading,
    error: error ? (error as Error).message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['threads'] }),
    createThread,
    deleteThread,
    updateThread,
  };
}

