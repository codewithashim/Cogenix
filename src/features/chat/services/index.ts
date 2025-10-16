/**
 * Services Index
 * 
 * Central export point for all service modules
 */

// Chat service functions
export {
  sendMessage,
  sendStreamingMessage,
  sendStreamingMessageFetch,
  type SendMessageRequest,
  type SendMessageResponse,
} from './chat.service';

// Thread service functions
export {
  getAllThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  getThreadMessages,
  addMessageToThread,
  type CreateThreadRequest,
  type UpdateThreadRequest,
  type ThreadResponse,
  type GetMessagesResponse,
} from './thread.service';

// Model service functions
export {
  getModels,
  getModelDetails,
  isModelAvailable,
  type ModelsListResponse,
  type ModelDetails,
} from './model.service';

// Memory service functions
export {
  getMemoryContexts,
  clearMemory,
  addMemoryContext,
  updateMemoryContext,
  deleteMemoryContext,
  type MemoryResponse,
  type ClearMemoryResponse,
} from './memory.service';

