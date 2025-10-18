'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  onAttachFile?: () => void;
  onVoiceInput?: () => void;
}

export default function ChatInput({
  onSendMessage,
  onStop,
  disabled = false,
  placeholder = "Ask anything",
  onAttachFile,
  onVoiceInput
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  return (
    <div className="relative w-full">
      {/* Main input container with pill shape and blue border */}
      <div className="flex items-center gap-4 px-6 py-4 bg-gray-100 dark:bg-[#363636] rounded-4xl transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
             focus:outline-none focus:ring-0 focus-visible:ring-0 
             disabled:opacity-50 max-h-[200px] min-h-[24px] text-base leading-relaxed "
          rows={1}
          style={{
            height: 'auto',
            minHeight: '24px',
          }}
        />


        {/* Right side - Action button */}
        <div className="flex items-center flex-shrink-0">
          {disabled && onStop ? (
            <button
              onClick={onStop}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 flex items-center justify-center cursor-pointer"
              aria-label="Stop generation"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onVoiceInput) {
                  onVoiceInput();
                } else {
                  handleSend();
                }
              }}
              disabled={disabled}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-[#404040] dark:hover:bg-[#4A4A4A] text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label={onVoiceInput ? "Voice input" : "Send message"}
              type="button"
            >
              {disabled ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : onVoiceInput ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  {/* Microphone icon */}
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  {/* Send arrow icon */}
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 opacity-75">
        {disabled && onStop
          ? 'Click the stop button to abort the response'
          : 'Press Enter to send, Shift + Enter for new line'}
      </p>
    </div>
  );
}

