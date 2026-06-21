import { NextRequest, NextResponse } from 'next/server';
import { getKashviResponse } from '@/services/gemini';

/**
 * POST /api/chat
 * Handles incoming chat messages for Kashvi, the AI documentation assistant.
 * Expects JSON body with:
 * - message: string (the user's latest query)
 * - history: Array of { role: 'user' | 'assistant', content: string } (optional conversation history)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    // Validate request parameters
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing "message" parameter in request body.' },
        { status: 400 }
      );
    }

    if (history && !Array.isArray(history)) {
      return NextResponse.json(
        { error: '"history" parameter must be an array of chat history items.' },
        { status: 400 }
      );
    }

    // Call the Gemini service to fetch the context-bounded answer from Kashvi
    const aiResponse = await getKashviResponse(message, history || []);

    return NextResponse.json({
      response: aiResponse,
    });
  } catch (error: any) {
    console.error('Error in Kashvi API route:', error);
    
    // Check for missing API key configuration
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          response: 'Kashvi is currently offline. Please configure GEMINI_API_KEY in the environment variables.',
          error: 'Missing GEMINI_API_KEY environment variable.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        response: 'Sorry, I encountered an internal server error. Please try again later.',
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
