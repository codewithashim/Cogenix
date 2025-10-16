import { NextResponse } from 'next/server';
import { env } from '@/config';

export async function GET() {
  try {
    // Connect to your Ollama backend
    const backendUrl = env.ollamaUrl;
    
    const response = await fetch(`${backendUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models from Ollama');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      models: data.models || [],
      success: true 
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    
    // Return mock data in case of error (for development)
    return NextResponse.json({ 
      models: [
        { name: 'llama2:latest', size: '3.8GB' },
        { name: 'deepseek-r1:8b', size: '5.2GB' }
      ],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models'
    });
  }
}

