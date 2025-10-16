/**
 * Hook for managing chat threads
 * Updated to use the centralized thread service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DBThread } from '../types/database';
import { getAllThreads, createThread as createThreadService, updateThread as updateThreadService, deleteThread as deleteThreadService } from '../services';

export function useThreads() {
  const queryClient = useQueryClient();

  // Fetch all threads with React Query - now using thread service functions
  const { data: threads = [], isLoading: loading, error } = useQuery({
    queryKey: ['threads'],
    queryFn: () => getAllThreads() as unknown as Promise<DBThread[]>,
  });

  // Create thread mutation - now using thread service function
  const createThreadMutation = useMutation({
    mutationFn: ({ title, model }: { title?: string; model?: string }) => 
      createThreadService({ title, firstMessage: model }) as unknown as Promise<DBThread>,
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

  // Delete thread mutation - now using thread service function
  const deleteThreadMutation = useMutation({
    mutationFn: (threadId: string) => deleteThreadService(threadId),
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

  // Update thread mutation - now using thread service function
  const updateThreadMutation = useMutation({
    mutationFn: ({ threadId, updates }: { threadId: string; updates: Partial<DBThread> }) =>
      updateThreadService(threadId, updates) as unknown as Promise<DBThread>,
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

