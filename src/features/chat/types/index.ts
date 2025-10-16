export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Model {
  name: string;
  size?: string;
  modified_at?: string;
}

export interface MemoryContext {
  id: string;
  content: string;
  relevance?: number;
  source?: string;
}

export interface ChatSettings {
  theme: 'light' | 'dark' | 'system';
  streaming: boolean;
  showTokenCount: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  context?: MemoryContext[];
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

