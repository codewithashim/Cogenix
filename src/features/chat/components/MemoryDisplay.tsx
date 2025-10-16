'use client';

import { MemoryContext } from '../types';
import { useState } from 'react';

interface MemoryDisplayProps {
  contexts: MemoryContext[];
  onClearMemory: () => void;
}

export default function MemoryDisplay({ contexts, onClearMemory }: MemoryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (contexts.length === 0) return null;

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200"
        >
          <span>🧠</span>
          <span>Memory Recall ({contexts.length} contexts)</span>
          <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        </button>
        <button
          onClick={onClearMemory}
          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 underline"
        >
          Clear Memory
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 mt-3">
          {contexts.map((context) => (
            <div
              key={context.id}
              className="bg-white dark:bg-gray-800 rounded p-3 text-sm border border-purple-100 dark:border-purple-700"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {context.source || 'Unknown Source'}
                </span>
                {context.relevance && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Relevance: {(context.relevance * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                {context.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

