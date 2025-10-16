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
        { name: 'llama3', size: '4.7GB' },
        { name: 'mistral', size: '4.1GB' },
        { name: 'codellama', size: '3.8GB' }
      ],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models'
    });
  }
}

