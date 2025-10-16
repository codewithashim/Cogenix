/**
 * Database Types for Chat Feature
 */

export interface DBMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface DBThread {
  _id?: string;
  title: string;
  model: string;  // Mapped from aiModel in API
  aiModel?: string;  // Internal database field
  messages: DBMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateThreadInput {
  title?: string;
  model: string;
  messages?: DBMessage[];
}

export interface UpdateThreadInput {
  title?: string;
  messages?: DBMessage[];
}

