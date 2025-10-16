/**
 * API Route for Adding Messages to Thread
 * POST /api/threads/[id]/messages - Add message(s) to thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/config/database';
import Thread from '@/features/chat/models/Thread';

// POST - Add message(s) to thread
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add timestamps to messages if not present
    const messagesWithTimestamp = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp || new Date(),
    }));

    const thread = await Thread.findByIdAndUpdate(
      params.id,
      {
        $push: { messages: { $each: messagesWithTimestamp } },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Map aiModel to model for consistency
    const threadWithModel = {
      ...thread,
      model: (thread as any).aiModel,
    };

    return NextResponse.json({
      success: true,
      thread: threadWithModel,
    });
  } catch (error) {
    console.error('Error adding messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add messages',
      },
      { status: 500 }
    );
  }
}

