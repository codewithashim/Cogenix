import ModelSelector from '../controls/ModelSelector';

interface ChatHeaderProps {
  threadTitle?: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ChatHeader({ threadTitle, selectedModel, onModelChange }: ChatHeaderProps) {
  return (
    <div className="flex bg-white dark:bg-[#212121] border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-3 items-center justify-between sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-[#212121]/80">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
          {threadTitle || 'Cognix'}
        </h1>
        <div className="hidden md:block">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />
        </div>
      </div>
    </div>
  );
}
