interface ChatEmptyStateProps {
  onSendMessage: (message: string) => void;
}

export default function ChatEmptyState({ onSendMessage }: ChatEmptyStateProps) {
  const suggestions = [
    { icon: '💡', title: 'Brainstorm ideas', desc: 'Generate creative solutions' },
    { icon: '📝', title: 'Write content', desc: 'Draft articles and messages' },
    { icon: '🔍', title: 'Research topics', desc: 'Get detailed information' },
    { icon: '🚀', title: 'Plan projects', desc: 'Organize tasks and goals' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
      <div className="mb-8 relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        What are you working on?
      </h2>
      <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
        Start a conversation with your AI assistant. Ask questions, brainstorm ideas, or get help with your work.
      </p>
      
      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(item.title)}
            className="group text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white dark:bg-[#2A2A2A] cursor-pointer"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
