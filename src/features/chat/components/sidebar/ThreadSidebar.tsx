'use client';

import { DBThread } from '../../types/database';
import { useState } from 'react';

interface ThreadSidebarProps {
  threads: DBThread[];
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onOpenSettings?: () => void;
  loading?: boolean;
}

export default function ThreadSidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onOpenSettings,
  loading = false,
}: ThreadSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const threadDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - threadDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return threadDate.toLocaleDateString();
  };

  const groupThreadsByDate = () => {
    const today: DBThread[] = [];
    const yesterday: DBThread[] = [];
    const lastWeek: DBThread[] = [];
    const older: DBThread[] = [];

    threads.forEach(thread => {
      const threadDate = new Date(thread.updatedAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - threadDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) today.push(thread);
      else if (diffDays === 1) yesterday.push(thread);
      else if (diffDays < 7) lastWeek.push(thread);
      else older.push(thread);
    });

    return { today, yesterday, lastWeek, older };
  };

  const renderThreadGroup = (title: string, threads: DBThread[]) => {
    if (threads.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {threads.map((thread) => (
            <div
              key={thread._id}
              className={`group relative rounded-lg transition-all duration-200 ${
                currentThreadId === thread._id
                  ? 'bg-gray-100 dark:bg-[#2A2A2A]'
                  : 'hover:bg-gray-50 dark:hover:bg-[#2A2A2A]/50'
              }`}
              onMouseEnter={() => setHoveredThread(thread._id!)}
              onMouseLeave={() => setHoveredThread(null)}
            >
              <div
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                onClick={() => {
                  onSelectThread(thread._id!);
                  setIsOpen(false);
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">
                  {thread.title || 'Untitled'}
                </span>
                {hoveredThread === thread._id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this conversation?')) {
                        onDeleteThread(thread._id!);
                      }
                    }}
                    className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    aria-label="Delete thread"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const { today, yesterday, lastWeek, older } = groupThreadsByDate();

  return (
    <>
      {/* Toggle Button (Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-[260px] bg-[#f9f9f9] dark:bg-[#171717] border-r border-gray-200 dark:border-gray-800 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              onNewThread();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2.5 bg-white dark:bg-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="mt-3 text-sm">Loading...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start a new chat!</p>
            </div>
          ) : (
            <>
              {renderThreadGroup('Today', today)}
              {renderThreadGroup('Yesterday', yesterday)}
              {renderThreadGroup('Previous 7 Days', lastWeek)}
              {renderThreadGroup('Older', older)}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Cognix</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">AI Assistant</p>
            </div>
          </div>
          
          {onOpenSettings && (
            <button
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

