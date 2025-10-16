import { NextResponse } from 'next/server';

export async function POST() {
  try {
 
    return NextResponse.json({ 
      success: true,
      message: 'Memory cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing memory:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear memory'
    }, { status: 500 });
  }
}

