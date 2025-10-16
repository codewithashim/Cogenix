/**
 * API Routes for Individual Thread
 * GET    /api/threads/[id]  - Get thread by ID
 * PATCH  /api/threads/[id]  - Update thread
 * DELETE /api/threads/[id]  - Delete thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/config/database';
import Thread from '@/features/chat/models/Thread';

// GET - Get thread by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const thread = await Thread.findById(params.id).lean();

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
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch thread',
      },
      { status: 500 }
    );
  }
}

// PATCH - Update thread
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, messages, model } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (messages !== undefined) updateData.messages = messages;
    if (model !== undefined) updateData.aiModel = model;

    const thread = await Thread.findByIdAndUpdate(
      params.id,
      updateData,
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
    console.error('Error updating thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update thread',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const thread = await Thread.findByIdAndDelete(params.id);

    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thread deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete thread',
      },
      { status: 500 }
    );
  }
}

