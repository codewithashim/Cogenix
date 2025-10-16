import { NextRequest } from 'next/server';
import { env } from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model, stream = true } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const backendUrl = env.ollamaUrl;
    
    // Call your backend API (Ollama or custom backend)
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || env.defaultModel,
        messages,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from backend');
    }

    // If streaming is enabled, return a streaming response
    if (stream && response.body) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              
              // Format the response for the frontend
              if (json.message?.content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    content: json.message.content,
                    done: json.done || false,
                    context: json.context || [],
                  })}\n\n`)
                );
              }
              
              if (json.done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        },
      });

      return new Response(response.body.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const data = await response.json();
    return new Response(
      JSON.stringify({
        content: data.message?.content || data.response || '',
        model: data.model,
        context: data.context || [],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        content: 'Sorry, I encountered an error processing your request.' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

