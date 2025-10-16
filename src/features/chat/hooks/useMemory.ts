/**
 * useMemory Hook
 * 
 * Example hook demonstrating how to use the memory service with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMemoryContexts, clearMemory as clearMemoryService, addMemoryContext, deleteMemoryContext } from '../services';
import type { MemoryContext } from '../types';

/**
 * Hook to manage memory contexts
 */
export function useMemory() {
  const queryClient = useQueryClient();

  // Fetch memory contexts
  const {
    data: contexts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['memory-contexts'],
    queryFn: () => getMemoryContexts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Clear memory mutation
  const clearMemoryMutation = useMutation({
    mutationFn: () => clearMemoryService(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-contexts'] });
    },
  });

  // Add memory context mutation
  const addContextMutation = useMutation({
    mutationFn: (context: Omit<MemoryContext, 'id'>) =>
      addMemoryContext(context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-contexts'] });
    },
  });

  // Delete memory context mutation
  const deleteContextMutation = useMutation({
    mutationFn: (id: string) => deleteMemoryContext(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-contexts'] });
    },
  });

  return {
    // Query
    contexts,
    isLoading,
    error,
    refetch,
    
    // Mutations
    clearMemory: clearMemoryMutation.mutate,
    clearMemoryAsync: clearMemoryMutation.mutateAsync,
    isClearing: clearMemoryMutation.isPending,
    
    addContext: addContextMutation.mutate,
    addContextAsync: addContextMutation.mutateAsync,
    isAdding: addContextMutation.isPending,
    
    deleteContext: deleteContextMutation.mutate,
    deleteContextAsync: deleteContextMutation.mutateAsync,
    isDeleting: deleteContextMutation.isPending,
  };
}

