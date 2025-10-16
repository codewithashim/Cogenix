/**
 * MongoDB Model for Chat Threads
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IThread extends Document {
  title: string;
  aiModel: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ThreadSchema = new Schema<IThread>(
  {
    title: {
      type: String,
      required: true,
      default: 'New Conversation',
    },
    aiModel: {
      type: String,
      required: true,
      default: 'llama2',
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
ThreadSchema.index({ createdAt: -1 });
ThreadSchema.index({ updatedAt: -1 });

// Prevent model recompilation in development (Next.js hot reload)
export default mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);

