import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDocsContext } from '@/lib/docsLoader';

// Initialize the Gemini API client. 
// Note: The API key is loaded from the environment variable.
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Helper utility to retry a function call with exponential backoff
 * in case of transient API failures (e.g. 503 Service Unavailable, 429 Rate Limits).
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = error.message || '';
    const isTransientError =
      errorStr.includes('503') ||
      errorStr.includes('Service Unavailable') ||
      errorStr.includes('429') ||
      errorStr.includes('ResourceExhausted') ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('high demand') ||
      error.status === 503 ||
      error.status === 429;

    if (retries > 0 && isTransientError) {
      console.warn(`Transient Gemini API error (503/429) encountered. Retrying in ${delay}ms... (Retries left: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * backoffFactor, backoffFactor);
    }
    throw error;
  }
}

/**
 * Sends a message to the Gemini 2.5 Flash model with the project documentation as context,
 * enforcing Kashvi's strict response constraints and assistant personality.
 */
export async function getKashviResponse(
  message: string,
  history: ChatHistoryItem[] = []
): Promise<string> {
  try {
    const genAI = getGenAIClient();
    
    // Load documentation context
    const docsContext = getDocsContext();

    // Configure the system prompt for Kashvi
    const systemPrompt = `You are Kashvi, the official AI assistant for the Night Owl Designers (NOD) platform.

Your role:
- Answer questions about the Night Owl Designers platform, its features, workflows, services, roles, and usage.
- Always be friendly, concise, and professional.

CRITICAL RULES:
1. ONLY answer using the provided project documentation context below.
2. Do not invent, assume, or extrapolate any information. If details are not in the documentation, you do not know them.
3. If the answer to the user's question cannot be found or deduced directly from the provided documentation context, you MUST politely and exactly reply:
"I couldn't find that information in the current project documentation."
Do not add any other suggestions or commentary if the information is missing.

--- START OF PROJECT DOCUMENTATION ---
${docsContext}
--- END OF PROJECT DOCUMENTATION ---`;

    // Initialize the model with Gemini 2.5 Flash and the system prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Format the history to match the Gemini SDK requirements
    // Gemini SDK expects roles to alternate: 'user' and 'model'
    const mappedHistory = history.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    }));

    // The Gemini chat session history MUST start with a 'user' message.
    // If the greeting message (role: 'model') is at the beginning, we slice it out.
    const firstUserIndex = mappedHistory.findIndex((item) => item.role === 'user');
    const formattedHistory = firstUserIndex !== -1 ? mappedHistory.slice(firstUserIndex) : [];

    // Start a conversational chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1, // low temperature to ensure strict adherence to context
      },
    });

    // Send the message and await the reply (using retry with backoff for transient errors)
    const result = await retryWithBackoff(async () => {
      return await chat.sendMessage(message);
    }, 3, 1000);
    
    const response = await result.response;
    const responseText = response.text();

    return responseText.trim();
  } catch (error: any) {
    console.error('Error generating response from Kashvi:', error);
    
    // Provide user-friendly instructions if transient error persist or rate limits are reached
    if (error.message && (error.message.includes('503') || error.message.includes('demand'))) {
      return 'Kashvi is currently experiencing high demand. Please try asking your question again in a few seconds.';
    }
    
    // If API key is missing or invalid, provide a clean developer-friendly warning
    if (error.message && error.message.includes('API key')) {
      return 'Kashvi is currently offline. Please configure a valid GEMINI_API_KEY in the environment variables.';
    }
    
    throw error;
  }
}
