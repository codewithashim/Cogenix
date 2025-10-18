'use client';

import { MemoryContext } from '../../types';
import { useState } from 'react';

interface MemoryDisplayProps {
  contexts: MemoryContext[];
  onClearMemory: () => void;
}

export default function MemoryDisplay({ contexts, onClearMemory }: MemoryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (contexts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span>Memory Recall ({contexts.length})</span>
          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={onClearMemory}
          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all cursor-pointer"
        >
          Clear
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 mt-4 animate-fade-in">
          {contexts.map((context) => (
            <div
              key={context.id}
              className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 text-sm border border-purple-100 dark:border-purple-800/30 hover:border-purple-200 dark:hover:border-purple-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {context.source || 'Unknown Source'}
                </span>
                {context.relevance && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                    {(context.relevance * 100).toFixed(0)}%
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

