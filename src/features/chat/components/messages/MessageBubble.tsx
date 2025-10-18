'use client';

import { useState } from 'react';
import { Message } from '../../types';
import { formatMarkdownForChat, containsMarkdown } from '@/lib';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function MessageBubble({ message, onRegenerate, isRegenerating }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copySuccess, setCopySuccess] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Format message content based on whether it contains markdown
  const formattedContent = isUser
    ? message.content
    : (containsMarkdown(message.content) ? formatMarkdownForChat(message.content) : message.content);

  // Handler functions
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = message.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
    }
  };

  const handleLike = () => {
    if (disliked) {
      setDisliked(false);
    }
    setLiked(!liked);
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
    }
    setDisliked(!disliked);
  };

  const handleKeyDown = (event: React.KeyboardEvent, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  return (
    <div className={`group flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'mt-1' : 'mt-0'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
          } shadow-sm`}>
          {isUser ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'Cognix'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className={`prose prose-sm dark:prose-invert max-w-none ${isUser
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-800 dark:text-gray-200'
          }`}>
          {isUser || !containsMarkdown(message.content) ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed m-0">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-1 h-4 ml-1 bg-gray-900 dark:bg-gray-100 animate-pulse rounded-sm" />
              )}
            </p>
          ) : (
            <div className="break-words leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
              {message.isStreaming && (
                <span className="inline-block w-1 h-4 ml-1 bg-gray-900 dark:bg-gray-100 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Only show on hover and for assistant messages */}
        {!isUser && !message.isStreaming && (
          <div className="space-y-2">
            {/* Copy, Like, Dislike, and Regenerate buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  copySuccess ? 'bg-green-100 dark:bg-green-900/30' : ''
                }`}
                title={copySuccess ? "Copied!" : "Copy message"}
                onClick={handleCopy}
                onKeyDown={(e) => handleKeyDown(e, handleCopy)}
                aria-label="Copy message to clipboard"
              >
                {copySuccess ? (
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  liked ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                }`}
                title={liked ? "Unlike" : "Like this message"}
                onClick={handleLike}
                onKeyDown={(e) => handleKeyDown(e, handleLike)}
                aria-label={liked ? "Unlike this message" : "Like this message"}
              >
                <svg className={`w-4 h-4 ${liked ? 'text-blue-600 dark:text-blue-400 fill-current' : 'text-gray-500 dark:text-gray-400'}`} fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  disliked ? 'bg-red-100 dark:bg-red-900/30' : ''
                }`}
                title={disliked ? "Remove dislike" : "Dislike this message"}
                onClick={handleDislike}
                onKeyDown={(e) => handleKeyDown(e, handleDislike)}
                aria-label={disliked ? "Remove dislike from this message" : "Dislike this message"}
              >
                <svg className={`w-4 h-4 ${disliked ? 'text-red-600 dark:text-red-400 fill-current' : 'text-gray-500 dark:text-gray-400'}`} fill={disliked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
              {/* Regenerate button */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  onKeyDown={(e) => !isRegenerating && handleKeyDown(e, onRegenerate)}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  title={isRegenerating ? "Regenerating..." : "Regenerate response"}
                  aria-label={isRegenerating ? "Regenerating response" : "Regenerate this response"}
                >
                  <svg className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

