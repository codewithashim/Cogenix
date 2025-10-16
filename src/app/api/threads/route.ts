/**
 * API Routes for Chat Threads
 * GET    /api/threads       - List all threads
 * POST   /api/threads       - Create new thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/config/database';
import Thread from '@/features/chat/models/Thread';

// GET - List all threads
export async function GET() {
  try {
    await connectDB();

    const threads = await Thread.find()
      .sort({ updatedAt: -1 })
      .select('_id title aiModel createdAt updatedAt messages')
      .lean();

    // Add message count and map aiModel to model for consistency
    const threadsWithCount = threads.map((thread: any) => ({
      ...thread,
      model: thread.aiModel,
      messageCount: thread.messages?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      threads: threadsWithCount,
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch threads',
      },
      { status: 500 }
    );
  }
}

// POST - Create new thread
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, model, messages } = body;

    // Generate title from first message if not provided
    const threadTitle =
      title ||
      (messages && messages.length > 0
        ? messages[0].content.substring(0, 50) + '...'
        : 'New Conversation');

    const thread = await Thread.create({
      title: threadTitle,
      aiModel: model || 'llama2:latest',
      messages: messages || [],
    });

    return NextResponse.json({
      success: true,
      thread: {
        _id: thread._id,
        title: thread.title,
        model: thread.aiModel,
        messages: thread.messages,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create thread',
      },
      { status: 500 }
    );
  }
}

